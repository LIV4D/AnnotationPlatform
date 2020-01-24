import 'reflect-metadata';
import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Annotation } from './annotation.model';
import { Task } from './task.model';

export class Metadata {
    [key: string]: string | number | boolean;
}

@Entity()
export class Image {

    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ unique: true, nullable: true })
    public preprocessing: boolean;

    @Column('jsonb')
    public metadata: Metadata;

    @Column({ nullable: false })
    public type: string;


    @OneToMany(type => Annotation, annotation => annotation.image)
    public annotations: Annotation[];

    @OneToMany(type => Task, task => task.image)
    public tasks: Task[];


    prototype(): ImagePrototype {
        return new ImagePrototype(this);
    }
}


export class ImagePrototype {
    public id: number;
    public type: string;
    public metadata: Metadata;
    public annotationsId: number[];
    public tasksId: number[];

    constructor(image: Image) {
        this.id = image.id;
        this.type = image.type;
        this.metadata = image.metadata;
        this.annotationsId = image.annotations.map(a => a.id);
        this.tasksId = image.tasks.map(t => t.id);
    }
}

export class ImageViewModel {
    public images: Image[];
    public count: number;
}