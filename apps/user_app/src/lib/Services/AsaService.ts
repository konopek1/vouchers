import { signTransaction, Transaction, TxSig } from "algosdk";
import { User } from "./AuthService";
import { ContractService } from "./ContractService";
import { PaymentService } from "./PaymentService";
import { Service } from "./Service";

export class AsaService extends Service {

    protected readonly route = '/asa';

    private readonly GET_ALL = `${this.route}`;

    private readonly MAKE_CREATE_TX = `${this.route}/createTx`;

    private readonly SEND_CREATE = `${this.route}/create`;

    private readonly MAKE_UPDATE_TX = `${this.route}/updateTx`;

    private readonly SEND_UPDATE_TX = `${this.route}/update`;

    private readonly MAKE_ADD_TO_WHITELIST_TXS = `${this.route}/addToWhitelistTxs`;

    private readonly UPDATE_WHITELIST = `${this.route}/updateWhitelist`;

    private readonly MAKE_OPT_IN_TX = `${this.route}/optInTx`;

    async getOwnedByUser(): Promise<AsaOwnedByUserDto> {
        return (await this.client.get(this.GET_ALL)).data;
    }

    public async makeCreateTx(createAsaTxDto: CreateAsaTxDto): Promise<Transaction> {
        return (await this.client.post(this.MAKE_CREATE_TX, createAsaTxDto)).data;
    }

    public async sendCreateTx(signedCreateTx: TxSig): Promise<Asa> {
        return (await this.client.post(this.SEND_CREATE, signedCreateTx)).data;
    }

    public async makeUpdateTx(updateAsaDto: UpdateAsaDto): Promise<Transaction> {
        return (await this.client.post(this.MAKE_UPDATE_TX, updateAsaDto)).data;
    }

    public async sendUpdateTx(signedTx: TxSig): Promise<unknown> {
        return (await this.client.put(this.SEND_UPDATE_TX, signedTx)).data;
    }

    public async makeAddToWhiteListTxs(makeAddToWhiteListTxDto: MakeAddToWhiteListTxDto): Promise<Transaction[]> {
        return (await this.client.post(this.MAKE_ADD_TO_WHITELIST_TXS, makeAddToWhiteListTxDto)).data;
    }

    public async updateWhiteList(signedTx: TxSig): Promise<unknown> {
        return (await this.client.post(this.UPDATE_WHITELIST, signedTx)).data;
    }

    public async makeOptInTx(optInTxDto: OptInTxDto): Promise<Transaction> {
        return (await this.client.post(this.MAKE_OPT_IN_TX, optInTxDto)).data;
    }


    async optIn(asaEntityID: number, from: string, privateKey: Uint8Array): Promise<void> {
        const contractService = this.serviceRegistry.getService<ContractService>(ContractService);

        const paymentService = this.serviceRegistry.getService<PaymentService>(PaymentService);

        const optInTx = await contractService.makeOptInTx({ address: from, entityAsaID: asaEntityID });

        const signedOptInTx = signTransaction(optInTx, privateKey);

        await contractService.sendOptInTx(signedOptInTx);

        const optInAsaTx = await this.makeOptInTx({ address: from, entityAsaID: asaEntityID });

        const signedOptInAsaTx = signTransaction(optInAsaTx, privateKey);

        await paymentService.sendTransferTx(signedOptInAsaTx);
    }
}

export interface AsaOwnedByUserDto {
    ownedByUser: Asa[];
    rest: Asa[]
}

export interface CreateAsaTxDto {
    addr: string,
    totalIssuance: number,
    reserve: string,
    freeze: string,
    clawback: string,
    manager: string,
    unitName: string,
    assetName: string,
    assetURL: string
}

export interface Asa {
    id: number;
    asaID: number;
    name: string;
    unitName: string;
    appID: number | null;
    assetUrl: string;
    clawback: string;
    manager: string;
    valid: boolean;
    whitelist: User[];
}

export interface UpdateAsaDto {
    entityAsaID: number;
    clawbackAddress: string;
}

export interface MakeAddToWhiteListTxDto {
    emails: string[];
    asaEntityID: number;
    from: string;
}

export interface OptInTxDto {
    address: string;
    entityAsaID: number;
}
