import { Body, Controller, Post, Put, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { AsaService } from "./asa.service";
import AssetConfigDto from "./AssetConfigDto";
import SignedTxDto from "./SignedTxDto";
import UpdateAsaDto from "./UpdateAsaDto";

@Controller('asa')
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
    @Put('/updateTx')
    public async update(@Body() UpdateAsaDto: UpdateAsaDto) {
        return await this.asaService.createUpdateAsaTx(UpdateAsaDto);
    }
}