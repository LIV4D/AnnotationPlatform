import 'reflect-metadata';
import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { Image } from './image.model';
import { AnnotationPrototype } from './annotationPrototype.model';
import { Evenement } from './evenement.model';
import { Task } from './task.model';

@Entity()
export class Annotation {

    @PrimaryGeneratedColumn()
    public id: number;

    @ManyToOne(type => Image, image => image.annotations)
    public image: Image;

    @OneToMany(type => Evenement, evenements => evenements.annotation)
    public evenements: Evenement[];

    @OneToMany(type => Task, tasks => tasks.annotation)
    public tasks: Task[];

    @Column({ type: 'varchar', nullable: true }) // TODO: do we count the first svg from algo?
    // TODO: have svg in JSON if possible
    public svg: string;

    @Column()
    public comment: string;

    // rajouter un champ pour lier a l'annotation precedente

    prototype(): AnnotationPrototype {
        return new AnnotationPrototype(this);
    }
}
