import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AttributeDto } from "../asa/AsaCreate.dto";
import { Repository } from "typeorm";
import Attribute from "./attribute.entity";
import { Asa } from "src/asa/asa.entity";

@Injectable()
export class AttributesService {

    constructor(@InjectRepository(Attribute) private readonly repo: Repository<Attribute>) { }


    getAttributesByAsa(asaId: number): Promise<Attribute[]> {
        return this.repo.find({ where: { asa: { asaID: asaId } } });
    }



}