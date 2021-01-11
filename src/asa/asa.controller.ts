import { Body, Controller, Get, Post, Put, UseGuards, UseInterceptors } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { TransactionSerializerInterceptor } from "src/lib/TransactionSerializerInterceptor";
import { AsaService } from "./asa.service";
import AssetConfigDto from "./AssetConfigDto";
import SignedTxDto from "./SignedTxDto";
import UpdateAsaDto from "./UpdateAsaDto";

@Controller('asa')
@UseInterceptors(TransactionSerializerInterceptor)
export class AsaController {
    constructor(
        private readonly asaService: AsaService
    ) { }

    @UseGuards(AuthGuard('jwt'))
    @Post('/createTx')
    public async createTx(@Body() assetConfig: AssetConfigDto) {
        return await this.asaService.createAsaTx(assetConfig);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('/create')
    public async create(@Body() signedTx: SignedTxDto) {
        return await this.asaService.createAsa(signedTx);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('/updateTx')
    public async createUpdateTx(@Body() updateAsaDto: UpdateAsaDto) {
        return await this.asaService.createUpdateAsaTx(updateAsaDto);
    }

    @UseGuards(AuthGuard('jwt'))
    @Put('/update')
    public async update(@Body() signedUpdateAsaTx: SignedTxDto) {
        return await this.asaService.updateAsa(signedUpdateAsaTx);
    }

    // @UseGuards(AuthGuard('local'))


}