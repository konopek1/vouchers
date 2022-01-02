import { Exclude } from "class-transformer";
import { Asa } from "src/asa/asa.entity";
import { Role } from "src/authentication/TokenPayload";
import Comparable from "src/lib/Comparable";
import Wallet from "src/wallet/wallet.entity";
import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export default class User implements Comparable<User> {
    @PrimaryGeneratedColumn()
    public id?: number;

    @Column({unique: true})
    public email: string;

    @Exclude()
    @Column({select: false})
    public password: string;

    @ManyToMany(() => Asa)
    @JoinTable()
    public assets: Asa[];

    @OneToMany(() => Wallet, (wallet: Wallet) => wallet.owner)
    public wallets: Wallet[];

    @Column({default: Role.User})
    public role: Role;

    public compare(u: User): boolean {
        return this.id === u.id;
    }
}

