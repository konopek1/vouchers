import { INestApplication } from "@nestjs/common";
import { makeLogicSig, mnemonicToSecretKey, OnApplicationComplete, secretKeyToMnemonic, signTransaction } from 'algosdk';
import { AsaService } from "../src/asa/asa.service";
import { PaymentService } from "../src/payment/payment.service";
import { ContractService } from "../src/contract/contract.service";

export const randomString = () => Math.ceil(Math.random() * 10000000).toString();

export async function createAsa(app: INestApplication, memo) {
    const asaService = app.get(AsaService);
    const contractService = app.get(ContractService);
    const paymentService = app.get(PaymentService);

    const adminAccount = mnemonicToSecretKey(memo);

    // create asa
    const createdAsaTx = await asaService.createAsaTx({
        addr: adminAccount.addr,
        clawback: adminAccount.addr,
        freeze: adminAccount.addr,
        manager: adminAccount.addr,
        reserve: adminAccount.addr,
        assetName: randomString(),
        assetURL: "www.wat.edu.pl",
        totalIssuance: 21_000_000,
        unitName: "BTC",
        assetMetadataHash: undefined,
        decimals: 0,
        defaultFrozen: true,
        fee: Math.pow(2, -55),
        note: new Uint8Array(),
    });

    const sCreateAsaTx = signTransaction(createdAsaTx, adminAccount.sk);

    const asa = await asaService.createAsa({ txSig: sCreateAsaTx, attributes: [], expireDate: "01-01-2030" });

    const asaId = asa.id;

    const poiContractTx = await contractService.createPoiContractTx({
        asaEntityID: asaId, from: adminAccount.addr,
        level: 1,
        onComplete: OnApplicationComplete.NoOpOC,
        localBytesSlices: 0,
        globalBytesSlices: 1,
        localInts: 1,
        globalInts: 2
    });

    const signedPoiContractTx = signTransaction(poiContractTx, adminAccount.sk);
    await contractService.createPoiContract(signedPoiContractTx);


    const compileEscrow = await contractService.compileEscrow(asaId);
    const logicSig = makeLogicSig(new Uint8Array(Buffer.from(compileEscrow.result, "base64")));

    const fundEscrowTx = await paymentService.makeTransferTx(adminAccount.addr, logicSig.address(), 100000)
    const signedFundEscrowTx = signTransaction(fundEscrowTx, adminAccount.sk);
    await paymentService.sendTransfer(signedFundEscrowTx);

    const updateAsaTx = await asaService.createUpdateAsaTx({ clawbackAddress: logicSig.address(), entityAsaID: asaId });
    const signedUpdateAsaTx = signTransaction(updateAsaTx, adminAccount.sk);
    await asaService.updateAsa(signedUpdateAsaTx);

    const [optInTx, setLevelTx] = await asaService.addSupplierTx(asaId, adminAccount.addr);

    const sOptInTx = signTransaction(optInTx, adminAccount.sk);
    const sSetLevelTx = signTransaction(setLevelTx, adminAccount.sk);

    await asaService.addSupplier(sOptInTx, sSetLevelTx);

    return asa;
}
