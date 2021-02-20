import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
import { AdminService } from "src/admin/admin.service";
import { UserService } from "src/user/user.service";
import TokenPayload, { Role } from "./TokenPayload";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy){
    constructor(
        configService: ConfigService,
        private readonly userService: UserService,
        private readonly adminService: AdminService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([(req: Request) => req?.cookies?.Authentication]),
            secretOrKey: configService.get('JWT_SECRET')
        })
    }

    async validate(payload: TokenPayload) {
        switch (payload.role) {
            case Role.Admin:
                return this.adminService.getById(payload.userId);
            case Role.User:
                return this.userService.getById(payload.userId);
            default:
                break;
        }
    }
}