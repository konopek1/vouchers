import { Exclude } from "class-transformer";
import User from "../user/user.entity";
import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

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

    @Column({ nullable: true })
    escrowContract: string;
}