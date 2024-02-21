import 'reflect-metadata';
import * as crypto from 'crypto';
import { IsEmail, IsEnum } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Revision } from './revision.model';
import { Task } from './task.model';
import { isUndefined } from 'util';

export enum UserRole {
    Clinician = 'clinician',
    Admin = 'admin',
}

@Entity("users")
export class User {
    @PrimaryGeneratedColumn('uuid')
    public id: string;

    @OneToMany(type => Revision, revision => revision.user)
    public revisions: Revision[];

    @OneToMany(type => Task, task => task.user)
    public tasks: Task[];

    @Column({ length : 32 })
    public name: string;

    @Column({ length: 254, unique: true })
    @IsEmail()
    public email: string;

    @Column({ type: 'bytea', select: false })
    public hash: Buffer;

    @Column({ type: 'bytea', select: false })
    public salt: Buffer;

    @Column()
    @IsEnum(UserRole)
    role: UserRole;

    public static hashPassword(password: string, salt?: Buffer) {
        if (isUndefined(salt)) {
            salt = crypto.randomBytes(64);
        }
        return {
            hash: crypto.pbkdf2Sync(password, salt, 20000, 64, 'sha512'),
            salt,
        };
    }

    public hashCompare(passwordProvided: string) {
        const hashProvided = User.hashPassword(passwordProvided, this.salt).hash;
        return crypto.timingSafeEqual(this.hash, hashProvided);
    }
}
