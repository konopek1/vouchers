import { INestApplication } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { decodeUnsignedTransaction, generateAccount, mnemonicToSecretKey, signTransaction } from "algosdk";
import { ContractService } from "../src/contract/contract.service";
import { AppModule } from "../src/app.module";
import { ParticipationService } from "../src/participation/participation.service";
import { AsaService } from "../src/asa/asa.service";
import { UserService } from "../src/user/user.service";
import { randomString } from "./create_asa";
import { WalletService } from "../src/wallet/wallet.service";

const SUPPLIER_MEMO = "glory hair saddle kingdom fitness nice outdoor chest speak any speed caught speed yellow cactus endorse borrow bitter rival few sustain turkey extra ability relief";

const decodeTx = (tx) => decodeUnsignedTransaction(Uint8Array.from(tx));

export async function distribute(app: INestApplication, entityAsaID: number) {

    const userService = app.get(UserService);
    const tokenService = app.get(ParticipationService);
    const walletService = app.get(WalletService);

    const user = await userService.create({ email: `email${randomString()}@com.pl`, password: "password" });
    const userWallet = await generateAccount();
    const addr = userWallet.addr;
    const sk = userWallet.sk;

    const token = tokenService.generateToken(user.id!, entityAsaID.toString());

    await walletService.addWallet({
        asaID: entityAsaID,
        encryptedPrivateKey: "qwe",
        metadata: {
            iterations: 0,
            nonce: ""
        },
        publicKey: userWallet.addr,
        userID: user.id
    })

    const supplierAccount = mnemonicToSecretKey(SUPPLIER_MEMO);
    const distributeService = app.get(ParticipationService);
    const contractService = app.get(ContractService);
    const asaService = app.get(AsaService);


    const optInContractTx = await contractService.createOptInContractTx({ address: addr, entityAsaID: entityAsaID });
    const sOptInContractTx = signTransaction(optInContractTx, sk);

    const optInAsaTx = await asaService.makeOptInTx({ address: addr, entityAsaID: entityAsaID });
    const sOptInAsaTx = signTransaction(optInAsaTx, sk);

    await Promise.all([
        contractService.sendOptInTx(sOptInAsaTx),
        contractService.sendOptInTx(sOptInContractTx),
    ])

    const toSign = await distributeService.makeParticipateTx({ encodedToken: token, from: supplierAccount.addr, amount: 100 });

    await distributeService.participateUser({
        asaTransferTx: decodeUnsignedTransaction(Uint8Array.from(toSign.asaTransferTx)),
        checkLevelSigTx: signTransaction(decodeTx(toSign.checkLevelTx), supplierAccount.sk),
        paymentSigTx: signTransaction(decodeTx(toSign.paymentTx), supplierAccount.sk),
        setLevelSigTx: signTransaction(decodeTx(toSign.userSetLevelTx), supplierAccount.sk),
    });

    return { userWallet, supplierAccount };
}

export async function createApp() {
    const app = await NestFactory.create(AppModule);

    await app.init();

    return app;
}

