import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Asa {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    asaId: string;

    @Column()
    name: string;

    @Column()
    unitName: string;
    
    @Column({nullable: true})
    assetUrl: string;
}