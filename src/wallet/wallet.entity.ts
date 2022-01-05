import { Asa } from "../asa/asa.entity";
import User from "../user/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { WalletState } from "./WalletState";

@Entity()
export default class Wallet {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    publicKey: string;

    @Column()
    encryptedPrivateKey: string;

    @ManyToOne(() => Asa, { eager: true, nullable: true })
    asa: Asa

    @ManyToOne(() => User, (user: User) => user.wallets, { eager: true })
    owner: User;

    @Column({ default: WalletState.NOT_APPROVED })
    approvalState: number

    @Column({ type: 'jsonb' })
    metadata: Metadata;
}

export interface Metadata {
    iterations: number;
    nonce: string;
}

