import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
}
