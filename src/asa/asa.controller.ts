import { Body, Controller, Get, Post, Put, Req, UseGuards, UseInterceptors } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import RequestWithUser from "src/authentication/RequestWithUser";
import { TransactionSerializerInterceptor } from "src/lib/TransactionSerializerInterceptor";
import { AsaService } from "./asa.service";
import AssetConfigDto from "./AssetConfig.dto";
import SignedTxDto from "./SignedTx.dto";
import UpdateAsaDto from "./UpdateAsa.dto";
import WhiteListTxDto from "./WhitelistTx.dto";

@UseInterceptors(TransactionSerializerInterceptor)
@Controller('asa')
export class AsaController {
    constructor(
        private readonly asaService: AsaService,
    ) { }

    @UseGuards(AuthGuard('jwt'))
    @Get()
    public async userAssets(@Req() request: RequestWithUser) {
        const userID = request.user.id;
        return await this.asaService.getOwnedByUser(userID);
    }

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

    @UseGuards(AuthGuard('jwt'))
    @Post('/addToWhitelistTxs')
    public async addToWhitelistTxs(@Body() whiteListTxDto: WhiteListTxDto) {
              
        return await this.asaService.createAddUsersToWhitelistTxs(whiteListTxDto.emails, whiteListTxDto.asaEntityID, whiteListTxDto.from);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('/removeFromWhitelistTxs')
    public async removeFromWhitelistTxs(@Body() whiteListTxDto: WhiteListTxDto) {
        return await this.asaService.createRemoveUsersFromWhitelistTxs(whiteListTxDto.emails, whiteListTxDto.asaEntityID, whiteListTxDto.from);
    }

    @UseGuards(AuthGuard('jwt'))
    @Put('/updateWhitelist')
    public async updateWhitelist(@Body() signedTxDto: SignedTxDto) {
        return await this.asaService.modifyWhitelist(signedTxDto);
    }

}