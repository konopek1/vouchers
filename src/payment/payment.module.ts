import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AlgorandModule } from "src/algorand/algorand.module";
import { Asa } from "src/asa/asa.entity";
import { ContractModule } from "../contract/contract.module";
import { PaymentController } from "./payment.controller";
import { PaymentService } from "./payment.service";

@Module({
    imports: [AlgorandModule, TypeOrmModule.forFeature([Asa]), ContractModule],
    providers: [PaymentService],
    controllers: [PaymentController],
    exports: [PaymentService]
})
export class PaymentModule { }