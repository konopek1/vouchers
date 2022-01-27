import { Exclude } from "class-transformer";
import User from "../user/user.entity";
import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import RequiredAttribute from "src/attribute/required_attribute.entity";

@Entity()
export class Asa {
    @PrimaryGeneratedColumn()
    id: number;

    @Exclude()
    @Column({ unique: true })
    asaID: number;

    @Column()
    name: string;

    @Column()
    unitName: string;

    @Column({ nullable: true, unique: true })
    appID: number;

    @Column({ nullable: true })
    assetUrl: string;

    @Column()
    clawback: string;

    @Exclude()
    @Column()
    manager: string;

    @Column({ default: false })
    valid: boolean;

    @ManyToMany(() => User)
    @JoinTable()
    whitelist: User[];

    @OneToMany(() => RequiredAttribute, attr => attr.asa)
    attributes: RequiredAttribute[];

    @Column({ nullable: true })
    escrowContract: string;

    @Column({ nullable: true, type: "bigint" })
    expireDate: number;
}