import 'reflect-metadata';
import * as crypto from 'crypto';
import { IsEmail, validateSync } from 'class-validator';
import { isNullOrUndefined } from 'util';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { isUndefined } from 'util';
import { SubmissionEvent } from './submissionEvent.model';
import { Task } from './task.model';

@Entity()
export class User {
    // TODO: get rid of this column and put email column as Primary key
    @PrimaryGeneratedColumn('increment')
    public id: number;

    @Column({ length: 254, unique: true })
    @IsEmail()
    public email: string;

    @Column({ length: 32, default: '' })
    public firstName: string;

    @Column({ length: 32, default: '' })
    public lastName: string;

    @Column({ type: 'bytea', select: true })
    public password: Buffer;

    @Column({ type: 'bytea', select: true })
    public salt: Buffer;

    @Column({ default : false })
    isAdmin: boolean;

    @OneToMany(type => Task, task => task.assignedUser)
    public assignedTasks: Task[];

    @OneToMany(type => Task, task => task.assignedUser)
    public createdTasks: Task[];

    @OneToMany(type => SubmissionEvent, evenement => evenement.user)
    public submissions: SubmissionEvent[];

    public static hashPassword(password: string, salt?: Buffer) {
        const size = 64;
        if (isUndefined(salt)) {
            salt = crypto.randomBytes(size);
        }
        return {
            hash: crypto.pbkdf2Sync(password, salt, 20000, size, 'sha512'),
            salt,
        };
    }

    public hashCompare(passwordProvided: string) {
        const hashProvided = User.hashPassword(passwordProvided, this.salt).hash;
        return crypto.timingSafeEqual(this.password, hashProvided);
    }

    public title(): string {
        return this.firstName.split(' ').map(n=>n.length?n.substr(0,1):"").reduce((s, n) => n.length?s+n+". ":s, "") 
                + this.lastName;
    }

    public interface(): IUser{
        return {
            id: this.id,
            firstName: this.firstName,
            lastName: this.lastName,
            email: this.email,
            isAdmin: this.isAdmin
        }
    }

    public update(iuser: IUser){
        if(!isNullOrUndefined(iuser.id))        this.id = iuser.id;
        if(!isNullOrUndefined(iuser.firstName)) this.firstName = iuser.firstName;
        if(!isNullOrUndefined(iuser.lastName))  this.lastName = iuser.lastName;
        if(!isNullOrUndefined(iuser.email))     this.email = iuser.email;
        if(!isNullOrUndefined(iuser.isAdmin))   this.isAdmin = iuser.isAdmin;
        if(!isNullOrUndefined(iuser.password)) {
            const hash = User.hashPassword(iuser.password);
            this.password = hash.hash;
            this.salt = hash.salt;
        }
        
        // Validate
        validateSync(this);
    }

    public static fromInterface(iuser: IUser): User {
        const u = new User();
        u.update(iuser);
        return u;
    }

    public proto(): ProtoUser{
        return {
            id: this.id,
            firstName: this.firstName,
            lastName: this.lastName,
            email: this.email,
            isAdmin: this.isAdmin
        };
    }
}


export interface IUser {
    id?: number;
    firstName?: string;
    lastName?: string;
    email?: string;
    isAdmin?: boolean;
    password?: string;
}

export interface ProtoUser{
    id: number,
    firstName: string,
    lastName: string,
    email: string,
    isAdmin: boolean
}