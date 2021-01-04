import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TxPendingInformation } from 'src/algorand/algosdk.types';
const algosdk = require('algosdk');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Algodv2 = any;

@Injectable()
export default class AlgorandClient {
  public client: Algodv2;

  constructor(private configService: ConfigService) {
    this.client = new algosdk.Algodv2(
      this.configService.get('ALGORAND_TOKEN'),
      this.configService.get('ALGORAND_URL'),
      this.configService.get('ALGORAND_PORT'),
    );
  }

  public async waitForConfirmation(txId: string): Promise<TxPendingInformation> {
    return new Promise<TxPendingInformation>(async (resolve, reject) => {
      let response = await this.client.status().do();
      let currentRound = response["last-round"];
      while (true) {
        const pendingInfo = await this.client.pendingTransactionInformation(txId).do();
        
        if (pendingInfo["confirmed-round"] !== null && pendingInfo["confirmed-round"] > 0) {
          resolve({
            asaId: pendingInfo['asset-index'],
            applicationId: pendingInfo['application-index'],
            signedTx: pendingInfo.tx
          });
        }

        currentRound++;
        
        await this.client.statusAfterBlock(currentRound).do();
      }
    }
    )
  };
}
