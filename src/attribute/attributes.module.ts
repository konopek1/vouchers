import { TypeOrmModule } from "@nestjs/typeorm";
import { HttpModule, Module } from "@nestjs/common";
import Attribute from "./attribute.entity";
import AttributeCheckerService from "./attributeChecker.service";
import { AttributesService } from "./attributes.service";
import oAuthController from "./oAuth.controller";
import { ParticipationModule } from "../participation/participation.module";


@Module({
    imports: [TypeOrmModule.forFeature([Attribute]), HttpModule, ParticipationModule],
    providers: [AttributesService, AttributeCheckerService],
    controllers: [oAuthController],
})
export default class Attributes { }