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
        app.get('/api/submissionEvents/list/:attr([a-zA-Z][a-zA-Z0-9]*)', this.list);
        app.get('/api/submissionEvents/get/:id([0-9]+)', this.getEvent);
        app.get('/api/submissionEvents/get/:id([0-9]+)/:attr([a-zA-Z][a-zA-Z0-9]*)', this.getEvent);
        app.get('/api/submissionEvents/get', this.getMultipleEvents);
        app.get('/api/submissionEvents/get/:attr([a-zA-Z][a-zA-Z0-9]*)', this.getMultipleEvents);
    }

    private list = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const filter = isNullOrUndefined(req.body.filter) ? {} : req.body.filter;
        this.submissionService.getAllEvents(filter)
            .then(events => {
                res.send(events.map(event => {
                    switch (req.params.attr) {
                        case undefined: return event;
                        case 'proto': return event.proto;
                    }
                    return null;
                }));
            }).catch(next);
    }

    private getEvent = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        this.submissionService.getEvent(parseInt(req.params.annotationId))
        .then(event => {
            switch (req.params.attr) {
                case undefined: res.send(event); break;
                case 'proto': res.send(event.proto); break;
            }
        }).catch(next);
    }

    private getMultipleEvents = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        this.submissionService.getEvents(req.body.ids)
        .then(events => {
            res.send(events.map(event => {
                switch (req.params.attr) {
                    case undefined: return event;
                    case 'proto': return event.proto;
                }
                return null;
            }));
        }).catch(next);
    }
}
