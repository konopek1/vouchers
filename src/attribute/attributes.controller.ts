import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { AttributesService } from "./attributes.service";

@Controller('attributes')
export default class AttributesController {

    constructor(
        private readonly attributesService: AttributesService
    ) { }


    @Get()
    @UseGuards(AuthGuard('jwt'))
    getAvailableAttributes() {
        return this.attributesService.getAvailableAttributes();
    }

    @Get(':asaId/required')
    @UseGuards(AuthGuard('jwt'))
    getRequiredAttributes(@Param('asaId') asaId: number) {
        return this.attributesService.getRequiredByAsaEntityID(asaId);
    }


}