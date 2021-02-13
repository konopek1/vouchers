import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { mnemonicToSecretKey, signTransaction } from "algosdk";
import { Asa } from "src/asa/asa.entity";
import { MINIMUM_ALGOS } from "src/lib/Constants";
import { PaymentService } from "src/payment/payment.service";
import User from "src/user/user.entity";
import { Repository } from "typeorm";
import AddWalletDto from "./AddWalletDto";
import Wallet from "./wallet.entity";

@Injectable()
export class WalletService {

    constructor(
        @InjectRepository(Wallet)
        private readonly walletRepository: Repository<Wallet>,
        private readonly configService: ConfigService,
        private readonly paymentService: PaymentService,
        ) { }

    async getWalletByPublicKeyOrFail(publicKey: string): Promise<Wallet> {
        return await this.walletRepository.findOneOrFail({ publicKey });
    }

    async addWallet(walletData: AddWalletDto ) {

        const asa = new Asa();
        asa.id = walletData.asaID;

        const owner = new User();
        owner.id = walletData.userID;

        const wallet = await this.walletRepository.create({
            asa,
            owner,
            publicKey: walletData.publicKey,
            encryptedPrivateKey: walletData.encryptedPrivateKey,
            metadata: walletData.metadata,
        });
        
        await this.participateWallet(wallet.publicKey);

        await this.walletRepository.save(wallet);
    }

    async participateWallet(publicAddress: string): Promise<void> {
        
        const supplierMnemonic = this.configService.get('SUPPLIER_MNEMONIC');
        const { addr, sk } = mnemonicToSecretKey(supplierMnemonic);        
        const supplyTransaction = await this.paymentService.makeTransferTx(addr, publicAddress, MINIMUM_ALGOS);
    
        const signedSupplyTransaction = signTransaction(supplyTransaction, sk);

        await this.paymentService.sendTransfer(signedSupplyTransaction);
    }


    async getOwnedByUser(userID: number): Promise<Wallet[]> {        
        const wallets = (await this.walletRepository.find({
            where: {
                owner: userID
            },
            relations: ['asa']
        }));

        return wallets;
    }

}