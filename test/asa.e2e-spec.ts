import { AppModule } from '../src/app.module';
import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { createAsa } from './create_asa';
import { AsaService } from '../src/asa/asa.service';
import { distribute } from './distribute_asa';
import { UserService } from '../src/user/user.service';
import { transfer } from './transfer_asa';
import { ContractService } from '../src/contract/contract.service';
import { signTransaction } from 'algosdk';
import { Asa } from 'src/asa/asa.entity';

describe('Voucher spec', () => {
  jest.setTimeout(300_000);

  let app: INestApplication;
  let adminMemo: string = "income shrimp style add able penalty coach tennis blossom van diesel divorce swap increase remember unable logic valley someone animal able sound expect ability ivory";
  let asaService: AsaService;
  let userService: UserService;
  let asa: Asa;

  beforeAll(async () => {
    app = await NestFactory.create(AppModule);

    asaService = await app.get(AsaService);
    userService = await app.get(UserService);

    await app.init();
  });


  it('should create new asa', async () => {
    asa = await createAsa(app, adminMemo);

    expect(asaService.getByIDOrFail(asa.id)).resolves.toBeDefined();

  });

  it('should distribute asa to user', async () => {
    const { user } = await distribute(app, asa.id, adminMemo);

    const balance = await userService.balance(user);

    expect(balance[asa.id.toString()]).toBe(100);
  });

  it('should transfer asa between users', async () => {
    const { user, supplierAccount, userWallet } = await distribute(app, asa.id, adminMemo);
    const ent = await distribute(app, asa.id, adminMemo);

    const contractService = app.get(ContractService);

    const tx = await contractService.createCallAddToWhitelistTx(asa.id, supplierAccount.addr, ent.userWallet.addr);
    const signedTx = signTransaction(tx, supplierAccount.sk);

    await contractService.sendOptInTx(signedTx);

    await transfer(app, asa.id, userWallet.addr, ent.userWallet.addr, userWallet.sk, 100);

    const balanceUser = await userService.balance(user);
    const balanceEnt = await userService.balance(ent.user);

    expect(balanceUser[asa.id.toString()]).toBe(0);
    expect(balanceEnt[asa.id.toString()]).toBe(200);
  });

});
