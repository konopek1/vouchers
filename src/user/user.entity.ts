import { Asa } from "src/asa/asa.entity";
import Comparable from "src/lib/Comparable";
import Wallet from "src/wallet/wallet.entity";
import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export default class User implements Comparable<User> {
    @PrimaryGeneratedColumn()
    public id?: number;

    @Column({unique: true})
    public email: string;

    @Column()
    public password: string;

    @ManyToMany(() => Asa)
    @JoinTable()
    public assets: Asa[];

    @OneToMany(() => Wallet, (wallet: Wallet) => wallet.owner)
    public wallets: Wallet[];

    public compare(u: User): boolean {
        return this.id === u.id;
    }
}

