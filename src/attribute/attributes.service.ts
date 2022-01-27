import { Injectable, OnModuleInit } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import Attribute, { AttributeKind } from "./attribute.entity";
import RequiredAttribute from "./required_attribute.entity";

@Injectable()
export class AttributesService implements OnModuleInit {

    constructor(
        @InjectRepository(RequiredAttribute) private readonly requiredRepo: Repository<RequiredAttribute>,
        @InjectRepository(Attribute) private readonly attrRepo: Repository<Attribute>
    ) { }

    async onModuleInit() {
        // creat basic attributes
        const [_, count] = await this.attrRepo.findAndCount();

        if (count === 0) {
            const ageAttr = this.attrRepo.create({
                constraints: {
                    availableComparators: ['>', '<', '='],
                    valueType: 'number'
                },
                description: 'Fulfilled if age of user is [ "<" , ">" or "=" ] to given value',
                name: 'age',
                kind: AttributeKind.age
            });

            const zipAttr = this.attrRepo.create({
                constraints: {
                    availableComparators: ['='],
                    valueType: 'string'
                },
                description: 'Fulfilled if zip-code of user is "=" to given value',
                name: 'zip-code',
                kind: AttributeKind.zip
            });

            await this.attrRepo.save([ageAttr, zipAttr])
        }
    }

    getRequiredByAsaEntityID(asaEntityID: number): Promise<RequiredAttribute[]> {
        return this.requiredRepo.find({
            where: {
                asa: {
                    id: asaEntityID
                }
            }
        })
    }

    getAvailableAttributes(): Promise<Attribute[]> {
        return this.attrRepo.find();
    }


}
