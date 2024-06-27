import { Controller, Get, Post, Body, Res, ValidationPipe, Req, Query, UseGuards, Param, ParseIntPipe } from '@nestjs/common';
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

  @Get("verify/:userId/:uniqueString")
  async verifyEventee(@Param("userId") userId:string, @Param("uniqueString") uniqueString:string, @Res() res:Response) {
    this.usersService.verifyUser(userId, uniqueString, res)
  }

  @Post('/login')
   async login(@Body(new ValidationPipe) LoginUserDto:LoginUserDto,@Res() res:Response) {
     await this.usersService.login(LoginUserDto, res)
   }

   @Get('/app/regions')
   async provideRegions(@Query("email") email:string, @Query("api_key") api_key:string, @Res() res:Response) {
     await this.usersService.provideRegions(email, api_key, res)
   }

   @Get('/app/states')
   async provideStates(@Query("email") email:string, @Query("api_key") api_key:string, @Res() res:Response) {
     await this.usersService.provideStates(email, api_key, res)
   }

   @Get('/app/local_governments')
   async provideLocalGovernments(@Query("email") email:string, @Query("api_key") api_key:string, @Res() res:Response) {
     await this.usersService.provideLocalGovernments(email, api_key, res)
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

   @Get('/upgrade')
   async upgrade(@Res() res:Response, @Req() req:Request) {
     this.usersService.upgrade(req, res)
    }


    @Post('/paystack/callback')
    async processPaystackCallBack(@Res() res:Response, @Req() req:Request) {
     this.usersService.processPaystackCallBack(req, res)
     }

     @Get('/paystack/success')
    async getPaymentSuccessPage(@Res() res:Response) {
      this.usersService.getPaymentSuccessPage(res) 
     }
  
}
