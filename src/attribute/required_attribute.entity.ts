import { Asa } from "../asa/asa.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import Attribute, { Comparator } from "./attribute.entity";

@Entity()
export default class RequiredAttribute {
    @PrimaryGeneratedColumn()
    public id?: number;

    @ManyToOne(() => Attribute, { eager: true })
    public type: Attribute;

    @ManyToOne(() => Asa)
    public asa?: Asa;

    @Column()
    public value: string;

    @Column()
    public comparator: Comparator;
}


