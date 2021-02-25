import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Role } from "src/authentication/TokenPayload";
import Wallet from "src/wallet/wallet.entity";
import { In, Repository } from "typeorm";
import { CreateUserDto } from "./CreateUser.dto";
import User from "./user.entity";
import * as bcrypt from 'bcrypt';
import AlgorandService from "src/algorand/algorand.service";
import { AssetsBalance } from "src/algorand/algosdk.types";

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(Wallet)
        private walletRepository: Repository<Wallet>,
        private algorandService: AlgorandService
    ) { }

    async create(userData: CreateUserDto) {
        const newUser = await this.userRepository.create(userData);
        await this.userRepository.save(newUser);

        return newUser;
    }

    async createAdmin(email: string, password: string, wallet: Wallet) {
        const admin = await this.userRepository.create({
            email,
            password: (await bcrypt.hash(password,10)),
            role: Role.Admin,
        });

        const persistedAdmin = await this.userRepository.save(admin);

        wallet.owner = admin;
        await this.walletRepository.save(wallet);
        persistedAdmin.wallets = [ wallet ];

        await this.userRepository.save(persistedAdmin);

        return admin;
    }

    async getByEmail(email: string) {
        return await this.userRepository.findOneOrFail({ email }, { relations: ['wallets'] , select: ['id', 'password', 'email']});
    }

    async getById(id: number) {
        return await this.userRepository.findOneOrFail({ id }, { relations: ['wallets'] });
    }

    async getUsersByEmails(emails: string[]) {
        return await this.userRepository.find(
            {
                where: {
                    email: In(emails)
                },
                relations: ['wallets']
            }
        );
    }

    async balance(user: User): Promise<AssetsBalance> {
        let balances = {};
        const wallets = await this.walletRepository.find({where: {owner: user.id}});

        const promisedBalances = wallets.map(w =>  this.algorandService.getAccountBalance(w.publicKey));

        (await Promise.all(promisedBalances)).map(ab => balances = {...balances,...ab});

        return balances;
    }

}