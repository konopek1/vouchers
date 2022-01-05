import { Exclude } from "class-transformer";
import { Asa } from "../asa/asa.entity";
import { Role } from "../authentication/TokenPayload";
import Comparable from "../lib/Comparable";
import Wallet from "../wallet/wallet.entity";
import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export default class User implements Comparable<User> {
    @PrimaryGeneratedColumn()
    public id?: number;

    @Column({ unique: true })
    public email: string;

    @Exclude()
    @Column({ select: false })
    public password: string;

    @ManyToMany(() => Asa)
    @JoinTable()
    public assets: Asa[];

    @OneToMany(() => Wallet, (wallet: Wallet) => wallet.owner)
    public wallets: Wallet[];

    @Column({ default: Role.User })
    public role: Role;

    public compare(u: User): boolean {
        return this.id === u.id;
    }
}

