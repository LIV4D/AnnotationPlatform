import 'reflect-metadata';
import * as crypto from 'crypto';
import { IsEmail } from 'class-validator';
import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { Evenement } from './evenement.model'
import { Task } from './task.model';
import { isUndefined } from 'util';

export enum UserRole {
    Clinician = 'clinician',
    Admin = 'admin',
}

@Entity()
export class User {
    @PrimaryColumn({ length: 16 })
    public id: string;

    @OneToMany(type => Evenement, evenement => evenement.user)
    public evenements: Evenement[];

    @OneToMany(type => Task, task => task.user)
    public tasks: Task[];

    @Column({ length: 32 })
    public firstName: string;

    @Column({ length: 32 })
    public lastName: string;

    @Column({ length: 254, unique: true })
    @IsEmail()
    public email: string;

    @Column({ select: false })
    public hash: string;

    @Column({ select: false })
    public salt: string;

    @Column({ default : false })
    isAdmin: boolean;

    public static hashPassword(password: string, salt?: string) {
        if (isUndefined(salt)) {
            salt = crypto.randomBytes(64).toString();
        }
        return {
            hash: crypto.pbkdf2Sync(password, salt, 20000, 64, 'sha512'),
            salt,
        };
    }

    public hashCompare(passwordProvided: string) {
        const hashProvided = User.hashPassword(passwordProvided, this.salt).hash;
        return crypto.timingSafeEqual(new Buffer(this.hash), hashProvided);
    }
}
