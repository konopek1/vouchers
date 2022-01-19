import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import Attribute from "./attribute.entity";

@Injectable()
export default class AttributeCheckerService {

    constructor() { }


    async check(requiredAttributes: Attribute[], attributes: any): Promise<boolean> {
        return requiredAttributes.every(a => this.isAttributeAuthorized(a, attributes))
    }


    private isAttributeAuthorized(attribute: Attribute, authorizedAttributes: any): boolean {
        const given = authorizedAttributes[attribute.kind];

        switch (attribute.constraints.valueType) {
            case "number":
                if (typeof given !== "number") throw new HttpException(`Wrong type of attribute should be number but is ${typeof given}`, HttpStatus.BAD_REQUEST)
                return this.handleNumberAttribute(attribute, given);
            case "string":
                return this.handleStringAttribute(attribute, given);
        }
    }

    private handleNumberAttribute(attribute: Attribute, given: number): boolean {
        switch (attribute.constraints.comparator) {
            case "<":
                return given < Number(attribute.constraints.value);
            case ">":
                return given > Number(attribute.constraints.value);
            case "=":
                return given === Number(attribute.constraints.value);
            default:
                throw new HttpException(`Wrong type of comparator ${attribute.constraints.comparator}, should be one of: <,>,=`, HttpStatus.BAD_REQUEST)
        }
    }

    private handleStringAttribute(attribute: Attribute, given: string): boolean {
        switch (attribute.constraints.comparator) {
            case "=":
                return given === attribute.constraints.value;
            default:
                throw new HttpException(`Wrong type of comparator ${attribute.constraints.comparator}, should be one of: ['=']`, HttpStatus.BAD_REQUEST)
        }
    }



}