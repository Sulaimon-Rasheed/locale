import {IsNotEmpty} from "class-validator";
import{IsEmail} from "./custom-class-validator"

export class emailVerificationDto {
    @IsNotEmpty({
        message: 'last_name is required',
      })
    @IsEmail({
        message:"email must be a valid email"
      })
    email:string   
}