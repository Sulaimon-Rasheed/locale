import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { userSchema } from './users.model';
import { AuthService } from 'src/authentication/auth';

@Module({
  imports:[MongooseModule.forFeature([{name:"User", schema:userSchema}])],
  controllers: [UsersController],
  providers: [UsersService, AuthService],
})
export class UsersModule {}
