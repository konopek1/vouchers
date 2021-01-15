import { Controller, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import SignedTxDto from "src/asa/SignedTx.dto";
import AsaTransferTxDto from "./AsaTransferTx.dto";
import { PaymentService } from "./payment.service";
import PaymentTxDto from "./PaymentTx.dto";
import SendAsaDto from "./SendAsa.dto";

@Controller('payment')
export class PaymentController {
    constructor(
        private readonly paymentService: PaymentService
    ) { }
    
    @UseGuards(AuthGuard('jwt'))
    @Post('makeAsaTransferTx')
    async makeAsaTransferTx(asaTransferTXDto: AsaTransferTxDto) {
        return await this.paymentService.makeAssetTransferTx(asaTransferTXDto);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('sendAsaTransfer')
    async sendAsaTransfer(sendAsaDto: SendAsaDto) {
        return await this.paymentService.sendAsaTransfer(sendAsaDto);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('makeTransferTx')
    async makeTransferTx(paymentTxDto: PaymentTxDto) {
        return await this.paymentService.makeTransferTx(paymentTxDto.from, paymentTxDto.to, paymentTxDto.amount);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('sendTransfer')
    async sendTransfer(txSig: SignedTxDto) {
        return await this.paymentService.sendTransfer(txSig);
    }

}