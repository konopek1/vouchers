import { Body, Controller, Get, Param, Post, Put, Req, UseGuards, UseInterceptors } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Transaction } from "algosdk";
import RequestWithUser from "src/authentication/RequestWithUser";
import OptInTxDto from "src/contract/OptInTx.dto";
import { TransactionSerializerInterceptor } from "src/lib/TransactionSerializerInterceptor";
import User from "src/user/user.entity";
import { AsaService } from "./asa.service";
import AssetConfigDto from "./AssetConfig.dto";
import SignedTxDto from "./SignedTx.dto";
import { SupplierTx } from "./SupplierTx";
import { SupplierDto } from "./Suppplier.dto";
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
    @Get('/managed')
    public async managedAssets(@Req() request: RequestWithUser) {
        const userID = request.user.id;
        return await this.asaService.getByManager(userID);
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

    @UseGuards(AuthGuard('jwt'))
    @Get('/:id/whitelist')
    public async getWhitelist(@Param('id') id: number): Promise<User[]> {
        return (await this.asaService.getByIDOrFail(id)).whitelist;
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('/makeAddSupplierTx')
    public async makeAddSupplierTx(@Body() newSupplierTxData: SupplierTx): Promise<Transaction[]> {
        return await this.asaService.addSupplierTx(newSupplierTxData.asaID, newSupplierTxData.supplierAddress);
    }


    @UseGuards(AuthGuard('jwt'))
    @Post('/addSupplier')
    public async addSupplier(@Body() newSupplierTxData: SupplierDto): Promise<void> {
        await this.asaService.addSupplier(newSupplierTxData.optInTxSig, newSupplierTxData.setLevelTxSig);
    }

    //TODO: add auth guard for node
    @Post('/optInTx')
    public async makeOptInTx(@Body() optInTxDto: OptInTxDto): Promise<Transaction> {
        return await this.asaService.makeOptInTx(optInTxDto);
    }
}