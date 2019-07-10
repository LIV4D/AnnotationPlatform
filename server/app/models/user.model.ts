import 'reflect-metadata';
import * as crypto from 'crypto';
import { IsEmail } from 'class-validator';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Evenement } from './evenement.model';
import { Task } from './task.model';
import { isUndefined } from 'util';

@Entity()
export class User {
    // TODO: get rid of this column and put email column as Primary key
    @PrimaryGeneratedColumn('increment')
    public id: number;

    @Column({ length: 254, unique: true })
    @IsEmail()
    public email: string;

    @OneToMany(type => Evenement, evenement => evenement.user)
    public evenements: Evenement[];

    @OneToMany(type => Task, task => task.user)
    public tasks: Task[];

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
}
