import 'reflect-metadata';
import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Annotation } from './annotation.model';
import { Task } from './task.model';
import { ImagePrototype } from './imagePrototype.model';

@Entity()
export class Image {
    @PrimaryGeneratedColumn()
    public id: number;
    // TODO: what should I do with preprocessing images ( i.e include path or create thumbnail?)
    @OneToMany(type => Annotation, annotation => annotation.image)
    public annotations: Annotation[];

    @OneToMany(type => Task, task => task.image)
    public tasks: Task[];

    @Column({ unique: true })
    public path: string;

    @Column({ unique: true, nullable: false })
    public preprocessingPath: string;

    @Column({ unique: true, nullable: false })
    public thumbnail: string;

    // TODO: figure out what to do with this method
    // get thumbnailPath(): string {
    //     const path = this.path;
    //     const imgDirname = path.match(/.*\//);
    //     const imgBasename = path.replace(/.*\//, '');
    //     return imgDirname + '/' + 'thumbnailI' + imgBasename.substr(1);  // HACKISH
    // }

    prototype(): ImagePrototype {
        return new ImagePrototype(this);
    }
}
