import { Service } from "./Service";
import { LogicSig, makeLogicSig as createLogicSig, Transaction, TxSig } from "algosdk";

export class ContractService extends Service {
    
    protected readonly route = '/contract';

    private readonly MAKE_CREATE_TX = `${this.route}/createTx`;

    private readonly SEND_CREATE_TX = `${this.route}/create`;

    private readonly MAKE_ESCROW = `${this.route}/escrowTx`;

    private readonly MAKE_OPT_IN_TX = `${this.route}/createOptInTx`;

    private readonly SEND_OPT_IN_TX = `${this.route}/optIn`;

    async makeCreateTx(poiContractDto: PoiContractDto): Promise<Transaction> {
        return (await this.client.post(this.MAKE_CREATE_TX, poiContractDto)).data;
    }

    async sendCreateTx(signedTx: TxSig): Promise<unknown> {
        return (await this.client.post(this.SEND_CREATE_TX, signedTx)).data;
    }

    async makeLogicSig(escrowTxDto: EscrowTxDto): Promise<LogicSig> {
        const compileOut = (await this.client.post(this.MAKE_ESCROW, escrowTxDto)).data;
        const compiledProgram = compileOut.result;

        const logicSig = createLogicSig(new Uint8Array(Buffer.from(compiledProgram, "base64")));
    
        return logicSig;
    }

    async makeOptInTx(optInTxDto: OptInTxDto): Promise<Transaction> {
        return (await this.client.post(this.MAKE_OPT_IN_TX, optInTxDto)).data;
    }

    async sendOptInTx(signedTx: TxSig): Promise<unknown> {
        return (await this.client.post(this.SEND_OPT_IN_TX, signedTx)).data;
    }


}

export interface PoiContractDto {
    asaEntityID: number;
    from: string;
}

export interface EscrowTxDto {
    asaEntityID: number;
}

export interface OptInTxDto {
    address: string;
    entityAsaID: number;
}