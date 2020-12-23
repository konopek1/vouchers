import { Injectable } from '@nestjs/common';
import { DefaultParams } from './algosdk.types';
import AlgorandClient from './lib/AlgorandClient';

@Injectable()
export default class AlgorandService {
  constructor(private readonly algorandClient: AlgorandClient) {}

  async getTransactionDefaultParameters(): Promise<DefaultParams> {
    return this.algorandClient.client.getTransactionParams().do();
  }
}
