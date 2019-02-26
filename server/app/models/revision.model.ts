import 'reflect-metadata';
import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, Unique } from 'typeorm';
import { Image } from './image.model';
import { User } from './user.model';
import { RevisionPrototype } from './revisionPrototype.model';

@Entity()
@Unique(['image', 'user'])
export class Revision {
    @PrimaryGeneratedColumn()
    public id: number;

    @ManyToOne(type => Image, image => image.revisions)
    public image: Image;

    @ManyToOne(type => User, user => user.revisions)
    public user: User;

    @Column()
    public svg: string;

    @Column({ nullable: true, length: 1000 })
    public diagnostic: string;

    prototype(): RevisionPrototype {
        return new RevisionPrototype(this);
    }
}
