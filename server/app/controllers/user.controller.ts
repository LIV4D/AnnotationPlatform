import * as passport from 'passport';
import * as config from 'config';
import * as express from 'express';
import * as jwt from 'jsonwebtoken';
import TYPES from '../types';
import { inject, injectable } from 'inversify';
import { IController } from './abstractController.controller';
import { UserService } from '../services/user.service';
import { throwIfNotAdmin } from '../utils/userVerification';
import { IUser } from '../interfaces/IUser.interface';

@injectable()
export class UserController implements IController {
    @inject(TYPES.UserService)
    private userService: UserService;

    public setRoutes(app: express.Application): void {
        app.post('/api/users/create', this.createUser);
        app.post('/auth/login', this.loginUser);
        app.put('/api/users/update/:userId', this.updateUser);
        app.delete('/api/users/delete/:userId', this.deleteUser);
        // Get
        app.get('/api/users/get/:userId', this.getUser);
        app.get('/api/users/get/:userId/events', this.getEventsbyUser);
        app.get('/api/users/:userId/last-event', this.getLastEventFromUser);
        // List
        app.get('/api/users/list', this.listUsers);
    }

    private createUser = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        throwIfNotAdmin(req.user);
        const newUser: IUser = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: req.body.password,
            role: req.body.role,
        };
        this.userService.createUser(newUser)
            .then(user => {
                delete user.password;
                delete user.salt;
                return res.json(user);
            })
            .catch(next);
    }

    private loginUser = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        passport.authenticate('local', { session: false, failureRedirect: '/auth/login' }, (err, user, info) => {
            if (err) { return next(err); }
            if (!user) {
                res.status(401);
                return res.send({ information: info });
            }
            // Do not show the salt in the token
            delete user.salt;
            // Object.assign transform a User object into a plain js object.
            const token = jwt.sign(Object.assign({}, user),
                config.get('jwtAuthOptions.secretOrKey'),
                config.get('jwtAuthOptions.jsonWebTokenOptions'));
            // Hide the hash in the response (it is always possible to see the hash in the token)
            delete user.password;
            delete user.salt;
            return res.json({ user, token });
        })(req, res, next);
    }

    private updateUser = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        throwIfNotAdmin(req.user);
        const newUser: IUser = {
            id: req.params.userId,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            password: req.body.password,
            isAdmin: req.body.isAdmin,
        };
        this.userService.updateUser(newUser)
            .then(user => {
                delete user.password;
                delete user.salt;
                return res.json(user);
            })
            .catch(next);
    }

    private deleteUser = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        throwIfNotAdmin(req.user);
        this.userService.deleteUser(req.params.userId)
            .then(() => res.sendStatus(204))
            .catch(next);
    }

    private getUser = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        this.userService.getUser(req.params.userId).then(user => {
            delete user.password;
            delete user.salt;
            res.send(user);
        }).catch(next);
    }

    private getEventsbyUser = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        // throwIfNotAdmin(req);
        this.userService.getEventsFromUser(req.params.userId)
        .then((events) => res.send(events))
        .catch(next);
    }

    private getLastEventFromUser = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        throwIfNotAdmin(req.user);
        this.userService.getLastEventFromUser(req.params.userId).then(event => {
            res.send(event);
        }).catch(next);
    }

    private listUsers = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        throwIfNotAdmin(req.user);
        this.userService.getUsers()
            .then(users => {
                users.forEach(user => {
                    delete user.password;
                    delete user.salt;
                    return user;
                });
                res.send(users);
            })
            .catch(next);
    }
}
