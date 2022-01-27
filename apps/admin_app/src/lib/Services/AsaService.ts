import { signTransaction, Transaction, TxSig } from "algosdk";
import { User } from "./AuthService";
import { ContractService } from "./ContractService";
import { PaymentService } from "./PaymentService";
import { Service } from "./Service";

export class AsaService extends Service {

    protected readonly route = '/asa';

    private readonly MANAGED = `${this.route}/managed`;

    private readonly MAKE_CREATE_TX = `${this.route}/createTx`;

    private readonly SEND_CREATE = `${this.route}/create`;

    private readonly MAKE_UPDATE_TX = `${this.route}/updateTx`;

    private readonly SEND_UPDATE_TX = `${this.route}/update`;

    private readonly MAKE_ADD_TO_WHITELIST_TXS = `${this.route}/addToWhitelistTxs`;

    private readonly UPDATE_WHITELIST = `${this.route}/updateWhitelist`;

    private readonly WHITELIST = (asaID: number) => `${this.route}/${asaID}/whitelist`;

    private readonly MAKE_SUPPLIER_TX = `${this.route}/makeAddSupplierTx`;

    private readonly ADD_SUPPLIER = `${this.route}/addSupplier`;

    async getManaged(): Promise<Asa[]> {
        return (await this.client.get(this.MANAGED)).data;
    }

    async getWhitelist(id: number): Promise<User[]> {
        return (await this.client.get(this.WHITELIST(id), { data: id })).data;
    }

    public async makeCreateTx(createAsaTxDto: CreateAsaTxDto): Promise<Transaction> {
        return (await this.client.post(this.MAKE_CREATE_TX, createAsaTxDto)).data;
    }

    public async sendCreateTx(signedCreateTx: any): Promise<Asa> {
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
        return (await this.client.put(this.UPDATE_WHITELIST, signedTx)).data;
    }

    public async addSupplier(asaID: number, newSupplier: string, sk: Uint8Array): Promise<void> {

        const [optInTx, setLevelTx] = (await this.client.post(this.MAKE_SUPPLIER_TX, { asaID, supplierAddress: newSupplier })).data;

        const optInTxSig = signTransaction(optInTx, sk);
        const setLevelTxSig = signTransaction(setLevelTx, sk);

        await this.client.post(this.ADD_SUPPLIER, { optInTxSig, setLevelTxSig });
    }

    public async createAsa(createAsaDto: CreateAsaTxDto, sk: Uint8Array, progress: (percentage: number) => void): Promise<void> {
        progress(0.1);
        const contractService = this.serviceRegistry.getService<ContractService>(ContractService);
        const paymentService = this.serviceRegistry.getService<PaymentService>(PaymentService);

        const createdAsaTx = await this.makeCreateTx(createAsaDto);
        const signedCreateAsaTx = signTransaction(createdAsaTx, sk);
        const asa = await this.sendCreateTx({ txSig: signedCreateAsaTx, attributes: createAsaDto.attributes, expireDate: createAsaDto.expireDate });

        progress(20);

        const asaEntityID = asa.id;
        const poiContractTx = await contractService.makeCreateTx({
            asaEntityID,
            from: createAsaDto.manager
        });
        const signedPoiContractTx = signTransaction(poiContractTx, sk);
        await contractService.sendCreateTx(signedPoiContractTx);

        progress(40);

        const logicSig = await contractService.makeLogicSig({
            asaEntityID
        });

        progress(60);

        const fundEscrowTx = await paymentService.makeTransferTx({
            from: createAsaDto.addr,
            amount: 100000,
            to: logicSig.address()
        });
        const signedFundEscrowTx = signTransaction(fundEscrowTx, sk);
        await paymentService.sendTransferTx(signedFundEscrowTx);

        progress(70);

        const updateAsaTx = await this.makeUpdateTx({
            entityAsaID: asaEntityID,
            clawbackAddress: logicSig.address()
        });

        await this.sendUpdateTx(signTransaction(updateAsaTx, sk));

        progress(80);

        await this.addSupplier(asaEntityID, createAsaDto.addr, sk);

        progress(100);
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
    assetURL: string,
    attributes: { id: number, value: string, comparator: string }[],
    expireDate: string
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

export interface ID {
    id: number;
}