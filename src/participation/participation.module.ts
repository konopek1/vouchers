import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ContractModule } from 'src/contract/contract.module';
import { PaymentModule } from 'src/payment/payment.module';
import WalletModule from 'src/wallet/wallet.module';
import { ParticipationController } from './participation.controller';
import { ParticipationService } from './participation.service';

@Module({
    imports: [ConfigModule.forRoot(), WalletModule, ContractModule, PaymentModule],
    controllers: [ParticipationController],
    providers: [ParticipationService],
    exports: [ParticipationService]
})
export class ParticipationModule {}
