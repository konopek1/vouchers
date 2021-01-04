import { Body, Controller, Post } from "@nestjs/common";
import { AsaService } from "./asa.service";
import AssetConfigDto from "./AssetConfigDto";
import SignedTxDto from "./SignedTxDto";

@Controller('asa')
export class AsaController {
    constructor(
        private readonly asaService: AsaService
    ) { }

    @Post('/createTx')
    public async create(@Body() assetConfig: AssetConfigDto) {
        return await this.asaService.createAsaTx(assetConfig);
    }

    @Post('/create')
    public async async(@Body() signedTx: SignedTxDto) {
        return await this.asaService.createAsa(signedTx);
    }

}