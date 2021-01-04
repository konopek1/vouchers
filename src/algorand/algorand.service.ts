import { Injectable } from '@nestjs/common';
import { AssetConfig, DefaultParams, SignedTx, Tx, TxPendingInformation } from './algosdk.types';
import AlgorandClient from '../lib/AlgorandClient';
const algosdk = require('algosdk');


@Injectable()
export default class AlgorandService {
  constructor(private algorandClient: AlgorandClient) { }

  async getTransactionDefaultParameters(): Promise<DefaultParams> {
    return this.algorandClient.client.getTransactionParams().do();
  }

  async createAssetTx(assetConfig: AssetConfig): Promise<Tx> {
    const defaultParameters = await this.getTransactionDefaultParameters();

    const asa = algosdk.makeAssetCreateTxnWithSuggestedParams(
      assetConfig.addr,
      assetConfig.note,
      assetConfig.totalIssuance,
      assetConfig.decimals,
      true,
      assetConfig.manager,
      assetConfig.reserve,
      assetConfig.freeze,
      assetConfig.clawback,
      assetConfig.unitName,
      assetConfig.assetName,
      assetConfig.assetURL,
      assetConfig.assetMetadataHash,
      defaultParameters
    );

    return asa;
  }

  async sendSignedTx(signedTx: SignedTx): Promise<TxPendingInformation> {
    try {
      await this.algorandClient.client.sendRawTransaction(signedTx.blob).do();
    } catch(e) {
      console.log(e)
    }
    return await this.algorandClient.waitForConfirmation(signedTx.txID); 
  }

}
