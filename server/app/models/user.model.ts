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

    @Column({ type: 'bytea', select: false })
    public password: Buffer;

    @Column({ type: 'bytea', select: false })
    public salt: Buffer;

    @Column({ default : false })
    isAdmin: boolean;

    public static hashPassword(password: string, salt?: Buffer) {
        if (isUndefined(salt)) {
            const saltSize = 64;
            salt = crypto.randomBytes(saltSize);
        }
        return {
            hash: crypto.pbkdf2Sync(password, salt, 20000, 64, 'sha512'),
            salt,
        };
    }

    public hashCompare(passwordProvided: string) {
        const hashProvided = User.hashPassword(passwordProvided, this.salt).hash;
        return crypto.timingSafeEqual(this.password, hashProvided);
    }
}
