import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { MongooseModule } from '@nestjs/mongoose';

import configuration from './configuration';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { CacheModule } from './cache/cache.module';
import { LocationsModule } from './locations/locations.module';
import { LocationsController } from './locations/locations.controller';
import { TripsController } from './trips/trips.controller';
import { TripsModule } from './trips/trips.module';
import { UsersController } from './users/users.controller';
import { UsersModule } from './users/users.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
    ThrottlerModule.forRoot({
      ttl: 30,
      limit: 20,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    CacheModule,
    LocationsModule,
    TripsModule,
    UsersModule,
    MailModule,
  ],
  controllers: [
    AppController,
    AuthController,
    LocationsController,
    TripsController,
    UsersController,
  ],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
