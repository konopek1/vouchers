import { Injectable } from '@nestjs/common';
import { AssetConfig, DefaultParams, SignedTx, TxPendingInformation } from './algosdk.types';
import AlgorandClient from '../lib/AlgorandClient';
import * as algosdk from 'algosdk'
import { ConfirmedTxInfo, Transaction, TxSig } from 'algosdk';


@Injectable()
export default class AlgorandService {
  constructor(private algorandClient: AlgorandClient) { }

  async getTransactionDefaultParameters(): Promise<DefaultParams> {
    return this.algorandClient.client.getTransactionParams().do();
  }

  async createAssetTx(assetConfig: AssetConfig): Promise<Transaction> {
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

  async sendSignedTx(signedTx: TxSig): Promise<ConfirmedTxInfo> {
    await this.algorandClient.client.sendRawTransaction(signedTx.blob).do();

    return await this.algorandClient.waitForConfirmation(signedTx.txID); 
  }

}
