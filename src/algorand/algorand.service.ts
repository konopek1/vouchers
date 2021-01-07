import { Injectable } from '@nestjs/common';
import AlgorandClient from '../lib/AlgorandClient';
import { AssetParams, AssetResult, CompileOut, ConfirmedTxInfo, SuggestedParams, TxSig } from 'algosdk';


@Injectable()
export default class AlgorandService {
  constructor(private algorandClient: AlgorandClient) { }

  async getTransactionDefaultParameters(): Promise<SuggestedParams> {
    return this.algorandClient.client.getTransactionParams().do();
  }

  async sendSignedTx(signedTx: TxSig): Promise<ConfirmedTxInfo> {
    await this.algorandClient.client.sendRawTransaction(signedTx.blob).do();

    return await this.algorandClient.waitForConfirmation(signedTx.txID); 
  }

  async compile(program: string): Promise<CompileOut> {
    return await this.algorandClient.client.compile(program).do();    
  }

  async getAsa(asaID: number): Promise<AssetResult> {
    return await this.algorandClient.client.getAssetByID(asaID).do();
  }

}
