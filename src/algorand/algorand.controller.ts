import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import AlgorandService from './algorand.service';

@Controller('algorand')
export default class AlgorandController {
  constructor(private readonly algorandService: AlgorandService) { }

  @UseGuards(AuthGuard('jwt'))
  @Get('txParams')
  async getBalance(address: string) {
    return await this.algorandService.getAccountBalance(address);
  }

}
