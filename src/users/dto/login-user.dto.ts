import { IsEmail, IsNotEmpty,IsString } from "class-validator";

export class LoginUserDto {
    @IsEmail()
    @IsNotEmpty()
    email:string

    @IsString()
    @IsNotEmpty()
    api_key:string
    
}