import { IsEmail, IsNotEmpty, IsString, Length, } from "class-validator";

export default class RegisterDto {
    @IsString()
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    @Length(8,32)
    password: string;
}