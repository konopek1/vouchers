import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { ContractService } from "../contract/contract.service";
import { encodeTx } from "../lib/TransactionSerializerInterceptor";
import { PaymentService } from "../payment/payment.service";
import { WalletService } from "../wallet/wallet.service";
import ParticipateTxDto from "./ParticipateTx.dto";
import { ParticipationToken } from "./ParticipationToken";
import { UserParticipationTx } from "./UserParticipationTx";
import SendParticipateTxDto from "./SendParticipateTx.dto";
import { ConfigService } from "@nestjs/config";
import { decodeUnsignedTransaction, mnemonicToSecretKey, signTransaction } from "algosdk";
import { AsaService } from "../asa/asa.service";

@Injectable()
export class ParticipationService {

    constructor(
        private readonly walletService: WalletService,
        private readonly paymentService: PaymentService,
        private readonly contractService: ContractService,
        private readonly configService: ConfigService,
        private readonly asaService: AsaService
    ) { }

    generateToken(userID: number, asaID: string): string {
        return new ParticipationToken(userID, asaID).encode();
    }

    async makeParticipateTxByToken({ encodedToken, from, amount }: ParticipateTxDto): Promise<UserParticipationTx> {

        const token = ParticipationToken.fromEncoded(encodedToken);
        const userID = token.getUserID();
        const asaEntityID = token.getAsaID();

        const userWallet = (await this.walletService.getOwnedByUser(userID)).find((w) => w.asa.id === asaEntityID);
        if (userWallet === null) throw new HttpException('Invalid token', HttpStatus.BAD_REQUEST);

        const userSetLevelTx = encodeTx(await this.contractService.createCallAddUserTx(asaEntityID, from, userWallet.publicKey));

        const asaTransferTx = await this.paymentService.makeAssetTransferTx({
            to: userWallet.publicKey,
            amount,
            asaEntityID,
            from,
        });

        return {
            ...asaTransferTx,
            userSetLevelTx
        };
    }


    async sendParticipateTx(txs: SendParticipateTxDto): Promise<void> {
        await this.paymentService.sendTransfer(txs.setLevelSigTx);
        await this.paymentService.sendAsaTransfer(txs);
    }

    async participateUser(userID: number, asaEntityID: number, amount: number): Promise<void> {
        const userWallet = (await this.walletService.getOwnedByUser(userID)).find((w) => w.asa.id === asaEntityID);
        if (userWallet === null) throw new HttpException('Invalid token', HttpStatus.BAD_REQUEST);

        const supplierMnemonic = this.configService.get('SUPPLIER_MNEMONIC');
        const { addr, sk } = mnemonicToSecretKey(supplierMnemonic);

        const userSetLevelTx = await this.contractService.createCallAddUserTx(asaEntityID, addr, userWallet.publicKey);

        const asaTransferTxs = await this.paymentService.makeAssetTransferTx({
            to: userWallet.publicKey,
            amount,
            asaEntityID,
            from: addr,
        });

        await this.sendParticipateTx(
            {
                asaTransferTx: decodeTx(asaTransferTxs.asaTransferTx),
                checkLevelSigTx: signTransaction(decodeTx(asaTransferTxs.checkLevelTx), sk),
                paymentSigTx: signTransaction(decodeTx(asaTransferTxs.paymentTx), sk),
                setLevelSigTx: signTransaction(userSetLevelTx, sk)
            }
        )
    }

}

const decodeTx = (tx) => decodeUnsignedTransaction(Uint8Array.from(tx));
