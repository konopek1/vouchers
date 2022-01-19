import { Asa } from "../asa/asa.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export default class Attribute {
    @PrimaryGeneratedColumn()
    public id?: number;

    @Column({ unique: true })
    public name: string;

    @Column()
    public description: string;

    @Column()
    public kind: AttributeKind;

    @ManyToOne(() => Asa)
    public asa?: Asa;

    @Column({ type: 'jsonb' })
    public constraints: SimpleConstraints;

}

export type ValueType = 'string' | 'number';

export type Comparator = '<' | '>' | '=';

export interface SimpleConstraints {
    comparator: Comparator,
    value: string,
    valueType: ValueType
}

export enum AttributeKind {
    nationality = 'nationality',
    document_number = ' document_number',
    country = 'country',
    zip = 'zip',
    loa = 'loa',
    age = 'age'
}

