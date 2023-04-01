import {
  BadRequestException,
  Controller,
  Get,
  Logger,
  Post,
  Query,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

import { Roles } from '../decorators/roles.decorator';

import { AuthenticatedRequest, Role, validationPipeOptions } from '../types';
import { CityDto } from './dto/city.dto';
import { CountryDto } from './dto/country.dto';
import { GetCitiesForCountryDto } from './dto/get-cities-for-country.dto';

import { CacheService } from '../cache/cache.service';
import { LocationsService } from './locations.service';

@ApiTags('locations')
@Controller('locations')
@UseGuards(JwtAuthGuard)
export class LocationsController {
  private readonly logger = new Logger(LocationsController.name);

  constructor(
    private readonly cacheService: CacheService,
    private readonly configServie: ConfigService,
    private readonly locationsService: LocationsService,
  ) {}

  @Post('/seed-db')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  @ApiOperation({
    description:
      'NOTE: this endpoint updates the database with new country and city data! Deletes all previous data!',
  })
  async seedCountriesAndCitiesToDB(@Request() request: AuthenticatedRequest) {
    const seedKey = 'seed-lock';
    const item = await this.cacheService.getItem(seedKey);
    if (item) {
      throw new BadRequestException('Cannot seed data simultaneously!');
    }
    await this.cacheService.setItem(seedKey, request.user._id, 60);

    const countriesUrl = this.configServie.get('countriesUrl');
    const countryImageBaseUrl = this.configServie.get('countryImageUrl');
    const citiesUrl = this.configServie.get('citiesUrl');
    const cityApiUser = this.configServie.get('GEONAMES_USERNAME');
    const pexelsAccessKey = this.configServie.get('PEXELS_API_KEY');
    try {
      if (!countriesUrl || !citiesUrl) {
        throw new BadRequestException(
          'No URL available to fetch country/city data from.',
        );
      }
      if (!cityApiUser) {
        throw new BadRequestException(
          'No username available for geonames.org API.',
        );
      }
      if (!countryImageBaseUrl || !pexelsAccessKey) {
        throw new BadRequestException(
          'No env vars available for stock image fetching.',
        );
      }
      const countryDataResponse = await fetch(countriesUrl);
      if (!countryDataResponse) return;
      const countryData = await countryDataResponse.json();
      const transformedCountries: CountryDto[] = [];
      const transformedCities: CityDto[] = [];
      for (const country of countryData?.data) {
        const countryImageResponse = await fetch(
          `${countryImageBaseUrl}?query=${country.name}&per_page=1`,
          {
            headers: {
              authorization: pexelsAccessKey,
            },
          },
        );
        let countryImageUrl: string | undefined;
        if (countryImageResponse) {
          try {
            const countryImageData = await countryImageResponse.json();
            countryImageUrl =
              countryImageData?.photos?.[0].src?.landscape ?? undefined;
          } catch (error) {
            this.logger.error(
              'Error while parsing country image url response',
              error,
            );
          }
        }
        const countryDto = plainToClass(CountryDto, {
          name: country.name,
          code: country.Iso2,
          imageUrl: countryImageUrl,
        });
        const errors = await validate(countryDto);
        if (errors.length > 0) {
          this.logger.debug(
            'Country validation failed, value excluded from array',
            { countryDto },
          );
        } else {
          transformedCountries.push(countryDto);
          const cityDataResponse = await fetch(
            `${citiesUrl}&username=${cityApiUser}&country=${country.Iso2}`,
          );
          try {
            const cityData = await cityDataResponse.json();
            const filteredCityData = cityData?.geonames?.filter(
              (city: any) => city.countryCode === country.Iso2,
            );
            for (const city of filteredCityData) {
              const cityDto = plainToClass(CityDto, {
                name: city.name,
                countryCode: country.Iso2,
              });
              const errors = await validate(cityDto);
              if (errors.length > 0) {
                this.logger.debug(
                  'City validation failed, value excluded from array',
                  { cityDto },
                );
              } else {
                transformedCities.push(cityDto);
              }
            }
          } catch (error) {
            this.logger.error('Error while parsing city response', error);
          }
        }
      }
      await this.locationsService.addCitiesToDb(transformedCities);
      await this.locationsService.addCountriesToDb(transformedCountries);
      await this.cacheService.invalidateKeys('*locations*');
    } catch (error) {
      this.logger.error('Failed to seed DB:', error);
    } finally {
      await this.cacheService.invalidateKeys(seedKey);
      this.logger.log('Database seed finished');
    }
  }

  @Get('/countries')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe(validationPipeOptions))
  @ApiOkResponse({ type: [CountryDto] })
  async getCountries() {
    const cacheKey = 'locations:countries';
    const cacheResult = await this.cacheService.getItem(cacheKey);
    if (cacheResult) {
      return cacheResult;
    }

    const countries = await this.locationsService.getCountries();
    const getCountriesResponse = countries.map((country) =>
      plainToClass(CountryDto, country.toObject(), {
        excludeExtraneousValues: true,
      }),
    );

    await this.cacheService.setItem(cacheKey, getCountriesResponse);
    return getCountriesResponse;
  }

  @Get('/cities')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe(validationPipeOptions))
  @ApiOkResponse({ type: [CityDto] })
  async getCitiesForCountry(@Query() getCitiesDto: GetCitiesForCountryDto) {
    const cacheKey = `locations:${getCitiesDto.countryCode}:cities`;
    const cacheResult = await this.cacheService.getItem(cacheKey);
    if (cacheResult) {
      return cacheResult;
    }

    const cities = await this.locationsService.getCitiesForCountryCode(
      getCitiesDto.countryCode,
    );

    const getCitiesResponse = cities.map((city) =>
      plainToClass(CityDto, city.toObject(), {
        excludeExtraneousValues: true,
      }),
    );

    await this.cacheService.setItem(cacheKey, getCitiesResponse);
    return getCitiesResponse;
  }
}
