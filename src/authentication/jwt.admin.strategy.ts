import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UserService } from "../user/user.service";
import TokenPayload, { Role } from "./TokenPayload";

@Injectable()
export class JwtAdminStrategy extends PassportStrategy(Strategy, 'admin') {
    constructor(
        configService: ConfigService,
        private readonly userService: UserService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([(req: Request) => req?.cookies?.Authentication]),
            secretOrKey: configService.get('JWT_SECRET')
        })
    }

    async validate(payload: TokenPayload) {
        const user = await this.userService.getById(payload.userId);

        if (user.role !== Role.Admin) throw new HttpException("Lack of permissions", HttpStatus.FORBIDDEN);

        return user;
    }
}