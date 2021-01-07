import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Algodv2, ConfirmedTxInfo } from 'algosdk';

@Injectable()
export default class AlgorandClient {
  public client: Algodv2;

  constructor(private configService: ConfigService) {
    this.client = new Algodv2(
      this.configService.get('ALGORAND_TOKEN'),
      this.configService.get('ALGORAND_URL'),
      this.configService.get('ALGORAND_PORT'),
    );
  }

  public async waitForConfirmation(txId: string): Promise<ConfirmedTxInfo> {
    return new Promise<ConfirmedTxInfo>(async (resolve, reject) => {
      let response = await this.client.status().do();
      let currentRound = response["last-round"];
      while (true) {
        const pendingInfo = await this.client.pendingTransactionInformation(txId).do();

        if (pendingInfo["confirmed-round"] !== null && pendingInfo["confirmed-round"] > 0) {
          resolve(pendingInfo);
        }

        currentRound++;



        await this.client.statusAfterBlock(currentRound).do();
      }
    }
    )
  };


}
