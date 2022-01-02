import { Body, Controller, Get, HttpCode, Post, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Request } from "express";
import User from "src/user/user.entity";
import { AuthenticationService } from "./authentication.service";
import RegisterDto from "./Register.dto";
import RequestWithUser from "./RequestWithUser";

@Controller('auth')
export class AuthenticationController {
    constructor(
        private readonly authenticationService: AuthenticationService
    ) {}

    @Post('register')
    async register(@Body() registrationData: RegisterDto, @Req() request): Promise<User> {
        const user = await this.authenticationService.registerUser(registrationData);
        
        const cookie = this.authenticationService.createJWTCookie(user.id);
        request.res.setHeader('set-cookie',cookie);

        user.wallets = [];
        
        return user;
    }

    @UseGuards(AuthGuard('local'))
    @Post('log-in')
    async logIn(@Req() request: RequestWithUser) {
        const user = request.user;

        const cookie = this.authenticationService.createJWTCookie(user.id);
        request.res.setHeader('set-cookie',cookie);

        return user;
    }

    @UseGuards(AuthGuard('jwt'))
    @Get()
    async authenticate(@Req() request: RequestWithUser) {
        const user = request.user;
        user.password = undefined;

        return user;
    }

    @Post('log-out')
    @HttpCode(200)
    async logOut(@Req() request: Request) {
        const clearCookie = this.authenticationService.createClearCookie();
        request.res.setHeader('set-cookie',clearCookie);
    }

}