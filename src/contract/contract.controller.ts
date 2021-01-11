import { Body, Controller, Post, UseGuards, UseInterceptors } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import SignedTxDto from "src/asa/SignedTxDto";
import { TransactionSerializerInterceptor } from "src/lib/TransactionSerializerInterceptor";
import { ContractService } from "./contract.service";
import EscrowTxDto from "./EscrowTxDto";
import OptInTxDto from "./OptInTxDto";
import PoiContractDto from "./PoiContractDto";

@UseInterceptors(TransactionSerializerInterceptor)
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
    @Post('escrowTx')
    public async createEscrowTx(@Body() escrowTxDto: EscrowTxDto) {

        return await this.contractService.createEscrowTx(escrowTxDto.asaEntityID);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('createOptInTx')
    public async createOptInTx(@Body() optInTxDto: OptInTxDto) {
        
        return await this.contractService.createOptInContractTx(optInTxDto);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('optIn')
    public async optIn(@Body() signedOptInTx: SignedTxDto) {
        
        return await this.contractService.sendOptInTx(signedOptInTx);
    }
}