import { Asa } from "src/asa/asa.entity";
import User from "src/user/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export default class Wallet {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    publicKey: string;

    @Column()
    encryptedPrivateKey: string;

    @ManyToOne(() => Asa, {eager: true})
    asa: Asa

    @ManyToOne(() => User, (user: User) => user.wallets, { eager: true})
    owner: User;

    @Column({
        type: 'jsonb',
        nullable: true
    })
    metadata: Metadata;
}

export interface Metadata {
    iterations: number;
    nonce: string;
}