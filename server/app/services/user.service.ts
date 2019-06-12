import 'reflect-metadata';
import TYPES from '../types';
import * as crypto from 'crypto';
import { inject, injectable } from 'inversify';
import { User } from '../models/user.model';
import { UserRepository } from '../repository/user.repository';
import { VerifiedCallback } from 'passport-jwt';
import { validate } from 'class-validator';
import { createErrorFromvalidationErrors, createError } from '../utils/error';
import { DeleteResult } from 'typeorm';
import { isNull } from 'util';
import { IUser } from '../../../common/common_interfaces/interfaces';

@injectable()
export class UserService {
    @inject(TYPES.UserRepository)
    private userRepository: UserRepository;
    private loginError = { message: 'Incorrect email or password' };
    private jwtLoginError = { message: 'The auth token provided is not valid' };

    public loginJwt = (payload: any, done: VerifiedCallback) => {
        this.userRepository.find(payload.id).then(user => {
            if (user && crypto.timingSafeEqual(user.password, Buffer.from(payload.hash))) {
                return done(null, user);
            } else {
                return done(null, false, this.jwtLoginError);
            }
        }).catch(err => done(err, false));
    }

    public loginLocal = (email: string, password: string, done: VerifiedCallback) => {
        this.userRepository.findByEmail(email).then(user => {
            console.log('user: ' + JSON.stringify(user));
            if (user && user.hashCompare(password)) {
                return done(null, user);
            } else {
                return done(null, false, this.loginError);
            }
        }).catch(err => done(err, false));
    }

    public async createUser(newUser: IUser): Promise<User> {
        const email = await this.userRepository.findByEmail(newUser.email);
        if (email !== undefined) {
            throw createError('This email is already in use.', 409);
        }
        const result = User.hashPassword(newUser.password);
        const user = new User();
        Object.keys(user).forEach((key) => {
            // TODO: detele console.log when finished
            console.log(user[key]);
            switch (key) {
                case 'password':
                    user[key] = result.hash;
                    break;
                case 'salt':
                    user[key] = result.salt;
                    break;
                default:
                    user[key] = newUser[key];
            }
        });
        await validate(user).then(errors => {
            if (errors.length > 0) {
                throw createErrorFromvalidationErrors(errors);
            }
        });
        return await this.userRepository.create(user);
    }

    public async getUser(id: string): Promise<User> {
        const user = await this.userRepository.find(id);
        if (user == null) {
            throw createError('This user does not exist', 404);
        }
        return user;
    }

    public async getUsers(): Promise<User[]> {
        return await this.userRepository.findAll();
    }

    public async updateUser(newUser: IUser): Promise<User> {
        const oldUser = await this.getUser(newUser.id);
        if (!isNull(newUser.firstName)) {
            oldUser.firstName = newUser.firstName;
        }
        if (!isNull(newUser.lastName)) {
            oldUser.lastName = newUser.lastName;
        }
        if (!isNull(newUser.isAdmin)) {
            oldUser.isAdmin = newUser.isAdmin;
        }
        if (!isNull(newUser.password)) {
            const result = User.hashPassword(newUser.password);
            oldUser.password = result.hash;
            oldUser.salt = result.salt;
        }
        await validate(oldUser).then(errors => {
            if (errors.length > 0) {
                throw createErrorFromvalidationErrors(errors);
            }
        });
        return await this.userRepository.create(oldUser);
    }

    public async deleteUser(id: string): Promise<DeleteResult> {
        const user = await this.getUser(id);
        return await this.userRepository.delete(user);
    }
}
