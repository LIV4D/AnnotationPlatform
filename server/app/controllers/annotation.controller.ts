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
        app.post('api/annotation/create', this.createAnnotation);
        app.put('api/annotation/update/:annotationId', this.updateAnnotation);
        app.delete('api/annotation/delete/:annotationId', this.deleteAnnotation);
        app.post('api/annotation/clone/:annotationId', this.cloneAnnotation);
        app.get('api/annotation/getComment/:annotationId', this.getAnnotationComment);
        app.get('api/annotation/get/:annotationid', this.getAnnotation);
        app.get('api/annotation/events/:annotationId', this.getAnnotationEvents);
        app.get('api/annotation/lastEvent/:annotationId', this.getLastEventFromAnnotation);
    }

    private async createAnnotation(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            const newAnnotation: IAnnotation = {
                data: req.body.data,
                imageId: req.body.imageId,
                comment: req.body.comment,
            };
            const annotation = await this.annotationService.create(newAnnotation);
            res.send(annotation);
        } catch (error) {
            next(error);
        }
    }

    private async updateAnnotation(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            const newAnnotation: IAnnotation = {
                id: req.params.annotationId as number,
                data: req.body.data,
                imageId: req.body.imageId,
                comment: req.body.comment,
            };
            const updatedAnnotation = await this.annotationService.update(newAnnotation);
            res.send(updatedAnnotation);
        } catch (error) {
            next(error);
        }
    }

    private async deleteAnnotation(req: express.Request, res: express.Response, next: express.NextFunction) {
        throwIfNotAdmin(req.user.id);
        try {
            const oldAnnotation: IAnnotation = {
                id: req.params.annotationId as number,
            };
            await this.annotationService.delete(oldAnnotation);
            res.sendStatus(204);
        } catch (error) {
            next(error);
        }
    }

    private async cloneAnnotation(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            const annotationInfo: IAnnotation = {
                id: req.params.annotationId as number,
            };
            const originalAnnotation = await this.annotationService.getAnnotation(annotationInfo.id);
            const newAnnotation: IAnnotation = {
                data: originalAnnotation.data,
                imageId: originalAnnotation.image.id,
                comment: originalAnnotation.comment,
            };
            res.send(this.annotationService.create(newAnnotation));
        } catch (error) {
            next(error);
        }
    }

    private async getAnnotationComment(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
                const annotationRequest: IAnnotation = {
                    id: req.params.annotationId as number,
                };
                const annotation = await this.annotationService.getAnnotation(annotationRequest.id);
                res.send(annotation.comment);
        } catch (error) {
            next(error);
        }
    }

    private async getAnnotation(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            const annotationRequest: IAnnotation = {
                id: req.params.annotationId as number,
            };
            res.send(await this.annotationService.getAnnotation(annotationRequest.id));
        } catch (error) {
            next(error);
        }
    }

    private async getAnnotationEvents(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            const annotationRequest: IAnnotation = {
                id: req.params.annotationId as number,
            };
            const events = await this.annotationService.getAnnotationEvents(annotationRequest.id);
            res.send(events);
        } catch (error) {
            next(error);
        }
    }

    private async getLastEventFromAnnotation(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            const annotationRequest: IAnnotation = {
                id: req.params.annotationId as number,
            };
            const event = await this.annotationService.getLastEvent(annotationRequest.id);
            res.send(event);
        } catch (error) {
            next(error);
        }
    }
}
