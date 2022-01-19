import { Body, Controller, Get, Param, Post, Put, Req, UseGuards, UseInterceptors } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Transaction } from "algosdk";
import RequestWithUser from "../authentication/RequestWithUser";
import OptInTxDto from "../contract/OptInTx.dto";
import { TransactionSerializerInterceptor } from "../lib/TransactionSerializerInterceptor";
import User from "../user/user.entity";
import { AsaService } from "./asa.service";
import { AsaCreateDto } from "./AsaCreate.dto";
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

    @UseGuards(AuthGuard('admin'))
    @Get('/managed')
    public async managedAssets(@Req() request: RequestWithUser) {
        const userID = request.user.id;
        return await this.asaService.getByManager(userID);
    }

    @UseGuards(AuthGuard('admin'))
    @Post('/createTx')
    public async createTx(@Body() assetConfig: AssetConfigDto) {
        return await this.asaService.createAsaTx(assetConfig);
    }

    @UseGuards(AuthGuard('admin'))
    @Post('/create')
    public async create(@Body() signedTx: AsaCreateDto) {
        return await this.asaService.createAsa(signedTx);
    }

    @UseGuards(AuthGuard('admin'))
    @Post('/updateTx')
    public async createUpdateTx(@Body() updateAsaDto: UpdateAsaDto) {
        return await this.asaService.createUpdateAsaTx(updateAsaDto);
    }

    @UseGuards(AuthGuard('admin'))
    @Put('/update')
    public async update(@Body() signedUpdateAsaTx: SignedTxDto) {
        return await this.asaService.updateAsa(signedUpdateAsaTx);
    }

    @UseGuards(AuthGuard('admin'))
    @Post('/addToWhitelistTxs')
    public async addToWhitelistTxs(@Body() whiteListTxDto: WhiteListTxDto) {

        return await this.asaService.createAddUsersToWhitelistTxs(whiteListTxDto.emails, whiteListTxDto.asaEntityID, whiteListTxDto.from);
    }

    @UseGuards(AuthGuard('admin'))
    @Post('/removeFromWhitelistTxs')
    public async removeFromWhitelistTxs(@Body() whiteListTxDto: WhiteListTxDto) {
        return await this.asaService.createRemoveUsersFromWhitelistTxs(whiteListTxDto.emails, whiteListTxDto.asaEntityID, whiteListTxDto.from);
    }

    @UseGuards(AuthGuard('admin'))
    @Put('/updateWhitelist')
    public async updateWhitelist(@Body() signedTxDto: SignedTxDto) {
        return await this.asaService.modifyWhitelist(signedTxDto);
    }

    @UseGuards(AuthGuard('admin'))
    @Get('/:id/whitelist')
    public async getWhitelist(@Param('id') id: number): Promise<User[]> {
        return (await this.asaService.getByIDOrFail(id)).whitelist;
    }

    @UseGuards(AuthGuard('admin'))
    @Post('/makeAddSupplierTx')
    public async makeAddSupplierTx(@Body() newSupplierTxData: SupplierTx): Promise<Transaction[]> {
        return await this.asaService.addSupplierTx(newSupplierTxData.asaID, newSupplierTxData.supplierAddress);
    }


    @UseGuards(AuthGuard('admin'))
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