import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { City, CitySchema } from './schema/city.schema';
import { Country, CountrySchema } from './schema/country.schema';

import { LocationsService } from './locations.service';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: Country.name, schema: CountrySchema },
      { name: City.name, schema: CitySchema },
    ]),
  ],
  providers: [LocationsService],
  exports: [LocationsService],
})
export class LocationsModule {}
