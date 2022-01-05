import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import RequestWithUser from "../authentication/RequestWithUser";
import { UserService } from "./user.service";

@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService
    ) { }

    @UseGuards(AuthGuard('jwt'))
    @Get('balance')
    public async balance(@Req() request: RequestWithUser) {
        const user = request.user;

        return await this.userService.balance(user);
    }
}