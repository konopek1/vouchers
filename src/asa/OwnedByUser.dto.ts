import { Asa } from "./asa.entity";

export class OwnedByUserAsasDto {
    constructor(
        public readonly ownedByUser: Asa[],
        public readonly rest: Asa[]
        ) { }    
}