import * as express from 'express';
import { IController } from './abstractController.controller';
import { IAnnotation } from '../../../common/common_interfaces/interfaces';
import { inject, injectable } from 'inversify';
import TYPES from '../types';
import { AnnotationService } from '../services/annotation.service';
import { throwIfNotAdmin } from '../utils/userVerification';

@injectable()
export class AnnotationController implements IController {
    @inject(TYPES.AnnotationService)
    private annotationService: AnnotationService;

    public setRoutes(app: express.Application) {
        app.post('/api/annotation/create', this.createAnnotation);
        app.put('/api/annotation/update/:annotationId', this.updateAnnotation);
        app.delete('/api/annotation/delete/:annotationId', this.deleteAnnotation);
        app.post('/api/annotation/clone/:annotationId', this.cloneAnnotation);
        app.get('/api/annotation/getComment/:annotationId', this.getAnnotationComment);
        app.get('/api/annotation/get/:annotationId', this.getAnnotation);
        app.get('/api/annotation/events/:annotationId', this.getAnnotationEvents);
        app.get('/api/annotation/lastEvent/:annotationId', this.getLastEventFromAnnotation);
    }

    private createAnnotation = (req: express.Request, res: express.Response, next: express.NextFunction) => {

        const newAnnotation: IAnnotation = {
            data: req.body.data,
            imageId: req.body.imageId,
            comment: req.body.comment,
        };
        this.annotationService.create(newAnnotation)
            .then(annotation => res.send(annotation))
            .catch(next);
    }

    private updateAnnotation = (req: express.Request, res: express.Response, next: express.NextFunction) => {

        const newAnnotation: IAnnotation = {
            id: req.params.annotationId as number,
            data: req.body.data,
            imageId: req.body.imageId,
            comment: req.body.comment,
        };
        this.annotationService.update(newAnnotation)
        .then(updatedAnnotation => res.send(updatedAnnotation))
        .catch (next);
    }

    private deleteAnnotation = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        throwIfNotAdmin(req.user.id);
        const oldAnnotation: IAnnotation = {
            id: req.params.annotationId as number,
        };
        this.annotationService.delete(oldAnnotation)
        .then(() => res.sendStatus(204))
        .catch(next);
    }

    private cloneAnnotation = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const annotationInfo: IAnnotation = {
            id: req.params.annotationId as number,
        };
        this.annotationService.getAnnotation(annotationInfo.id)
        .then(originalAnnotation => {
            const newAnnotation: IAnnotation = {
                data: originalAnnotation.data,
                imageId: originalAnnotation.image.id,
                comment: originalAnnotation.comment,
            };
            res.send(this.annotationService.create(newAnnotation));
        })
        .catch(next);
    }

    private getAnnotationComment = (req: express.Request, res: express.Response, next: express.NextFunction) => {
            const annotationRequest: IAnnotation = {
                id: req.params.annotationId as number,
            };
            this.annotationService.getAnnotation(annotationRequest.id)
            .then(annotation => res.send({ comment: annotation.comment }))
            .catch(next);
    }

    private getAnnotation = (req: express.Request, res: express.Response, next: express.NextFunction) => {
            const annotationRequest: IAnnotation = {
                id: req.params.annotationId as number,
            };
            this.annotationService.getAnnotation(annotationRequest.id)
            .then(annotation => res.send(annotation))
            .catch(next);
    }

    private getAnnotationEvents = (req: express.Request, res: express.Response, next: express.NextFunction) => {
            const annotationRequest: IAnnotation = {
                id: req.params.annotationId as number,
            };
            this.annotationService.getAnnotationEvents(annotationRequest.id)
            .then(events => res.send(events))
            .catch(next);
    }

    private getLastEventFromAnnotation = (req: express.Request, res: express.Response, next: express.NextFunction) => {
            const annotationRequest: IAnnotation = {
                id: req.params.annotationId as number,
            };
            this.annotationService.getLastEvent(annotationRequest.id)
            .then(event => res.send(event))
            .catch(next);
    }
}
