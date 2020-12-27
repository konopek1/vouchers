import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
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
    async logIn(@Req() request: RequestWithUser) {
        const user = request.user;
        user.password = undefined;
        return user;
    } 
}