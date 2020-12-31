import { Body, Controller, Get, Post, Req, Res, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Response } from "express";
import { AuthenticationService } from "./authentication.service";
import RegisterDto from "./RegisterDto";
import RequestWithUser from "./RequestWithUser";

@Controller('auth')
export class AuthenticationController {
    constructor(
        private readonly authenticationService: AuthenticationService
    ) {}

    @Post('register')
    async register(@Body() registrationData: RegisterDto) {
        return this.authenticationService.register(registrationData);
    }

    @UseGuards(AuthGuard('local'))
    @Post('log-in')
    async logIn(@Req() request: RequestWithUser, @Res() response: Response) {
        const user = request.user;
        user.password = undefined;

        const cookie = this.authenticationService.createJWTCookie(user.id);
        response.setHeader('set-cookie',cookie);

        return response.send(user);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('log-out')
    async logOut(@Res() response: Response) {
        const clearCookie = this.authenticationService.createClearCookie();
        response.setHeader('set-cookie',clearCookie);

        return response.sendStatus(200);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get()
    async authenticate(@Req() request: RequestWithUser) {
        const user = request.user;
        user.password = undefined;

        return user;
    }
}