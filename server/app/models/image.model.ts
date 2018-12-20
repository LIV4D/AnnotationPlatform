import 'reflect-metadata';
import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { ImageType } from './imageType.model';
import { Preprocessing } from './preprocessing.model';
import { Revision } from './revision.model';
import { Task } from './task.model';

@Entity()
export class Image {
    @PrimaryGeneratedColumn()
    public id: number;

    @ManyToOne(type => ImageType, imageType => imageType.images)
    public imageType: ImageType;

    @OneToMany(type => Preprocessing, preprocessing => preprocessing.image)
    public preprocessings: Preprocessing[];

    @OneToMany(type => Revision, revision => revision.image)
    public revisions: Revision[];

    @OneToMany(type => Task, task => task.image)
    public tasks: Task[];

    @Column({ unique: true })
    public path: string;

    @Column({ nullable: true })
    public finalRevision: string;

    @Column()
    public baseRevision: string;

    @Column()
    public eye: string;

    @Column({ nullable: true })
    public hospital: string;

    @Column({ nullable: true })
    public patient: string;

    @Column({ nullable: true })
    public visit: string;

    // A visit can have multiple images taken, images within the same visit are differentiated by a code.
    // This code is unique only to a specific visit
    @Column({ nullable: true })
    public code: string;

    // Extra information may be added later in the form of a JSON string
    @Column({ nullable: true })
    public extra: string;

    get thumbnailPath(): string {
        const path = this.path;
        const imgDirname = path.match(/.*\//);
        const imgBasename = path.replace(/.*\//, '');
        return imgDirname + '/' + 'thumbnailI' + imgBasename.substr(1);  // HACKISH
    }
}
