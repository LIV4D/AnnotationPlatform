import 'reflect-metadata';
import * as express from 'express';
import { UserRole } from '../models/user.model';
import { createError } from './error';

export function throwIfNotAdmin(req: express.Request) {
    if (req.user.role !== UserRole.Admin) {
        throw createError('User is not admin.', 401);
    }
}

export function isAdmin(req: express.Request) {
    return req.user.role === UserRole.Admin;
}
