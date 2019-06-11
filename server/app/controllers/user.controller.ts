import * as passport from 'passport';
import * as config from 'config';
import * as express from 'express';
import * as jwt from 'jsonwebtoken';
import TYPES from '../types';
import { inject, injectable } from 'inversify';
import { IRegistrableController } from './registrable.controller';
import { UserService } from '../services/user.service';
// import { throwIfNotAdmin } from '../utils/userVerification';
import { IUser } from '../../../common/common_interfaces/interfaces';

@injectable()
export class UserController implements IRegistrableController {
    @inject(TYPES.UserService)
    private userService: UserService;

    public setRoutes(app: express.Application): void {
        app.get('/api/users', this.getUsers);
        app.post('/api/users', this.createUser);
        app.post('/auth/login', this.loginUser);
        app.put('/api/users/:userId', this.updateUser);
        app.delete('/api/users/:userId', this.deleteUser);
    }

    private getUsers = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        // throwIfNotAdmin(req);
        this.userService.getUsers()
            .then(users => res.send(users))
            .catch(next);
    }

    private createUser = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        // throwIfNotAdmin(req);
        const newUser: IUser = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: req.body.password,
            isAdmin: req.body.isAdmin,
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
        passport.authenticate('local', { session: false }, (err, user, info) => {
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
            delete user.hash;
            return res.json({ user, token });
        })(req, res, next);
    }

    private updateUser = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        // throwIfNotAdmin(req);
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
                return res.send(user);
            })
            .catch(next);
    }

    private deleteUser = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        // throwIfNotAdmin(req);
        this.userService.deleteUser(req.params.userId)
            .then(() => res.sendStatus(204))
            .catch(next);
    }
}
