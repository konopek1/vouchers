import { Body, Controller, Post, UseGuards, UseInterceptors } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import SignedTxDto from "src/asa/SignedTx.dto";
import { TransactionSerializerInterceptor } from "src/lib/TransactionSerializerInterceptor";
import AsaTransferTxDto from "./AsaTransferTx.dto";
import { PaymentService } from "./payment.service";
import PaymentTxDto from "./PaymentTx.dto";
import SendAsaDto from "./SendAsa.dto";

@UseInterceptors(TransactionSerializerInterceptor)
@Controller('payment')
export class PaymentController {
    constructor(
        private readonly paymentService: PaymentService
    ) { }

    @UseGuards(AuthGuard('jwt'))
    @Post('makeAsaTransferTx')
    async makeAsaTransferTx(@Body() asaTransferTXDto: AsaTransferTxDto) {
        return await this.paymentService.makeAssetTransferTx(asaTransferTXDto);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('sendAsaTransfer')
    async sendAsaTransfer(@Body() sendAsaDto: SendAsaDto) {
        return await this.paymentService.sendAsaTransfer(sendAsaDto);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('makeTransferTx')
    async makeTransferTx(@Body() paymentTxDto: PaymentTxDto) {
        return await this.paymentService.makeTransferTx(paymentTxDto.from, paymentTxDto.to, paymentTxDto.amount);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('sendTransfer')
    async sendTransfer(@Body() txSig: SignedTxDto) {
        return await this.paymentService.sendTransfer(txSig);
    }

}