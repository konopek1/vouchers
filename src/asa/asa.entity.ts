import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Asa {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    asaID: number;

    @Column()
    name: string;

    @Column()
    unitName: string;

    @Column()
    appID: number;
    
    @Column({nullable: true})
    assetUrl: string;

    @Column({default: false})
    valid: boolean;
}