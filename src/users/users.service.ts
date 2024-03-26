import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {v4 as uuidv4} from "uuid"
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './users.model';
import * as encoding from "../Utils/bcrypt"
import {Request, Response} from "express"
import { LoginUserDto } from './dto/login-user.dto';
import { AuthService } from 'src/authentication/auth'
import * as fs from "fs"
import * as path from "path"


@Injectable()
export class UsersService {
  constructor(
    @InjectModel("User") private readonly userModel:Model<User>,
    private readonly Authservice:AuthService
  ){}

  // ---------------- Creating users-----------------------------------
  async createUser(createUserDto:CreateUserDto, res:Response){
   try{
    const existingUser: object = await this.userModel.findOne({
      email: createUserDto.email,
    });
    if (existingUser) {
      throw new ConflictException("User already exist.")
    }

    const api_key = uuidv4()
    const hashedApi_key = await encoding.encodeApi_key(api_key);

    const newEventee = await this.userModel.create({
      first_name: createUserDto.first_name,
      last_name: createUserDto.last_name,
      email: createUserDto.email,
      phoneNum: createUserDto.phoneNum,
      api_key:hashedApi_key,
    });

    return res.json({
      statusCode:201,
      message:"Successful signup.Keep your api_key save as you will need it to login to your account.",
      api_key:api_key
    })

   }catch(err){
    throw new Error(err.message)
   }
  }



  //-------------Logging in Users----------------------------------

  async login(LoginUserDto: LoginUserDto, res: Response) {
    try {
      const { email, api_key } = LoginUserDto;
      let user = await this.userModel.findOne({ email });

      if (!user) {
        return res.json({
          statusCode:404,
          message:`Opps!! User not found`
        })
      }

      const valid = await encoding.validateEncodedString(
        api_key,
        user.api_key,
      );

      if (!valid) {
        return res.json({
          statusCode:401,
          message:`Opps!! email or api_key is incorrect.`
        })
      }

      const token: string = this.Authservice.generateJwtToken(
        user._id,
        user.email,
        user.first_name,
      );

      res.cookie('jwt', token, { maxAge: 60 * 60 * 1000 });
      return res.json({
        statusCode:200,
        message:"Successful login",
      })
    } catch (err) {
      throw new Error(err.message)
    }
  }


  //-----Getting All regions--------------------------

  async getAllregions(req:Request, res:Response){
    try{
    // await this.Authservice.ensureLogin(req, res)
      console.log("I am here")
      console.log(__dirname)
    const regionsPath = `../locale/src/DB/region.ts`
    fs.readFile(regionsPath, "utf8", (err, data) => {
      if (err) {
       res.json({
        statusCode:404,
        error:err.message
       })
      }
      res.json({
        all_regions:JSON.parse(data)
      });
    });

    }catch(err){
      throw new Error(err.message)
    }
  }


    //-----Getting All states--------------------------

    async getAllstates(req:Request, res:Response){
      try{
      // await this.Authservice.ensureLogin(req, res)
        console.log("I am here")
        console.log(__dirname)
      const statesPath = `../locale/src/DB/state.ts`
      fs.readFile(statesPath, "utf8", (err, data) => {
        if (err) {
         res.json({
          statusCode:404,
          error:err.message
         })
        }
        res.json({
          all_states:JSON.parse(data)
        });
      });
  
      }catch(err){
        throw new Error(err.message)
      }
    }

    //-----Getting All L.G.A--------------------------

    async getAllLGA(req:Request, res:Response){
      try{
      // await this.Authservice.ensureLogin(req, res)
        console.log("I am here")
        console.log(__dirname)
      const statesPath = `../locale/src/DB/local-gov.ts`
      fs.readFile(statesPath, "utf8", (err, data) => {
        if (err) {
         res.json({
          statusCode:404,
          error:err.message
         })
        }
        res.json({
          all_LGA:JSON.parse(data)
        });
      });
  
      }catch(err){
        throw new Error(err.message)
      }
    }


}
