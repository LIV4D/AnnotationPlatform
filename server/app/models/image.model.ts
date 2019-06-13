import 'reflect-metadata';
import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Annotation } from './annotation.model';
// import { Task } from './task.model';
import { ImagePrototype } from './imagePrototype.model';
import { Task } from './task.model';

@Entity()
export class Image {

    @PrimaryGeneratedColumn()
    public id: number;

    @OneToMany(type => Annotation, annotation => annotation.image)
    public annotations: Annotation[];

    @OneToMany(type => Task, task => task.image)
    public tasks: Task[];

    @Column({ unique: true })
    public path: string;

    @Column({ unique: true, nullable: false })
    public preprocessingPath: string;

    @Column({ unique: true, nullable: true })
    public thumbnail: string;

    @Column({ nullable: true })
    public metadata: string; // nom de l'image + info supp

    @Column({ nullable: false })
    public type: string;

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
