import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AlgorandModule } from "src/algorand/algorand.module";
import { Asa } from "src/asa/asa.entity";
import { ContractService } from "./contract.service";

@Module({
    imports: [AlgorandModule, TypeOrmModule.forFeature([Asa])],
    controllers: [],
    providers: [ContractService, FileReader, ConfigModule],
    exports: [],
})
export class ContractModule {}