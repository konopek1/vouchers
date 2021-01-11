import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AlgorandModule } from "src/algorand/algorand.module";
import { AuthenticationModule } from "src/authentication/authentication.module";
import { ContractModule } from "src/contract/contract.module";
import { TransactionSerializerInterceptor } from "src/lib/TransactionSerializerInterceptor";
import Wallet from "src/wallet/wallet.entity";
import { AsaController } from "./asa.controller";
import { Asa } from "./asa.entity";
import { AsaService } from "./asa.service";

@Module({
    imports: [AlgorandModule, TypeOrmModule.forFeature([Asa, Wallet]), AuthenticationModule, ContractModule],
    providers: [AsaService, TransactionSerializerInterceptor],
    controllers: [AsaController],
    exports: []
})
export class AsaModule {}