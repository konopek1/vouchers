import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AssetResult, CompileOut, ConfirmedTxInfo, SuggestedParams, TxSig } from 'algosdk';
import { Asa } from '../asa/asa.entity';
import { Repository } from 'typeorm';
import AlgorandClient from '../lib/AlgorandClient';
import { AssetsBalance } from './algosdk.types';


@Injectable()
export default class AlgorandService {
  constructor(
    private readonly algorandClient: AlgorandClient,
    @InjectRepository(Asa)
    private readonly asaRepository: Repository<Asa>) { }

  async getTransactionDefaultParameters(): Promise<SuggestedParams> {
    return this.algorandClient.client.getTransactionParams().do();
  }

  async sendSignedTx(signedTx: TxSig): Promise<ConfirmedTxInfo> {
    let rv;

    try {
      await this.algorandClient.client.sendRawTransaction(signedTx.blob).do();

      rv = await this.algorandClient.waitForConfirmation(signedTx.txID);
    }
    catch (e) {
      if (e.response) {
        throw new HttpException(`Transaction submission error: ${e.response.body.message}`, HttpStatus.BAD_REQUEST);
      } else {
        throw new HttpException(e.toString(), HttpStatus.INTERNAL_SERVER_ERROR);

      }
    }

    return rv;
  }

  async sendSignedTxs(signedTxs: TxSig[]): Promise<ConfirmedTxInfo> {

    const blobs = signedTxs.map(sigTx => sigTx.blob);

    try {
      const txID = (await this.algorandClient.client.sendRawTransaction(blobs).do()).txId;

      return await this.algorandClient.waitForConfirmation(txID);
    } catch (e) {
      throw new HttpException(`Transaction submission error: ${e.response.body.message}`, HttpStatus.BAD_REQUEST);
    }

  }

  async compile(program: string): Promise<CompileOut> {
    return await this.algorandClient.client.compile(program).do();
  }

  async getAsa(asaID: number): Promise<AssetResult> {
    return await this.algorandClient.client.getAssetByID(asaID).do();
  }

  async getAccountBalance(address: string): Promise<AssetsBalance> {
    const accountInfo = await this.algorandClient.client.accountInformation(address).do();

    let assetsBalance = {};

    for (const assetInfo of accountInfo.assets) {
      const asaEntity = await this.asaRepository.findOneOrFail({ asaID: assetInfo['asset-id'] });
      assetsBalance[asaEntity.id] = assetInfo.amount;
    }

    return assetsBalance;
  }
}
