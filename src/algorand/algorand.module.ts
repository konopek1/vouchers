import { Module } from '@nestjs/common';
import AlgorandController from './algorand.controller';
import AlgorandService from './algorand.service';
import AlgorandClient from '../lib/AlgorandClient';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [AlgorandController],
  providers: [AlgorandClient, AlgorandService],
})
export class AlgorandModule {}
