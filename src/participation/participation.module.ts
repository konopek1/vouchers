import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ContractModule } from '../contract/contract.module';
import { PaymentModule } from '../payment/payment.module';
import WalletModule from '../wallet/wallet.module';
import { ParticipationService } from './participation.service';
import { AsaModule } from '../asa/asa.module';

@Module({
    imports: [ConfigModule.forRoot(), WalletModule, ContractModule, PaymentModule, ConfigModule, AsaModule],
    providers: [ParticipationService],
    exports: [ParticipationService],
})
export class ParticipationModule { }
