import { Module } from '@nestjs/common';
import AlgorandController from './algorand.controller';
import AlgorandService from './algorand.service';
import AlgorandClient from '../lib/AlgorandClient';

@Module({
  imports: [],
  controllers: [AlgorandController],
  providers: [AlgorandClient, AlgorandService],
})
export class AlgorandModule {}
