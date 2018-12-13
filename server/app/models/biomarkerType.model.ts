import 'reflect-metadata';
import { Column, Entity, PrimaryGeneratedColumn, ManyToMany, ManyToOne, JoinTable } from 'typeorm';
import { ImageType } from './imageType.model';

@Entity()
export class BiomarkerType {
    @PrimaryGeneratedColumn()
    public id: number;

    @ManyToMany(type => ImageType, imageType => imageType.biomarkerTypes)
    @JoinTable()
    public imageTypes: ImageType[];

    @ManyToOne(type => BiomarkerType, biomarkerType => biomarkerType.parent)
    public parent: BiomarkerType;

    @Column({ unique: true })
    public name: string;

    @Column()
    public color: string;
}
