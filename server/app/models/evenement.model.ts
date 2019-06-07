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

    @Column({ type: 'date' })
    public date: string;

    @Column({ nullable: true })
    public timestamp: string;

    // TODO: is this link really useful? Joining User with Task with Annotation with Evenement gets the job done
    @ManyToOne(type => User, user => user.evenements)
    public user: User;

    @ManyToOne(type => Annotation, annotation => annotation.evenements)
    public annotation: Annotation;

}
