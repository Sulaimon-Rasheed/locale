import { Injectable } from '@nestjs/common';
import * as jwt from "jsonwebtoken"
import * as dotenv from "dotenv"
import {Request, Response} from 'express';
dotenv.config()

@Injectable()
export class AuthService {
    private readonly jwtSecret: string = process.env.JWT_SECRET;

    generateJwtToken(id: object, email:string, first_name:string): string {
        try{
            const tokenPayload = { id, email, first_name};
            return jwt.sign(tokenPayload, this.jwtSecret, { expiresIn: '2h' }); 
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
