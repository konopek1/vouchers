import { Injectable } from '@nestjs/common';
import algosdk from 'algosdk';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Algodv2 = any;

@Injectable()
export default class AlgorandClient {
  constructor(public client: Algodv2) {
    this.client = algosdk.Algodv2(
      process.env.ALGORAND_TOKEN,
      process.env.ALGORAND_URL,
      Number(process.env.ALGORAND_PORT),
    );
  }
}
