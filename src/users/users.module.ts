import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { userSchema } from './users.model';
import { AuthService } from 'src/authentication/auth';
import { userVerificationSchema } from './verifiedUsers.model';
import { transactionSchema } from 'src/transaction/transaction.model';
import { CurrencyService } from 'src/exchanger/exchanger';
import { WinstonLoggerService } from 'src/logger/logger.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports:[MongooseModule.forFeature([{name:"User", schema:userSchema}, {name:"UserVerification", schema:userVerificationSchema}, {name:"Transaction", schema:transactionSchema}]),ConfigModule.forRoot()],
  controllers: [UsersController],
  providers: [UsersService, AuthService, CurrencyService,WinstonLoggerService, ConfigService],
  exports: [CurrencyService],
})
export class UsersModule {}
