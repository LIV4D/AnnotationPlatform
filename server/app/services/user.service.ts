import 'reflect-metadata';
import TYPES from '../types';
import * as crypto from 'crypto';
import { inject, injectable } from 'inversify';
import { User, IUser } from '../models/user.model';
import { UserRepository } from '../repository/user.repository';
import { VerifiedCallback } from 'passport-jwt';
import { createError } from '../utils/error';
import { DeleteResult } from 'typeorm';
import { isNullOrUndefined } from 'util';
import { SubmissionEvent } from '../models/submissionEvent.model';

@injectable()
export class UserService {
    @inject(TYPES.UserRepository)
    private userRepository: UserRepository;
    private loginError = { message: 'Incorrect email or password' };
    private jwtLoginError = { message: 'The auth token provided is not valid' };

    public loginJwt = (payload: any, done: VerifiedCallback) => {
        this.userRepository.find(payload.id).then(user => {
            if (user && crypto.timingSafeEqual(user.password, Buffer.from(payload.password))) {
                return done(null, user);
            } else {
                return done(null, false, this.jwtLoginError);
            }
        }).catch(err => done(err, false));
    }

    public loginLocal = (email: string, password: string, done: VerifiedCallback) => {
        this.userRepository.findByEmail(email).then(user => {
            if (user && user.hashCompare(password)) {
                return done(null, user);
            } else {
                return done(null, false, this.loginError);
            }
        }).catch(err => done(err, false));
    }

    public async createUser(newUser: IUser): Promise<User> {
        const email = await this.userRepository.findByEmail(newUser.email);
        if (!isNullOrUndefined(email)) {
            throw createError('This email is already in use.', 409);
        }
        const user = User.fromInterface(newUser);
        return await this.userRepository.create(user);
    }

    public async getUser(id: number): Promise<User> {
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
        oldUser.update(newUser);
        return await this.userRepository.create(oldUser);
    }

    public async deleteUser(id: number): Promise<DeleteResult> {
        const user = await this.getUser(id);
        return await this.userRepository.delete(user);
    }

    public async getEventsFromUser(id: string): Promise<SubmissionEvent[]> {
        return await this.userRepository.getEvents(id);
    }

    public async getLastEventFromUser(id: string): Promise<SubmissionEvent> {
        return await this.userRepository.getLastEvent(id);
    }
}
