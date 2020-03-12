import * as express from 'express';
import { inject, injectable } from 'inversify';
import { throwIfNotAdmin } from '../utils/userVerification';
import TYPES from '../types';

import { IController } from './abstractController.controller';
import { IAnnotation } from '../interfaces/IAnnotation.interface';
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
        app.get('/api/annotations/getBase', this.getBaseAnnotation);
        app.get('/api/annotations/getEmpty', this.getEmptyAnnotation);
        app.get('/api/annotations/get/:annotationId([0-9]+)', this.getAnnotation);
        app.get('/api/annotations/get/:annotationId([0-9]+)/:attr([a-zA-Z][a-zA-Z0-9]+)', this.getAnnotation);
        app.get('/api/annotations/get', this.getMultipleAnnotations);
        app.get('/api/annotations/get/:attr([a-zA-Z][a-zA-Z0-9]+)', this.getMultipleAnnotations);
    }

    private getEmptyAnnotation = (req: express.Request, res: express.Response, next: express.NextFunction) => {

        const empty_revision = {
            biomarkers: [
                {type: "Lesions",
                 biomarkers: [
                     {type: "Others", color: "#fff4ee",},
                     {type: "Pigmented lesions", color: "#5bffb7"},
                     {type: "Bright",
                      biomarkers: [
                          {type: "Cotton Wool Spots", color: "#7a9d32"},
                          {type: "Drusen", color: "#3cb371"},
                          {type: "Exudates", color: "#85ffa6"},
                          {type: "Uncertain - Bright", color: "#a9ff84"}
                      ]},
                     {type: "Red",
                      biomarkers: [
                          {type: "Hemorrhages", color: "#4b18ff"},
                          {type: "Microaneurysms", color: "#2a63fd"},
                          {type: "Sub-retinal hemorrhage", color: "#7a2afd"},
                          {type: "Pre-retinal hemorrhage", color: "#a12afd"},
                          {type: "Neovascularization", color: "#ba2afd"},
                          {type: "Uncertain - Red", color: "#d62afd"}
                      ]}
                 ]
                },
                {type: "Normal",
                 biomarkers: [
                     {type: "Macula", color: "#be3c1b"},
                     {type: "Optic Nerve",
                      biomarkers: [
                          {type: "Disk", color: "#ddc81c"},
                          {type: "Cup", color: "#dda61c"}
                      ]},
                     {type: "Vasculature",
                      biomarkers: [
                          {type: "Arteries", color: "#dd1c1c"},
                          {type: "Veins", color: "#6d13b2"},
                          {type: "Vessels", color: "#770067"}
                      ]},
                 ],
                }
            ]
        }
        res.send(JSON.stringify(empty_revision));
    }

    private getBaseAnnotation = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const base_revision = "<?xml version='1.0' encoding='UTF-8' standalone='no'?><svg><g></g></svg>";
        res.send({svg: base_revision});
    }

    /**
     * Creates an annotation using the request's information
     * then sends it to be created by the Annotation Service and sent through the response.
     * @param req an express request with annotation data
     * (needs data, imageId and comment (constituents of an annotation interface) in the body and a user)
     * @param res an express response where the annotation data will be put
     * @param next is the following function in the express application
     */
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

    /**
     * Creates an annotation using the updated information from the request
     * then send to the annotation service to update an existing service and is finally sent through the response.
     * @param req an express request with annotation data (needs an annotationID in the params and a user)
     * @param res an express response where the annotation data will be put
     * @param next is the following function in the express application
     */
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

    /**
     * Deletes an annotation specified by the request, but only if the user is an admin.
     * @param req an express request with annotation data (needs an annotationID in the params and a user)
     * @param res an express response where the annotation data will be put
     * @param next is the following function in the express application
     */
    private deleteAnnotation = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        throwIfNotAdmin(req.user);
        this.annotationService.delete(req.params.annotationId)
        .then(() => res.sendStatus(204))
        .catch(next);
    }

    /**
     * Clones an annotation specified by the request then sends it through the response.
     * @param req an express request with annotation data (needs an annotationID in the params and a user)
     * @param res an express response where the annotation data will be put
     * @param next is the following function in the express application
     */
    private cloneAnnotation = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const annotationInfo: IAnnotation = {
            id: req.params.annotationId as number,
        };
        this.annotationService.clone(annotationInfo.id, req.user)
        .then(clonedAnnotation => res.send(clonedAnnotation))
        .catch(next);
    }

    /**
     * Lists all the annotation within the database while checking the types of annotations sent back.
     * @param req an express request with annotation data (needs a field in the params)
     * @param res an express response where the annotation data will be put
     * @param next is the following function in the express application
     */
    private list = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        this.annotationService.getAllAnnotations()
            .then(annotations => {
                res.send(annotations.map(annotation => {
                    switch (req.params.field) {
                        case undefined: return annotation;
                        case 'comment': return annotation.comment;
                        case 'proto': return annotation.proto;
                        case 'data': return annotation.data;
                        case 'submitEvent': return annotation.submitEvent;
                    }
                    return null;
                }));
            }).catch(next);
    }

    /**
     * Gets a specific annotation using an id via the request.
     * @param req an express request with annotation data (needs an annotationId and a field in the params)
     * @param res an express response where the annotation data will be put
     * @param next is the following function in the express application
     */
    private getAnnotation = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        this.annotationService.getAnnotation(parseInt(req.params.annotationId))
        .then(annotation => {
            switch (req.params.field) {
                case undefined: res.send(annotation); break;
                case 'comment': res.send({ comment: annotation.comment }); break;
                case 'proto': res.send(annotation.proto); break;
                case 'data': res.send(annotation.data); break;
                case 'submitEvent': res.send(annotation.submitEvent); break;
            }
        }).catch(next);
    }

    /**
     * Gets multiple specific annotation with the given ids.
     * @param req an express request with annotation data (needs a field in the params and ids in the body)
     * @param res an express response where the annotation data will be put
     * @param next is the following function in the express application
     */
    private getMultipleAnnotations = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        this.annotationService.getAnnotations(req.body.ids)
        .then(annotations => {
            res.send(annotations.map(annotation => {
                switch (req.params.field) {
                    case undefined: return annotation;
                    case 'comment': return annotation.comment;
                    case 'proto': return annotation.proto;
                    case 'data': return annotation.data;
                    case 'submitEvent': return annotation.submitEvent;
                }
                return null;
            }));
        }).catch(next);
    }

}
