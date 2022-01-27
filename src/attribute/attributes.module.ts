import { TypeOrmModule } from "@nestjs/typeorm";
import { HttpModule, Module } from "@nestjs/common";
import AttributeCheckerService from "./attributeChecker.service";
import { AttributesService } from "./attributes.service";
import oAuthController from "./oAuth.controller";
import { ParticipationModule } from "../participation/participation.module";
import RequiredAttribute from "./required_attribute.entity";
import Attribute from "./attribute.entity";
import AttributesController from "./attributes.controller";


@Module({
    imports: [TypeOrmModule.forFeature([RequiredAttribute, Attribute]), HttpModule, ParticipationModule],
    providers: [AttributesService, AttributeCheckerService],
    controllers: [oAuthController, AttributesController],
})
export default class Attributes { }