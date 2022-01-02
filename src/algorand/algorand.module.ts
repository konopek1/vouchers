import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Asa } from 'src/asa/asa.entity';
import AlgorandClient from '../lib/AlgorandClient';
import AlgorandService from './algorand.service';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([Asa])],
  providers: [AlgorandClient, AlgorandService],
  exports: [AlgorandService]
})
export class AlgorandModule {}
