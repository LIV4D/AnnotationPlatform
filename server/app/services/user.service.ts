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

@injectable()
export class UserService {
    @inject(TYPES.UserRepository)
    private userRepository: UserRepository;
    private loginError = { message: 'Incorrect email or password' };
    private jwtLoginError = { message: 'The auth token provided is not valid' };

    public async loginJwt(payload: any, done: VerifiedCallback): Promise<void> {
        try {
            const user = await this.userRepository.find(payload.id);
            if (user && crypto.timingSafeEqual(new Buffer(user.hash), Buffer.from(payload.hash))) {
                return done(null, user);
            } else {
                return done(null, false, this.jwtLoginError);
            }
        } catch (error) {

            return done(error, false);
        }
    }

    public async loginLocal(email: string, password: string, done: VerifiedCallback): Promise<void> {
        try {
            const user = await this.userRepository.findByEmail(email);
            if (user && user.hashCompare(password)) {
                return done(null, user);
            } else {
                return done(null, false, this.loginError);
            }
        } catch (error) {
            return done(error, false);
        }
    }

    public async createUser(newUser: any): Promise<User> {
        const existentUser = await this.userRepository.findByEmail(newUser.email);
        if (existentUser !== undefined) {
            throw createError('This email is already in use.', 409);
        }
        const result = User.hashPassword(newUser.password);
        const user = new User();
        user.firstName = newUser.firstName;
        user.lastName = newUser.lastName;
        user.email = newUser.email;
        user.isAdmin = newUser.isAdmin;
        // TODO: remember that the hash is encoded in base64
        user.hash = result.hash.toString('base64');
        user.salt = result.salt;
        const errors = await validate(user);
        if (errors.length > 0) {
            throw createErrorFromvalidationErrors(errors);
        }
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

    public async updateUser(newUser: any): Promise<User> {
        const oldUser = await this.getUser(newUser.id);
        if (newUser.firstName != null) {
            oldUser.firstName = newUser.firstName;
        }
        if (newUser.lastName != null) {
            oldUser.lastName = newUser.lastName;
        }
        // TODO: check if isAdmin should have a default value
        if (newUser.isAdmin != null) {
            oldUser.isAdmin = newUser.isAdmin;
        }
        if (newUser.password != null) {
            const result = User.hashPassword(newUser.password);
            oldUser.hash = result.hash.toString('base64');
            oldUser.salt = result.salt;
        }
        const errors = await validate(oldUser);
        if (errors.length > 0) {
            throw createErrorFromvalidationErrors(errors);
        }
        return await this.userRepository.create(oldUser);
    }

    // TODO: test to check if user exists
    public async deleteUser(id: string): Promise<DeleteResult> {
        const user = await this.getUser(id);
        return await this.userRepository.delete(user);
    }
}
