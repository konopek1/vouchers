import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { ContractService } from "src/contract/contract.service";
import { encodeTx } from "src/lib/TransactionSerializerInterceptor";
import { PaymentService } from "src/payment/payment.service";
import { WalletService } from "src/wallet/wallet.service";
import ParticipateTxDto from "./ParticipateTx.dto";
import { ParticipationToken } from "./ParticipationToken";
import { UserParticipationTx } from "./UserParticipationTx";
import SendParticipateTxDto from "./SendParticipateTx.dto";

@Injectable()
export class ParticipationService {

    constructor(
         private readonly walletService: WalletService,
         private readonly paymentService: PaymentService,
         private readonly contractService: ContractService
    ) { }

    generateToken(userID: number, asaID: string): string {
        return new ParticipationToken(userID, asaID).encode();
    }

    async makeParticipateTx({encodedToken, from, amount}: ParticipateTxDto): Promise<UserParticipationTx> {

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

    async participateUser(txs: SendParticipateTxDto): Promise<void> {
        await this.paymentService.sendTransfer(txs.setLevelSigTx);
        await this.paymentService.sendAsaTransfer(txs);
    }

}

