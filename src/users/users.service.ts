import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import {v4 as uuidv4} from "uuid"
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './users.model';
import * as encoding from "../Utils/bcrypt"
import {Request, Response} from "express"
import { LoginUserDto } from './dto/login-user.dto';
import { AuthService } from 'src/authentication/auth'
import * as fs from "fs"
import { UserVerification } from './verifiedUsers.model';
import * as mailService from '../Utils/mailer';
import { CurrencyService } from 'src/exchanger/exchanger';
import { Transaction } from 'src/transaction/transaction.model';
import axios from 'axios';
import { WinstonLoggerService } from 'src/logger/logger.service';
import * as dotenv from "dotenv"
dotenv.config()
import states, { State } from "../DB/state"
import lgs, { Lg } from "../DB/local-gov"
import regions, { Region } from "../DB/region"


@Injectable()
export class UsersService {
  constructor(
    @InjectModel("User") private readonly userModel:Model<User>,
    private readonly Authservice:AuthService,
    @InjectModel('UserVerification')
    private readonly userVerificationModel: Model<UserVerification>,
    @InjectModel('Transaction')
    private readonly transactionModel: Model<Transaction>,
    private readonly currencyService :CurrencyService, 
    private readonly loggerService:WinstonLoggerService,
  ){}

  // ---------------- Creating users-----------------------------------
  async createUser(createUserDto:CreateUserDto, res:Response){
   try{
    this.loggerService.log('Creating a user...');

    const existingUser: object = await this.userModel.findOne({
      email: createUserDto.email,
    });
    if (existingUser) {
      throw new ConflictException("User already exist.")
    }

    const api_key = uuidv4()
    const hashedApi_key = await encoding.encodeApi_key(api_key);

    const newUser = await this.userModel.create({
      first_name: createUserDto.first_name,
      last_name: createUserDto.last_name,
      email: createUserDto.email,
      phoneNum: createUserDto.phoneNum,
      api_key:hashedApi_key,
      subscriptionLevel: 'free'
    });

    const currUrl = 'http://localhost:5000';
      let uniqueString = newUser._id + uuidv4();
      const hashedUniqueString = await encoding.encodeApi_key(uniqueString);

    await this.userVerificationModel.create({
      userId: newUser._id,
      uniqueString: hashedUniqueString,
      creation_date: Date.now(),
      expiring_date: Date.now() + 21600000,
    });

    await mailService.sendEmail({
      email: createUserDto.email,
      subject: 'Verify your email',
      html: `<div style = "background-color:lightgrey; padding:16px"; border-radius:20px>
        <p>Hi, ${createUserDto.first_name}</P>
        <p>Thank you for opening account with Locale.</p>
        <h2>Login details</h2>
        <p><strong>email:</strong> ${createUserDto.email}</p>
        <p><strong>api_key:</strong> ${api_key}</p>

        <p>However , we need to confirm it is you before being authorized to login to your account</P>
            <p>Click <a href=${
              currUrl +
              '/users/verify/' +
              newUser._id +
              '/' +
              uniqueString
            }>here</a> to get authorized</P>
            <p>This link <b>will expire in the next 6hrs</b></p>
            <p>With <b>Locale</b>, You are assured with up to date infomations on the regions, states and local-governments in Nigeria .</P>
            <p>Click this link: <a href=${
              currUrl +
              '/users/verify/' +
              newUser._id +
              '/' +
              uniqueString
            } >${currUrl + '/users/verify/' + newUser._id + '/' + uniqueString}<a/></p>
            </div>`,
    });

    this.loggerService.log('User created successfully');

    return res.json({
      statusCode:201,
      message:"Successful signup. Check your email for login details and verification link.",
    })

   }catch(err){
    this.loggerService.error('Something broke', err.stack);
    return res.status(500).json({
      statusCode: 500,
      message: err.message,
    });
   }
  }

  //-------------------------------- Verifying the user email verification link----------------------------------------------------
  async verifyUser(userId: string, uniqueString: string, res: Response) {
    try {
      let user = await this.userVerificationModel.findOne({
        userId: userId,
      });

      if (!user) {
        return res.json({
          statusCode:404,
          message:"Opps!! user not found."
        })
      }

      if (user.expiring_date.getTime() < Date.now()) {
        await this.userVerificationModel.findByIdAndDelete(userId);
        await this.userModel.findByIdAndDelete(userId);
      }

      const valid = await encoding.validateEncodedString(
        uniqueString,
        user.uniqueString,
      );
      if (!valid) {
        return res.status(400).json({
          statusCode:400,
          message:"Opps!! It seems you have altered your verification link.Try again"
        })
      }

      await this.userModel.findByIdAndUpdate(
        userId,
        { verified: true },
      );
      await this.userVerificationModel.findByIdAndDelete(userId);
      return res.json({
        statusCode:200,
        message:"Successful Verification"
      })
    } catch (err) {
      this.loggerService.error('Something broke', err.stack);
      return res.status(500).json({
        statusCode: 500,
        message: err.message,
      });
    }
  }



  //-------------Logging in Users----------------------------------

  async login(LoginUserDto: LoginUserDto, res: Response) {
    try {
      this.loggerService.log('User logging in---');
      const { email, api_key } = LoginUserDto;
      let user = await this.userModel.findOne({ email });

      if (!user) {
        return res.json({
          statusCode:404,
          message:`Opps!! User not found`
        })
      }

      if (!user.verified) {
        return res.status(400).json({
          statusCode:400,
          message:`Opps!! You are not yet verified. Check your email for verification link`
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

      res.cookie('jwt', token);

      this.loggerService.log('User logged in successfully');
      return res.json({
        statusCode:200,
        message:"Successful login",
      })
    } catch (err) {
      this.loggerService.error('Something broke', err.stack);
      return res.status(500).json({
        statusCode: 500,
        message: err.message,
      });
    }
  }

  // private getFileExtension(): string {
  //   return process.env.NODE_ENV === 'production' ? 'js' : 'ts';
  // }

  async provideRegions(email:string,api_key:string, req:Request, res: Response) {
    try {
      this.loggerService.log('fetching regions...');
      let user = await this.userModel.findOne({email});

      if (!user) {
        return res.json({
          statusCode:404,
          message:`Opps!! User not found`
        })
      }

      if (!user.verified) {
        return res.status(400).json({
          statusCode:400,
          message:`Opps!! You are not yet verified. Check your email for verification link`
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

      res.cookie('jwt', token);
      
//=================================================
await this.Authservice.ensureLogin(req, res)
const theUser = await this.userModel.findOne({_id:res.locals.user.id})
if(!theUser){
  return
}
      if (user.subscriptionLevel === 'free') {
        // Return lower quality data for free users
        const simplifiedRegions = regions.map(region => ({
          name: region.name,
          description: region.description,
        }));
        this.loggerService.log('Successful region fetching');
        return res.json({
          all_regions: simplifiedRegions
        });
      } else {
        // Return full data for paid users
        this.loggerService.log('Successful region fetching');
        return res.json({
          all_regions: regions
        });
      }
//================================================
    } catch (err) {
      this.loggerService.error('Something broke', err.stack);
      return res.status(500).json({
        statusCode: 500,
        message: err.message,
      });
    }
  }

  async provideStates(email:string,api_key:string,req:Request, res: Response) {
    try {
      this.loggerService.log('fetching states...');
      let user = await this.userModel.findOne({email});

      if (!user) {
        return res.json({
          statusCode:404,
          message:`Opps!! User not found`
        })
      }

      if (!user.verified) {
        return res.status(400).json({
          statusCode:400,
          message:`Opps!! You are not yet verified. Check your email for verification link`
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

      res.cookie('jwt', token);
      
//=================================================
await this.Authservice.ensureLogin(req, res)
const theUser = await this.userModel.findOne({_id:res.locals.user.id})
if(!theUser){
  return
}

      if (user.subscriptionLevel === 'free') {
        // Return lower quality data for free users
        const simplifiedStates = states.map(state => ({
          name: state.name,
          description: state.description,
        }));
        this.loggerService.log('Successful states fetching');
        return res.json({
          all_states: simplifiedStates
        });
      } else {
        // Return full data for paid users
        this.loggerService.log('Successful states fetching');
        return res.json({
          all_states: states
        });
      }
      
//================================================
    } catch (err) {
      this.loggerService.error('Something broke', err.stack);
      return res.status(500).json({
        statusCode: 500,
        message: err.message,
      });
    }
  }


  async provideLocalGovernments(email:string,api_key:string, req:Request, res: Response) {
    try {
      this.loggerService.log('Fetching local governments...');
      let user = await this.userModel.findOne({email});

      if (!user) {
        return res.json({
          statusCode:404,
          message:`Opps!! User not found`
        })
      }

      if (!user.verified) {
        return res.status(400).json({
          statusCode:400,
          message:`Opps!! You are not yet verified. Check your email for verification link`
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

      res.cookie('jwt', token);
      
//=================================================
await this.Authservice.ensureLogin(req, res)
const theUser = await this.userModel.findOne({_id:res.locals.user.id})
if(!theUser){
  return
}

if (user.subscriptionLevel === 'free') {
  // Return lower quality data for free users
  const simplifiedLGAs = lgs.map(lga => ({
    name: lga.name,
    description: lga.description,
  }));
  this.loggerService.log('Successful L.G fetching');
  return res.json({
    all_LGA: simplifiedLGAs
  });
} else {
  // Return full data for paid users
  this.loggerService.log('Successful L.G fetching');
  return res.json({
    all_LGA:lgs
  });
}

//================================================
    } catch (err) {
      this.loggerService.error('Something broke', err.stack);
      return res.status(500).json({
        statusCode: 500,
        message: err.message,
      });
    }
  }



  //-----Getting All regions--------------------------

  async getAllregions(req:Request, res:Response){
    try{
      this.loggerService.log('Fetching regions...');
    await this.Authservice.ensureLogin(req, res)
    const user = await this.userModel.findOne({_id:res.locals.user.id})
      if (user.subscriptionLevel === 'free') {
        // Return lower quality data for free users
        const simplifiedRegions = regions.map(region => ({
          name: region.name,
          description: region.description,
        }));
        this.loggerService.log('Successful region fetching');
        return res.json({
          all_regions: simplifiedRegions
        });
      } else {
        // Return full data for paid users
        this.loggerService.log('Successful region fetching');
        return res.json({
          all_regions: regions
        });
      }
    
    }catch(err){
      this.loggerService.error('Something broke', err.stack);
      return res.status(500).json({
        statusCode: 500,
        message: err.message,
      });
    }
  }


    //-----Getting All states--------------------------

    async getAllstates(req:Request, res:Response){
      try{
      this.loggerService.log('fetching states...');
      await this.Authservice.ensureLogin(req, res)
      const user = await this.userModel.findOne({_id:res.locals.user.id})

      if (user.subscriptionLevel === 'free') {
        // Return lower quality data for free users
        const simplifiedStates = states.map(state => ({
          name: state.name,
          description: state.description,
        }));
        this.loggerService.log('Successful states fetching');
        return res.json({
          all_states: simplifiedStates
        });
      } else {
        // Return full data for paid users
        this.loggerService.log('Successful states fetching');
        return res.json({
          all_states: states
        });
      }
      
      }catch(err){
        this.loggerService.error('Something broke', err.stack);
        return res.status(500).json({
          statusCode: 500,
          message: err.message,
        });
      }
    }

    //-----Getting All L.G.A--------------------------

    async getAllLGA(req:Request, res:Response){
      try{
      this.loggerService.log('Fetching local governments...');
      
      await this.Authservice.ensureLogin(req, res)
      const user = await this.userModel.findOne({_id:res.locals.user.id})

      if (user.subscriptionLevel === 'free') {
        // Return lower quality data for free users
        const simplifiedLGAs = lgs.map(lga => ({
          name: lga.name,
          description: lga.description,
        }));
        this.loggerService.log('Successful L.G fetching');
        return res.json({
          all_LGA: simplifiedLGAs
        });
      } else {
        // Return full data for paid users
        this.loggerService.log('Successful L.G fetching');
        return res.json({
          all_LGA:lgs
        });
      }
      
      }catch(err){
        this.loggerService.error('Something broke', err.stack);
        return res.status(500).json({
          statusCode: 500,
          message: err.message,
        });
      }
    }

//-----Getting a particular region--------------------------
async getOneRegion( region_name:string ,req:Request, res:Response){
      try{
        await this.Authservice.ensureLogin(req, res)
        const user = await this.userModel.findOne({_id:res.locals.user.id})

        const theRegion:Region = regions.find((region:any)=> {
          return region.name === region_name
        } )

        if(!theRegion){
          return res.json({
            statusCode:404,
            error:"Opps!, Region not found"
          })
        }
        if (user.subscriptionLevel === 'free') {
          const simplifiedRegion = {
            name:theRegion.name,
            description:theRegion.description,
          }
          // Return lower quality data for free users
          return res.json({
            statusCode:200,
            found_region:simplifiedRegion 
          });
        } else {
          // Return full data for paid users
          return res.json({
            statusCode:200,
            found_region:theRegion
          });
        }
    
        }catch(err){
          return res.status(500).json({
            statusCode: 500,
            message: err.message,
          });
        }
    }

    //-----Getting a particular state--------------------------
    async getOneState( state_name:string ,req:Request, res:Response){
      try{
        await this.Authservice.ensureLogin(req, res)
       
        const user = await this.userModel.findOne({_id:res.locals.user.id})

        const theState:State = states.find((state:any)=> {
          return state.name === state_name
        } )

        if(!theState){
          return res.json({
            statusCode:404,
            error:"Opps!, State not found"
          })
        }

        if (user.subscriptionLevel === 'free') {
          // Return lower quality data for free users
          const simplifiedStates = {
            name:theState.name,
            description:theState.description,
          }
          return res.json({
            all_states: simplifiedStates
          });
        } else {
          // Return full data for paid users
          return res.json({
            statusCode:200,
            found_state:theState
          });
        }

        }catch(err){
          return res.status(500).json({
            statusCode: 500,
            message: err.message,
          });
        }
    }

    //-----Getting a particular Local government--------------------------
    async getOneLG( LG_name:string ,req:Request, res:Response){
      try{
        await this.Authservice.ensureLogin(req, res)
        
        const user = await this.userModel.findOne({_id:res.locals.user.id})

        const theLocal_gov:Lg = lgs.find((local_gov:any)=> {
          return local_gov.name ===  LG_name
        } )

        if(!theLocal_gov){
          return res.json({
            statusCode:404,
            error:"Opps!, Local government not found"
          })
        }

        if (user.subscriptionLevel === 'free') {
          // Return lower quality data for free users
          const simplifiedLGAs = {
            name:theLocal_gov.name,
            description:theLocal_gov.description,
          }
          return res.json({
            all_LGA: simplifiedLGAs
          });
        } else {
          // Return full data for paid users
          return res.json({
            statusCode:200,
            found_local_government:theLocal_gov
          });
        }
    
        }catch(err){
          return res.status(500).json({
            statusCode: 500,
            message: err.message,
          });
        }
    }




    //=================================================


    async upgrade(req: Request, res: Response) {
      try {
        await this.Authservice.ensureLogin(req, res);
  
        const price = 5
        
        const user = await this.userModel.findOne({
          _id: res.locals.user.id,
        });
  
        let NairaPerDollar = await this.currencyService.getExchangeRate(res)
        let thePriceInNaira = await this.currencyService.convertDollarToNaira(price , NairaPerDollar ) 
  
        const transaction = await this.transactionModel.create({
          amount: `${price}`,
          userId: user._id,
        });
  
        const data = {
          amount: thePriceInNaira * 100,
          email: user.email,
          reference: transaction._id,
        };
  
        const headers = {
          Authorization: `Bearer ${process.env.PAYSTACK_KEY}`,
        };
  
        await axios.post(
          'https://api.paystack.co/transaction/initialize',
          data,
          { headers },
        ).then((response)=>{
          return res.json({
            transactionUrl:response.data.data.authorization_url
          })
      })
        .catch(err=>{
          return res.json({
            error:JSON.stringify(err)
          })
        });
  
      } catch (err) {
        return res.status(500).json({
          statusCode: 500,
          message: err.message,
        });
      }
    }
  
    //-------------------------------Paystack call back after successful or failed transaction----------------------------------------
    async processPaystackCallBack(req: Request, res: Response) {
      try {
        const body = req.body;
        let transaction = await this.transactionModel
          .findOne({ _id: body.data.reference })
          .populate('userId')
  
        if (!transaction) {
          res.send('Transaction is not found');
        }
  
        if (body.event === 'charge.success') {
          transaction.status = 'success';
          transaction.save();
  
          const user = await this.userModel.findOne({
            _id: transaction.userId,
          });
         
          user.subscriptionLevel = "paid"
          user.save();
  
          await mailService.sendEmail({
            email:user.email,
            subject: 'You are now upgraded',
            html: `<div>
          <p>Congratulation!!</p>
          <p>You have been upgraded to the paid tier of <b>Locale</b>.You can now access full datas for regions states and local governments.</p>
          <p>Your compliance will be appreciated. Thanks.</p>
          </div>`,
          });
        }
  
        if (body.event === 'charge.failed') {
          transaction.status = 'failed';
          transaction.save();
        }
  
        return res.send('call back received')
      } catch (err) {
        return res.status(500).json({
          statusCode: 500,
          message: err.message,
        });
      }
    }
  
    //-------------------------------Paystack call for successful transaction page---------------------------------------
    async getPaymentSuccessPage(res:Response) {
      try{
        return res.json({
          statusCode:200,
          message:"Successful Payment"
        })
      }catch(err){
        return res.status(500).json({
          statusCode: 500,
          message: err.message,
        });
      }
    }

    //========================================================


}
