import { IsString, IsEmail, IsNotEmpty, Length } from "class-validator";

export class CreateUserDto {
    @IsString()
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    @Length(10,32)
    password: string;
}