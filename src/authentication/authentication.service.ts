import { UserService } from "src/user/user.service";
import RegisterDto from "./RegisterDto";
import * as bcrypt from "bcrypt";
import { PostgresErrorCode } from "src/database/postgresErrorCode.enum";
import { HttpException, HttpStatus } from "@nestjs/common";

export class AuthenticationService {
    constructor(
        private readonly userService: UserService
    ) {}

    public async register(registerData: RegisterDto) {
        const hashedPassword = await bcrypt.hash(registerData.password, 10);
        
        try {
            const createdUser = await this.userService.create({
                ...registerData,
                password: hashedPassword
            });
            createdUser.password = undefined;

            return createdUser;
        } catch (error) {
            if(error?.code === PostgresErrorCode.UniqueViolation) {
                throw new HttpException('User with this email already exists', HttpStatus.BAD_REQUEST);
            }
            throw new HttpException('Something went wrong', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private async verifyPassword(plainPassword: string, hashedPassword: string) {
        const isPasswordMatching = await bcrypt.compare(
            plainPassword,
            hashedPassword
        )

        if (!isPasswordMatching) {
            throw new HttpException('Wrong credentials provided', HttpStatus.BAD_REQUEST);
        }
    }
    
    public async getAuthenticatedUser(email: string, plainPassword: string) {
        try {
            const user = await this.userService.getByEmail(email);

            await this.verifyPassword(plainPassword, user.password);

            user.password = undefined;
            
            return user;
        } catch(error) {
            throw new HttpException('Wrong credentials provided', HttpStatus.BAD_REQUEST);
        }
    }
}