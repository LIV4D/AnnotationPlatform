import * as express from 'express';
import TYPES from '../types';
import { inject, injectable } from 'inversify';
import { IController } from './abstractController.controller';
import { SubmissionEventService } from '../services/submissionEvent.service';
import { isNullOrUndefined } from 'util';

@injectable()
export class SubmissionEventController implements IController {
    @inject(TYPES.SubmissionEventService)
    private submissionService: SubmissionEventService;

    public setRoutes(app: express.Application): void {
        // Collection
        app.get('/api/submissionEvents/list', this.list);
        app.get('/api/submissionEvents/list/:attr([a-zA-Z][a-zA-Z0-9]+)', this.list);
        app.get('/api/submissionEvents/get/:id([0-9]+)', this.getEvent);
        app.get('/api/submissionEvents/get/:id([0-9]+)/:attr([a-zA-Z][a-zA-Z0-9]+)', this.getEvent);
        app.get('/api/submissionEvents/get', this.getMultipleEvents);
        app.get('/api/submissionEvents/get/:attr([a-zA-Z][a-zA-Z0-9]+)', this.getMultipleEvents);
    }

    /**
     * Gets all the submission events within the database, Can be filtered,
     *
     * Optionally, a filter can be passed through the request's body.
     * @param req an express request with submission event data
     * @param res an express response where the submission data will be put
     * @param next is the following function in the express application
     */
    private list = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const filter = isNullOrUndefined(req.body.filter) ? {} : req.body.filter;
        this.submissionService.getAllEvents(filter)
            .then(events => {
                res.send(events.map(event => {
                    switch (req.params.attr) {
                        case undefined: return event;
                        case 'proto': return event.proto();
                    }
                    return null;
                }));
            }).catch(next);
    }

    /**
     * Gets a submission event attached to an annotation.
     *
     * Requires the annotation id in the parameters of the route.
     * @param req an express request with submission event data
     * @param res an express response where the submission event data will be put
     * @param next is the following function in the express application
     */
    private getEvent = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        this.submissionService.getEvent(+req.params.annotationId)
        .then(event => {
            switch (req.params.attr) {
                case undefined: res.send(event); break;
                case 'proto': res.send(event.proto()); break;
            }
        }).catch(next);
    }

    /**
     * Gets all the submission events that are specified.
     *
     * Requires the submission event ids in the body of the request
     * @param req an express request with submission event data
     * @param res an express response where the submission event data will be put
     * @param next is the following function in the express application
     */
    private getMultipleEvents = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        this.submissionService.getEvents(req.body.ids)
        .then(events => {
            res.send(events.map(event => {
                switch (req.params.attr) {
                    case undefined: return event;
                    case 'proto': return event.proto();
                }
                return null;
            }));
        }).catch(next);
    }
}
