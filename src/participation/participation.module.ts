import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ContractModule } from '../contract/contract.module';
import { PaymentModule } from '../payment/payment.module';
import WalletModule from '../wallet/wallet.module';
import { ParticipationController } from './participation.controller';
import { ParticipationService } from './participation.service';

@Module({
    imports: [ConfigModule.forRoot(), WalletModule, ContractModule, PaymentModule],
    controllers: [ParticipationController],
    providers: [ParticipationService],
    exports: [ParticipationService]
})
export class ParticipationModule { }
