import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AssetResult, CompileOut, ConfirmedTxInfo, SuggestedParams, TxSig } from 'algosdk';
import AlgorandClient from '../lib/AlgorandClient';


@Injectable()
export default class AlgorandService {
  constructor(private algorandClient: AlgorandClient) { }

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
      throw new HttpException(`Transaction submission error: ${e.response.body.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return rv;
  }

  async compile(program: string): Promise<CompileOut> {
    return await this.algorandClient.client.compile(program).do();
  }

  async getAsa(asaID: number): Promise<AssetResult> {
    return await this.algorandClient.client.getAssetByID(asaID).do();
  }

}
