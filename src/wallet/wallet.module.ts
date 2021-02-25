import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AlgorandModule } from "src/algorand/algorand.module";
import { PaymentModule } from "src/payment/payment.module";
import { WalletController } from "./wallet.controller";
import Wallet from "./wallet.entity";
import { WalletService } from "./wallet.service";

@Module({
    imports: [TypeOrmModule.forFeature([Wallet]), PaymentModule, ConfigModule.forRoot(), AlgorandModule],
    providers: [WalletService],
    controllers: [WalletController],
    exports: [WalletService],
})
export default class WalletModule { }