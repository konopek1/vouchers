import { Module } from '@nestjs/common';
import AlgorandController from './algorand.controller';
import AlgorandService from './algorand.service';
import AlgorandClient from '../lib/AlgorandClient';
import { ConfigModule } from '@nestjs/config';
import { AuthenticationModule } from 'src/authentication/authentication.module';

@Module({
  imports: [ConfigModule, AuthenticationModule],
  controllers: [AlgorandController],
  providers: [AlgorandClient, AlgorandService],
})
export class AlgorandModule {}
