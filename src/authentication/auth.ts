import { Injectable } from '@nestjs/common';
import * as jwt from "jsonwebtoken"
import {Request, Response} from 'express';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class AuthService {
    private readonly jwtSecret:string;
    constructor(private readonly configService: ConfigService) {
        this.jwtSecret = this.configService.get<string>('JWT_SECRET');
      }

    generateJwtToken(id: object, email:string, first_name:string): string {
        try{
            const tokenPayload = { id, email, first_name};
            return jwt.sign(tokenPayload, this.jwtSecret); 
        }catch(err){
            throw new Error(err.meessage)
        }
    
    }

    async ensureLogin(req:Request, res:Response){
    
            try{
                const token:string = req.cookies.jwt
                if(!token){
                    return res.json({
                        code:401,
                        message:"Jwt is required"
                    })
                }
        
                const decoded = await jwt.verify(token, this.jwtSecret)
        
                res.locals.user = decoded
            }catch(err){
                throw new Error(err.meessage)
            }
       
    }

}
