import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import * as dotenv from "dotenv"
dotenv.config()
import { ThrottlerModule } from '@nestjs/throttler';
import { GlobalExceptionFilter } from './globalError/global.filter';
import { APP_FILTER } from '@nestjs/core';

@Module({
  imports: [
    UsersModule, MongooseModule.forRoot(process.env.DB_URL), 
    ThrottlerModule.forRoot([{ ttl: 60 * 1000, limit: 10 }]),
  ],
  controllers: [AppController],
  providers: [AppService, 
    {
    provide: APP_FILTER,
    useClass: GlobalExceptionFilter,
  }
],
})
export class AppModule {}
