import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AlgorandModule } from "src/algorand/algorand.module";
import { AuthenticationModule } from "src/authentication/authentication.module";
import { ContractModule } from "src/contract/contract.module";
import { TransactionSerializerInterceptor } from "src/lib/TransactionSerializerInterceptor";
import { UserModule } from "src/user/user.module";
import WalletModule from "src/wallet/wallet.module";
import { AsaController } from "./asa.controller";
import { Asa } from "./asa.entity";
import { AsaService } from "./asa.service";

@Module({
    imports: [AlgorandModule, TypeOrmModule.forFeature([Asa]), AuthenticationModule, ContractModule, UserModule, WalletModule],
    providers: [AsaService, TransactionSerializerInterceptor],
    controllers: [AsaController],
    exports: []
})
export class AsaModule {}