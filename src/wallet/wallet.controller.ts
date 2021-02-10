import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import RequestWithUser from 'src/authentication/RequestWithUser';
import { WalletService } from './wallet.service';

@Controller('wallet')
export class WalletController {

    constructor(
        private readonly walletService: WalletService
    ) { }

    @UseGuards(AuthGuard('jwt'))
    @Post('add-wallet')
    async addWallet(@Req() request: RequestWithUser) {

        const userID = request.user.id;
            
        return await this.walletService.addWallet({
            userID,
            ...request.body
        });
    }
 }
