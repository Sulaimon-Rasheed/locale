import { Controller, Get, Post, Body, Res, ValidationPipe, Req, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Request, Response } from 'express';
import { LoginUserDto } from './dto/login-user.dto';
import { ThrottlerGuard } from '@nestjs/throttler';

@Controller('users')
@UseGuards(ThrottlerGuard)
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

   @Get('/getOneregion')
   getOneRegion(@Query("region_name") region_name:string, @Req() req:Request, @Res() res:Response) {
     this.usersService.getOneRegion(region_name,req, res)
   }

   @Get('/getOnestate')
   getOneState(@Query("state_name") state_name:string, @Req() req:Request, @Res() res:Response) {
     this.usersService.getOneState(state_name,req, res)
   }

   @Get('/getOneLG')
   getOneLG(@Query("LG_name") LG_name:string, @Req() req:Request, @Res() res:Response) {
     this.usersService.getOneLG(LG_name,req, res)
   }
  
}
