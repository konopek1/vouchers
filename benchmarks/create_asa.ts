import { INestApplication, ValidationPipe } from "@nestjs/common";
import { NestApplication, NestFactory } from "@nestjs/core";
import { generateAccount, makeLogicSig, mnemonicToSecretKey, OnApplicationComplete, secretKeyToMnemonic, signTransaction } from 'algosdk';
import { AsaService } from "../src/asa/asa.service";
import createWalletFromMnemonic from "../src/consoleScripts/createWalletFromMnemonic";
import { UserService } from "../src/user/user.service";
import { AppModule } from "../src/app.module";
import { PaymentService } from "../src/payment/payment.service";
import { ContractService } from "../src/contract/contract.service";
import Benchmark from "./benchmark";

const ADMIN_MEMO = "path load rude spray grid border assume icon mushroom prison curious curious skate tag between plate matter reduce mechanic industry diagram tragic solve absent retreat";

async function setup() {
    const app = await NestFactory.create(AppModule);

    await app.init();

    return app;
}

async function createAsa(app: INestApplication) {
    const userService = app.get(UserService);
    const asaService = app.get(AsaService);
    const contractService = app.get(ContractService);
    const paymentService = app.get(PaymentService);

    // await userService.createAdmin("admin123@mail.com", "password", wallet);
    const adminAccount = mnemonicToSecretKey(ADMIN_MEMO);

    // create asa
    const createdAsaTx = await asaService.createAsaTx({
        addr: adminAccount.addr,
        clawback: adminAccount.addr,
        freeze: adminAccount.addr,
        manager: adminAccount.addr,
        reserve: adminAccount.addr,
        assetName: Math.ceil(Math.random() * 1000).toString(),
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

    const asa = await asaService.createAsa(sCreateAsaTx);

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
}


async function benchmark(app: INestApplication) {
    const benchmark = new Benchmark(() => createAsa(app));

    const results = await benchmark.run(10);

    console.table(results)
    console.table(benchmark.results)
    console.log(`Mediana czasów w sekundach: ${benchmark.med()}`);
}

setup()
    .then(benchmark)
    .then(console.log)
    .catch(console.log)
    .finally(() => process.exit(0))
