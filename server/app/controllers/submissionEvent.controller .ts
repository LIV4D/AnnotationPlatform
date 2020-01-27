import * as express from 'express';
import TYPES from '../types';
import { inject, injectable } from 'inversify';
import { IController } from './abstractController.controller';
import { SubmissionEventService } from '../services/submissionEvent.service';
import { isNullOrUndefined } from 'util';


@injectable()
export class SubmissionEventController implements IController {
    @inject(TYPES.TaskService)
    private submissionService: SubmissionEventService;

    public setRoutes(app: express.Application): void {
        // Collection
        app.get('/api/submissionEvent/list', this.list);
        app.get('/api/submissionEvent/get/:id', this.get);
        app.get('/api/submissionEvent/get/:id/:field', this.getField);
    }

    private get = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        this.submissionService.get(req.params.id, req)
            .then(event => {
                res.send(event);
            })
            .catch(next);
    }

    private getField = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        this.submissionService.get(req.params.id, req)
            .then(event => {
                switch(req.params.field){
                    case "proto": res.send(event.prototype()); break
                }
            })
            .catch(next);
    }

    private list = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const filter = {};
        if(!isNullOrUndefined(req.body.userId))
            filter['userId'] = req.body.userId;
        if(!isNullOrUndefined(req.body.imageId))
            filter['imageId'] = req.body.imageId;
        this.submissionService.list(filter);
    }
}
