import { Column, Entity, PrimaryGeneratedColumn, OneToMany, Unique, Timestamp, ManyToOne } from 'typeorm';
import { User } from './user.model'
import { Annotation } from './annotation.model';

@Entity()
@Unique(['annotation'])
export class Evenement {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column()
    public description: string;

    @Column()
    public date: Date;

    @Column()
    public timestamp: Timestamp;

    @ManyToOne(type => User, user => user.evenements)
    public user: User;

    @ManyToOne(type => Annotation, annotation => annotation.evenements)
    public annotation: Annotation;

}
