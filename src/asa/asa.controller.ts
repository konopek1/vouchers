import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { AsaService } from "./asa.service";
import AssetConfigDto from "./AssetConfigDto";
import SignedTxDto from "./SignedTxDto";

@Controller('asa')
export class AsaController {
    constructor(
        private readonly asaService: AsaService
    ) { }

    @UseGuards(AuthGuard('jwt'))
    @Post('/createTx')
    public async create(@Body() assetConfig: AssetConfigDto) {
        return await this.asaService.createAsaTx(assetConfig);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('/create')
    public async async(@Body() signedTx: SignedTxDto) {
        return await this.asaService.createAsa(signedTx);
    }

}