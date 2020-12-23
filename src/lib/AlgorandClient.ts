import { Injectable } from '@nestjs/common';
const algosdk = require('algosdk');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Algodv2 = any;

@Injectable()
export default class AlgorandClient {
  public client: Algodv2;

  constructor() {
    this.client = new algosdk.Algodv2(
      process.env.ALGORAND_TOKEN,
      process.env.ALGORAND_URL,
      Number(process.env.ALGORAND_PORT),
    );
  }
}
