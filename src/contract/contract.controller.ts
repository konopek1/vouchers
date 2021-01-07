import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import SignedTxDto from "src/asa/SignedTxDto";
import { ContractService } from "./contract.service";
import PoiContractDto from "./PoiContractDto";

@Controller('contract')
export class ContractController {
    constructor(
        private readonly contractService: ContractService
    ) { }

    @UseGuards(AuthGuard('jwt'))
    @Post('createTx')
    public async createPoiContractTx(@Body() poiContractDto: PoiContractDto) {
        return await this.contractService.createPoiContractTx(poiContractDto);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('create')
    public async createPoiContract(@Body() signedTxDto: SignedTxDto) {
        return await this.contractService.createPoiContract(signedTxDto);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post(['escrow', 'createTx'])
    public async createEscrowTx(@Body() asaEntityID: number) {
        return await this.contractService.createEscrowTx(asaEntityID);
    }

}