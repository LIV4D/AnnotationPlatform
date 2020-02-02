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
        app.post('/api/annotations/create', this.createAnnotation);
        app.post('/api/annotations/clone/:annotationId', this.cloneAnnotation);
        app.put('/api/annotations/update/:annotationId', this.updateAnnotation);
        app.delete('/api/annotations/delete/:annotationId', this.deleteAnnotation);

        // List
        app.get('/api/annotations/list', this.list);
        app.get('/api/annotations/list/:attr([a-zA-Z][a-zA-Z0-9]+)', this.list);

        // Get
        app.get('/api/annotations/get/:annotationId([0-9]+)', this.getAnnotation);
        app.get('/api/annotations/get/:annotationId([0-9]+)/:attr([a-zA-Z][a-zA-Z0-9]+)', this.getAnnotation);
        app.get('/api/annotations/get', this.getMultipleAnnotations);
        app.get('/api/annotations/get/:attr([a-zA-Z][a-zA-Z0-9]+)', this.getMultipleAnnotations);
    }

    private createAnnotation = (req: express.Request, res: express.Response, next: express.NextFunction) => {

        const newAnnotation: IAnnotation = {
            data: req.body.data,
            imageId: req.body.imageId,
            comment: req.body.comment,
        };
        this.annotationService.create(newAnnotation, req.user)
            .then(annotation => res.send(annotation.proto()))
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

    private list = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        this.annotationService.getAllAnnotations()
            .then(annotations => {
                res.send(annotations.map(annotation => {
                    switch(req.params.field){
                        case undefined: return annotation;
                        case "comment": return annotation.comment;
                        case "proto": return annotation.proto;
                        case "data": return annotation.data;
                        case "submitEvent": return annotation.submitEvent; 
                    }
                    return null;
                }));
            }).catch(next);
    }

    private getAnnotation = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        this.annotationService.getAnnotation(parseInt(req.params.annotationId))
        .then(annotation => {
            switch(req.params.field){
                case undefined: res.send(annotation); break;
                case "comment": res.send({ comment: annotation.comment }); break;
                case "proto": res.send(annotation.proto); break;
                case "data": res.send(annotation.data); break;
                case "submitEvent": res.send(annotation.submitEvent); break; 
            }
        }).catch(next);
    }

    private getMultipleAnnotations = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        this.annotationService.getAnnotations(req.body.ids)
        .then(annotations => {
            res.send(annotations.map(annotation => {
                switch(req.params.field){
                    case undefined: return annotation;
                    case "comment": return annotation.comment;
                    case "proto": return annotation.proto;
                    case "data": return annotation.data;
                    case "submitEvent": return annotation.submitEvent; 
                }
                return null;
            }));
        }).catch(next);
    }

}
