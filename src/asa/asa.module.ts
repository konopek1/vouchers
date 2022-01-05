import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AlgorandModule } from "../algorand/algorand.module";
import { AuthenticationModule } from "../authentication/authentication.module";
import { ContractModule } from "../contract/contract.module";
import { TransactionSerializerInterceptor } from "../lib/TransactionSerializerInterceptor";
import { UserModule } from "../user/user.module";
import WalletModule from "../wallet/wallet.module";
import { AsaController } from "./asa.controller";
import { Asa } from "./asa.entity";
import { AsaService } from "./asa.service";

@Module({
    imports: [AlgorandModule, TypeOrmModule.forFeature([Asa]), AuthenticationModule, ContractModule, UserModule, WalletModule],
    providers: [AsaService, TransactionSerializerInterceptor],
    controllers: [AsaController],
    exports: []
})
export class AsaModule { }