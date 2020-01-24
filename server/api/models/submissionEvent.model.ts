import { Column, Entity, PrimaryGeneratedColumn, Unique, ManyToOne, OneToOne, BeforeInsert, OneToMany } from 'typeorm';
import { User } from './user.model';
import { Annotation } from './annotation.model';

@Entity()
@Unique(['annotation', 'user'])
export class SubmissionEvent {
    @PrimaryGeneratedColumn('increment')
    public id: number;

    @Column({ nullable: true })
    public description: string;

    @Column({ nullable: true })
    public date: Date;

    @Column({ nullable: true })
    public timestamp: number;

    @ManyToOne(type => User, user => user.submissions)
    public user: User;

    @OneToOne(type => Annotation, annotation => annotation.lastSubmissionEvent, {nullable: true})
    public annotation: Annotation;

    @ManyToOne(type => SubmissionEvent, parentEvent => parentEvent.childSubmission, {nullable: true})
    public parentSubmission: SubmissionEvent;

    @OneToMany(type => SubmissionEvent, child => child.parentSubmission)
    public childSubmission: SubmissionEvent[];

    @BeforeInsert()
    setDate(): void {
        this.date =  new Date(Date.now());
    }

    public prototype(): SubmissionEventPrototype {
        return new SubmissionEventPrototype(this);
    }
}

export class SubmissionEventPrototype {
    public id: number;
    public description: string;
    public date: Date;
    public timestamp: number;
    public user: string;
    
    constructor(submit: SubmissionEvent){
        this.id = submit.id;
        this.description = submit.description;
        this.date = submit.date;
        this.timestamp = submit.timestamp;
        this.user = submit.user.title();
    }
}