import 'reflect-metadata';
import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, Unique } from 'typeorm';
import { Image } from './image.model';
import { PreprocessingType } from './preprocessingType.model';

@Entity()
@Unique(['image', 'preprocessingType'])
export class Preprocessing {
    @PrimaryGeneratedColumn()
    public id: number;

    @ManyToOne(type => Image, image => image.preprocessings)
    public image: Image;

    @Column({ unique: true })
    public path: string;

    @ManyToOne(type => PreprocessingType, preprocessingType => preprocessingType.preprocessings)
    public preprocessingType: Preprocessing;
}
