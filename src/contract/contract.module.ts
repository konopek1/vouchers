import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AlgorandModule } from "../algorand/algorand.module";
import { Asa } from "../asa/asa.entity";
import FileReader from "../lib/FileReader";
import { ContractController } from "./contract.controller";
import { ContractService } from "./contract.service";

@Module({
    imports: [AlgorandModule, TypeOrmModule.forFeature([Asa]), ConfigModule],
    controllers: [ContractController],
    providers: [ContractService, FileReader, ConfigModule, FileReader],
    exports: [ContractService],
})
export class ContractModule { }