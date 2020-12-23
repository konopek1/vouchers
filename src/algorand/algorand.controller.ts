import { Controller, Get, Inject } from '@nestjs/common';
import AlgorandService from './algorand.service';

@Controller('algorand')
export default class AlgorandController {
  constructor(private readonly algorandService: AlgorandService) {}

  @Get('txParams')
  getTransactionDefaultParameters() {
    return this.algorandService.getTransactionDefaultParameters();
  }
}
