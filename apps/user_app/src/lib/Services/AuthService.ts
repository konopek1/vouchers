import { Asa } from "./AsaService";
import { Service } from "./Service";
import { Wallet } from "./WalletService";

export default class AuthService extends Service {
    protected readonly route = 'auth';

    private readonly LOG_IN = `${this.route}/log-in`;

    private readonly LOG_OUT = `${this.route}/log-out`;

    private readonly REGISTER = `${this.route}/register`;

    private readonly FETCH = this.route;

    async logIn(logInDto: LogInDto): Promise<User> {
        return (await this.client.post(this.LOG_IN, logInDto)).data;
    }

    async logOut(): Promise<void> {
        await this.client.post(this.LOG_OUT);
    }

    async currentUser(): Promise<User> {
        return (await this.client.get(this.FETCH)).data;
    }

    async register(registerDto: RegisterDto): Promise<User> {
        try {
            await this.logOut();
        } catch(e) { }
        return (await this.client.post(this.REGISTER, registerDto)).data;
    }

}
    
export interface User {
    id: number;
    email: string;
    assets: Asa[];
    wallets: Wallet[];
}

export interface RegisterDto {
    email: string;
    password: string;
}

export type LogInDto = RegisterDto;