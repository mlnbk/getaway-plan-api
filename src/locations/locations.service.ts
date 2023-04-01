import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CityDto } from './dto/city.dto';
import { CountryDto } from './dto/country.dto';

import { City, CityDocument } from './schema/city.schema';
import { Country, CountryDocument } from './schema/country.schema';

@Injectable()
export class LocationsService {
  private readonly logger = new Logger(LocationsService.name);
  constructor(
    @InjectModel(City.name) private readonly cityModel: Model<CityDocument>,
    @InjectModel(Country.name)
    private readonly countryModel: Model<CountryDocument>,
  ) {}

  async addCitiesToDb(cities: CityDto[]) {
    await this.cityModel.deleteMany({});
    return this.cityModel.insertMany(cities);
  }

  async addCountriesToDb(countries: CountryDto[]) {
    await this.countryModel.deleteMany({});
    return this.countryModel.insertMany(countries);
  }

  async getCountryDoc(country: string) {
    return this.countryModel.findOne({ name: country });
  }

  async getCountries() {
    return this.countryModel.find({});
  }

  async getCitiesForCountryCode(countryCode: string) {
    return this.cityModel.find({ countryCode });
  }
}
