import 'reflect-metadata';
import { Column, Entity, PrimaryGeneratedColumn, OneToMany, ManyToMany } from 'typeorm';
import { BiomarkerType } from './biomarkerType.model';
import { Image } from './image.model';

@Entity()
export class ImageType {
    @PrimaryGeneratedColumn()
    public id: number;

    @ManyToMany(type => BiomarkerType, biomarkerType => biomarkerType.imageTypes)
    public biomarkerTypes: BiomarkerType[];

    @OneToMany(type => Image, image => image.imageType)
    public images: Image[];

    @Column({ unique: true })
    public name: string;

    @Column()
    public description: string;
}
