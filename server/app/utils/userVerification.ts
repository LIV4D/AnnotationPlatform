import 'reflect-metadata';
import * as express from 'express';
import { createError } from './error';

// TODO: test if these functions still work

export function throwIfNotAdmin(req: express.Request) {
    if (!req.user.isAdmin) {
        throw createError('User is not admin.', 401);
    }
}
// TODO: this method is never called...
export function isAdmin(req: express.Request) {
    return req.user.isAdmin;
}
