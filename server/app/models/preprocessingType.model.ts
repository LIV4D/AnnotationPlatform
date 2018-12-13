import 'reflect-metadata';
import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Preprocessing } from './preprocessing.model';

@Entity()
export class PreprocessingType {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column()
    public description: string;

    @Column({ unique: true })
    public name: string;

    @OneToMany(type => Preprocessing, preprocessing => preprocessing.preprocessingType)
    public preprocessings: Preprocessing[];
}
