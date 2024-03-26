import { Controller, Get, Post, Body, Res, ValidationPipe, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Request, Response } from 'express';
import { LoginUserDto } from './dto/login-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post("/signup")
  async createUser(@Body(new ValidationPipe) createUserDto:CreateUserDto, @Res() res:Response){
    await this.usersService.createUser(createUserDto, res)
  }

  @Post('/login')
   async login(@Body(new ValidationPipe) LoginUserDto:LoginUserDto,@Res() res:Response) {
     await this.usersService.login(LoginUserDto, res)
   }

   @Get('/getAllregions')
   getAllregions(@Req() req:Request, @Res() res:Response) {
     this.usersService.getAllregions(req, res)
   }

   @Get('/getAllstates')
   getAllstates(@Req() req:Request, @Res() res:Response) {
     this.usersService.getAllstates(req, res)
   }

   @Get('/getAllLGA')
   getAllLGA(@Req() req:Request, @Res() res:Response) {
     this.usersService.getAllLGA(req, res)
   }
  
}
