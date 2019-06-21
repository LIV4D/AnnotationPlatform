import 'reflect-metadata';
import * as bodyParser from 'body-parser';
// import * as config from 'config';
import * as cookieParser from 'cookie-parser';
import * as cors from 'cors';
import * as express from 'express';
import * as fs from 'fs';
import * as morgan from 'morgan';
import * as passport from 'passport';
import * as passportLocal from 'passport-local';
// import * as passportJwt from 'passport-jwt';
import * as path from 'path';
import TYPES from './types';
// import { ExtractJwt, StrategyOptions } from 'passport-jwt';
import { injectable } from 'inversify';
import { IController } from './controllers/abstractController.controller';
import { container } from './inversify.config';
import { UserService } from './services/user.service';

const LocalStrategy = passportLocal.Strategy;
// const JwtStrategy = passportJwt.Strategy;

@injectable()
export class Application {

    private readonly internalError: number = 500;
    private readonly staticPath: string = '../client/dist/';
    public app: express.Application;

    constructor() {
        this.app = express();
        this.config();
        this.authentication();
        this.routes();
        this.staticFiles();
        this.errorHandeling();
    }

    private config(): void {
        const skipLog = (req: express.Request): boolean => {
            return !(req.url.startsWith('/api/') || req.url.startsWith('/login') || req.url.startsWith('/auth'));
        };
        morgan.token('user', req => req.user ? req.user.name : '-');
        morgan.token('customDate',
                    (req) => { const d = new Date();
                               return d.getDate().toString() + '/' + d.getMonth().toString() + ' ' + d.toTimeString().slice(0, 8); });
        morgan.token('ip-addr', req => req.ip.slice(req.ip.lastIndexOf(':') + 1));
        const f = '[:customDate] :user@:ip-addr | :method :url | :status :response-time[1]ms :res[content-length]';
        this.app.use(morgan(f, { skip: skipLog }));
        this.app.use(bodyParser.json({ limit: '10mb' }));
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use(cookieParser());
        this.app.use(cors());
    }

    private staticFiles(): void {
        // Serve Angular files in production
        if (this.app.get('env') === 'production') {
            this.app.use(express.static(this.staticPath));
            const indexPath = path.resolve(this.staticPath + 'index.html');
            if (fs.existsSync(indexPath) === false) {
                throw new Error('Client index not found. Is the client correctly compiled and the static path correctly setup ?');
            }
            this.app.get('/**', (req, res) => res.sendFile(indexPath));
        }
    }

    private authentication(): void {
        // const options: StrategyOptions = {
        //     ...config.get('jwtAuthOptions'),
        //     jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        // };

        const userService: UserService = container.get<UserService>(TYPES.UserService);
        // passport.use(new JwtStrategy(options, userService.loginJwt));
        passport.use(new LocalStrategy({ session: false }, userService.loginLocal));
        this.app.use(passport.initialize());
    }

    private routes(): void {
        // this.app.use('/api/*', passport.authenticate('jwt', { session: false }));
        const controllers: IController[] = container.getAll<IController>(TYPES.Controller);
        controllers.forEach(controller => controller.setRoutes(this.app));
    }

    private errorHandeling(): void {
        this.app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
            const err: any = new Error('Not Found');
            err.status = 404;
            next(err);
        });

        // development error handler
        // will print stacktrace
        if (this.app.get('env') !== 'production') {
            // tslint:disable-next-line:no-any
            this.app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
                console.error(err);
                res.status(err.status || this.internalError);
                res.send({
                    message: err.message,
                    stacktrace: err.stack,
                });
            });
        } else {
            // production error handler
            // no stacktraces leaked to user (in production env only)
            // tslint:disable-next-line:no-any
            this.app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
                res.status(err.status || this.internalError);
                res.send({
                    message: err.message,
                });
            });
        }
    }
}
