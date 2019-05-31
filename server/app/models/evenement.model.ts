import { Column, Entity, PrimaryGeneratedColumn, Unique, ManyToOne } from 'typeorm';
import { User } from './user.model';
import { Annotation } from './annotation.model';

@Entity()
@Unique(['annotation', 'user'])
export class Evenement {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column()
    public description: string;

    @Column()
    public date: string;

    @Column()
    public timestamp: string;

    @ManyToOne(type => User, user => user.evenements)
    public user: User;

    @ManyToOne(type => Annotation, annotation => annotation.evenements)
    public annotation: Annotation;

}
