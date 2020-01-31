import * as express from 'express';
import { inject, injectable } from 'inversify';
import { throwIfNotAdmin } from '../utils/userVerification';
import TYPES from '../types';

import { IController } from './abstractController.controller';
import { IAnnotation } from '../models/annotation.model';
import { AnnotationService } from '../services/annotation.service';


@injectable()
export class AnnotationController implements IController {
    @inject(TYPES.AnnotationService)
    private annotationService: AnnotationService;

    public setRoutes(app: express.Application) {
        app.post('/api/annotation/create', this.createAnnotation);
        app.put('/api/annotation/update/:annotationId', this.updateAnnotation);
        app.delete('/api/annotation/delete/:annotationId', this.deleteAnnotation);
        app.post('/api/annotation/clone/:annotationId', this.cloneAnnotation);
        app.get('/api/annotation/get/:annotationId', this.getAnnotation);
        app.get('/api/annotation/get/:annotationId/lastEvent', this.getLastEventFromAnnotation);
        app.get('/api/annotation/get/:annotationId/:field', this.getAnnotationField);
    }

    private createAnnotation = (req: express.Request, res: express.Response, next: express.NextFunction) => {

        const newAnnotation: IAnnotation = {
            data: req.body.data,
            imageId: req.body.imageId,
            comment: req.body.comment,
        };
        this.annotationService.create(newAnnotation, req.user)
            .then(annotation => res.send(annotation))
            .catch(next);
    }

    private updateAnnotation = (req: express.Request, res: express.Response, next: express.NextFunction) => {

        const newAnnotation: IAnnotation = {
            id: req.params.annotationId as number,
            data: req.body.data,
            comment: req.body.comment,
        };
        this.annotationService.update(newAnnotation, req.user)
                            .then(updatedAnnotation => res.send(updatedAnnotation))
                            .catch (next);
    }

    private deleteAnnotation = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        throwIfNotAdmin(req.user);
        this.annotationService.delete(req.params.annotationId)
        .then(() => res.sendStatus(204))
        .catch(next);
    }

    private cloneAnnotation = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const annotationInfo: IAnnotation = {
            id: req.params.annotationId as number,
        };
        this.annotationService.clone(annotationInfo.id, req.user)
        .then(clonedAnnotation => res.send(clonedAnnotation))
        .catch(next);
    }

    private getAnnotation = (req: express.Request, res: express.Response, next: express.NextFunction) => {
            this.annotationService.getAnnotation(parseInt(req.params.annotationId))
            .then(annotation => res.send(annotation))
            .catch(next);
    }

    private getAnnotationField = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        this.annotationService.getAnnotation(parseInt(req.params.annotationId))
        .then(annotation => {
            switch(req.params.field){
                case "comment": res.send({ comment: annotation.comment }); break
                case "proto": res.send(annotation.proto); break
                case "data": res.send(annotation.data); break
            }
        }).catch(next);
}

    private getLastEventFromAnnotation = (req: express.Request, res: express.Response, next: express.NextFunction) => {
            const annotationRequest: IAnnotation = {
                id: req.params.annotationId as number,
            };
            this.annotationService.getLastSubmissionEvent(annotationRequest.id)
            .then(events => res.send(events))
            .catch(next);
    }
}
