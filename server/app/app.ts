import 'reflect-metadata';
import * as bodyParser from 'body-parser';
// import * as config from 'config';
import * as cookieParser from 'cookie-parser';
import * as cors from 'cors';
import * as express from 'express';
import * as fs from 'fs';
// Morgan is used for logging request details (https://www.npmjs.com/package/morgan).
import * as morgan from 'morgan';
// Passport is used for authenticating requests within express (http://www.passportjs.org/docs/).
import * as passport from 'passport';
import * as passportLocal from 'passport-local';
import * as passportJwt from 'passport-jwt';
import * as path from 'path';
import TYPES from './types';
import { ExtractJwt, StrategyOptions } from 'passport-jwt';
import { injectable } from 'inversify';
import { IController } from './controllers/abstractController.controller';
import { container } from './inversify.config';
import { UserService } from './services/user.service';
import * as config from 'config';
const LocalStrategy = passportLocal.Strategy;
const JwtStrategy = passportJwt.Strategy;

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
        this.errorHandling();
    }

    /**
     * Configures the (morgan) logger and express application with different middleware, tokens and services.
     */
    private config(): void {
        // This line will notify the logger to skip any line which starts with the specified strings when ussed later.
        const skipLog = (req: express.Request): boolean => {
            return !(req.url.startsWith('/api/') || req.url.startsWith('/login') || req.url.startsWith('/auth'));
        };
        this.configTokens();
        // This line specfies the format written in for the logger.
        const format = '[:customDate] :user@:ip-addr | :method :url | :status :response-time[1]ms :res[content-length]';

        this.app.use(morgan(format, { skip: skipLog }));
        this.app.use(bodyParser.json({ limit: '10mb' }));
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use(cookieParser());
        this.app.use(cors());
    }

    /**
     * Tokens are the different information which can be logged using morgan.
     * Therefore, these lines say that there is a user token (the request's sender),
     * a date token (date when the request was sent), and finally an ip-address token (ip)
     */
    private configTokens(): void {
        morgan.token('user', req => req.user ? req.user.name : '-');
        morgan.token('customDate',
                    (req) => { const d = new Date();
                               return d.getDate().toString() + '/' + d.getMonth().toString() + ' ' + d.toTimeString().slice(0, 8); });
        morgan.token('ip-addr', req => req.ip.slice(req.ip.lastIndexOf(':') + 1));
    }

    /**
     * Configures the authentication of the express application to authenticate using JSON web tokens (jwt) for endpoints.
     */
    private authentication(): void {
        const options: StrategyOptions = {
            ...config.get('jwtAuthOptions'),
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        };

        const userService: UserService = container.get<UserService>(TYPES.UserService);
        passport.use(new JwtStrategy(options, userService.loginJwt));
        passport.use(new LocalStrategy({ session: false }, userService.loginLocal));
        this.app.use(passport.initialize());
    }

    /**
     * Gets all the routes defined within the different controllers of the container and associates them with the Express application.
     */
    private routes(): void {
        this.app.use('/api/*', passport.authenticate('jwt', { session: false }));
        const controllers: IController[] = container.getAll<IController>(TYPES.Controller);
        controllers.forEach(controller => controller.setRoutes(this.app));
    }

    /**
     * Serves Angular files in production.
     */
    private staticFiles(): void {
        if (this.app.get('env') === 'production') {
            this.app.use(express.static(this.staticPath));
            const indexPath = path.resolve(this.staticPath + 'index.html');
            if (fs.existsSync(indexPath) === false) {
                throw new Error('Client index not found. Is the client correctly compiled and the static path correctly setup ?');
            }
            this.app.get('/**', (req, res) => res.sendFile(indexPath));
        }
    }

    /**
     * Determines how an error is handled when caught by the server. Different depending on environment.
     */
    private errorHandling(): void {
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
