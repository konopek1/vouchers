import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Asa } from "src/asa/asa.entity";
import { Repository } from "typeorm";
import Wallet from "./wallet.entity";

@Injectable()
export class WalletService {

    constructor(
        @InjectRepository(Wallet)
        private readonly walletRepository: Repository<Wallet>
    ) { }

    async getWalletByPublicKeyOrFail(publicKey: string): Promise<Wallet> {
        return await this.walletRepository.findOneOrFail({ publicKey });
    }

    async getOwnedByUser(userID: number): Promise<Asa[]> {
        return (await this.walletRepository.find({
            where: {
                owner: userID
            },
            relations: ['asa']
        })).map(w => w.asa);
    }
}