import { IsNotEmpty, IsString, Matches } from "class-validator";
import {IsEmail} from "./custom-class-validator"

export class CreateUserDto {
    @IsString()
    @IsNotEmpty({
      message: 'first_name is required',
    })
    @Matches(/^\S+$/, {
      message: 'first_name must not contain any whitespace',
    })
  
    @Matches(/^[a-zA-Z0-9]+$/, {
      message: 'first_name must contain only alphanumeric characters',
    })
    first_name:string

    @IsString()
    @IsNotEmpty({
      message: 'last_name is required',
    })
    @Matches(/^\S+$/, {
      message: 'last_name must not contain any whitespace',
    })
  
    @Matches(/^[a-zA-Z0-9]+$/, {
      message: 'last_name must contain only alphanumeric characters',
    })
    last_name:string


    @IsEmail({
        message:"email must be a valid email"
      })
    email:string

    @IsString()
    @IsNotEmpty({
            message: 'last_name is required',
          })
    @Matches(/^[0-9+-]+$/, {
    message: 'Phone number" can only contain digits',
    })
    phoneNum:string

}
