import { Body, Controller, Get, Post, Req, UseGuards, UseInterceptors } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import RequestWithUser from "src/authentication/RequestWithUser";
import { TransactionSerializerInterceptor } from "src/lib/TransactionSerializerInterceptor";
import ParticipateTxDto from "./ParticipateTx.dto";
import { ParticipationService } from "./participation.service";
import SendParticipateTxDto from "./SendParticipateTx.dto";


@UseInterceptors(TransactionSerializerInterceptor)
@Controller('participation')
export class ParticipationController {

    constructor(
        private readonly participationService: ParticipationService
    ) { }

    @UseGuards(AuthGuard('jwt'))
    @Get('/token/:asaID')
    async generateToken(@Req() request: RequestWithUser) {
        const asaID = request.params.asaID;
        return await this.participationService.generateToken(request.user.id, asaID);
    }

    //TODO: create and add new guards for nodes (cert or something)
    @Post('/makeTx')
    async makeParticipateTx(@Body() participateTxDto: ParticipateTxDto) {
        return await this.participationService.makeParticipateTx(participateTxDto);
    }

    //TODO: create and add new guards for nodes (cert or something)
    //TODO: rename
    @Post('/participateUser')
    async participateUser(@Body() txSig: SendParticipateTxDto): Promise<void> {
        return await this.participationService.participateUser(txSig);
    }

}