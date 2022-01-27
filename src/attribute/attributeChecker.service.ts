import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import RequiredAttribute from "./required_attribute.entity";

@Injectable()
export default class AttributeCheckerService {

    async check(requiredAttributes: RequiredAttribute[], attributes: Record<string, string | number>): Promise<boolean> {
        return requiredAttributes.every(r => this.isAttributeAuthorized(r, attributes))
    }


    private isAttributeAuthorized(attribute: RequiredAttribute, authorizedAttributes: any): boolean {
        const given = authorizedAttributes[attribute.type.kind];

        switch (attribute.type.constraints.valueType) {
            case "number":
                if (typeof given !== "number") throw new HttpException(`Wrong type of attribute should be number but is ${typeof given}`, HttpStatus.BAD_REQUEST)
                return this.handleNumberAttribute(attribute, given);
            case "string":
                return this.handleStringAttribute(attribute, given);
        }
    }

    private handleNumberAttribute(requiredAttribute: RequiredAttribute, given: number): boolean {
        switch (requiredAttribute.comparator) {
            case "<":
                return given < Number(requiredAttribute.value);
            case ">":
                return given > Number(requiredAttribute.value);
            case "=":
                return given === Number(requiredAttribute.value);
            default:
                throw new HttpException(`Wrong type of comparator ${requiredAttribute.comparator}, should be one of: <,>,=`, HttpStatus.BAD_REQUEST)
        }
    }

    private handleStringAttribute(attribute: RequiredAttribute, given: string): boolean {
        switch (attribute.comparator) {
            case "=":
                return given === attribute.value;
            default:
                throw new HttpException(`Wrong type of comparator ${attribute.comparator}, should be one of: ['=']`, HttpStatus.BAD_REQUEST)
        }
    }



}