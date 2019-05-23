import 'reflect-metadata';
import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, /*Unique,*/ OneToMany, Timestamp } from 'typeorm';
import { Image } from './image.model';
import { User } from './user.model';
import { AnnotationPrototype } from './annotationPrototype.model';
import { Evenement } from './evenement.model';

@Entity()
// @Unique(['image', 'user'])
export class Annotation {
    @PrimaryGeneratedColumn()
    public id: number;

    @ManyToOne(type => Image, image => image.annotations)
    public image: Image;

    @OneToMany(type => Evenement, evenements => evenements.annotation)
    public evenements: Evenement[];

    @Column()
    public svg: string;

    @Column()
    public comment: string;

    prototype(): AnnotationPrototype {
        return new AnnotationPrototype(this);
    }
}
