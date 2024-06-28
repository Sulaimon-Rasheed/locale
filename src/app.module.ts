import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { MongooseModule, MongooseModuleFactoryOptions } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { GlobalExceptionFilter } from './globalError/global.filter';
import { APP_FILTER } from '@nestjs/core';
import { WinstonLoggerService } from './logger/logger.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UsersModule,
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          uri: configService.get<string>('DB_URL'),
          useNewUrlParser: true,
          useUnifiedTopology: true,
        };
      },
    }), 
    ThrottlerModule.forRoot([{ ttl: 60 * 1000, limit: 10 }]),
  ],
  controllers: [AppController],
  providers: [AppService, 
    {
    provide: APP_FILTER,
    useClass: GlobalExceptionFilter,
  }, WinstonLoggerService
],
})
export class AppModule {}
