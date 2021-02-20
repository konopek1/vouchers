import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import Admin from "src/admin/admin.entity";
import { AuthenticationService } from "./authentication.service";

@Injectable()
export class LocalAdminStrategy extends PassportStrategy(Strategy, 'admin') {
    
    constructor(private authenticationService: AuthenticationService) {
        super({
            usernameField: 'email'
        });
    }

    async validate(email: string, password: string): Promise<Admin> {
        return this.authenticationService.getAuthenticatedAdmin(email, password);
    }
}