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
    const citiesUrl = this.configServie.get('citiesUrl');
    if (!countriesUrl || !citiesUrl) {
      throw new BadRequestException(
        'No URL available to fetch country/city data from.',
      );
    }
    try {
      const countryDataResponse = await fetch(countriesUrl);
      if (!countryDataResponse) return;
      const countryData = await countryDataResponse.json();
      const transformedCountries: CountryDto[] = [];
      const transformedCities: CityDto[] = [];
      for (const country of countryData?.data) {
        const countryDto = plainToClass(CountryDto, {
          name: country.name,
          code: country.Iso2,
        });
        const errors = await validate(countryDto);
        if (errors.length > 0) {
          this.logger.debug(
            'Country validation failed, value excluded from array',
            { countryDto },
          );
        } else {
          transformedCountries.push(countryDto);

          const cityDataResponse = await fetch(citiesUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ iso2: country.Iso2 }),
          });
          try {
            const cityData = await cityDataResponse.json();
            for (const city of cityData.data) {
              const cityDto = plainToClass(CityDto, {
                name: city,
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

  @Get('/country/cities')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe(validationPipeOptions))
  @ApiOkResponse({ type: [CityDto] })
  async getCitiesForCountry(@Query() getCitiesDto: GetCitiesForCountryDto) {
    const cacheKey = `locations:${getCitiesDto.country}:cities`;
    const cacheResult = await this.cacheService.getItem(cacheKey);
    if (cacheResult) {
      return cacheResult;
    }

    const cities = await this.locationsService.getCitiesForCountry(
      getCitiesDto.country,
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
