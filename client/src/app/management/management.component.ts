import { Component, OnInit, NgModule } from '@angular/core';
import { ManagementFacadeService } from './management.facade.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { isNullOrUndefined } from 'util';
import { IRoutable } from '../shared/interfaces/IRoutable.interface';

@Component({
  selector: 'app-management',
  templateUrl: './management.component.html',
  styleUrls: ['./management.component.scss']
})
export class ManagementComponent implements OnInit, IRoutable {

    public attributesForCreation: string[];
    public attributeValues: Array<string>;
    public modelName = '';
    public successText = '';
    public availableModels: string[];
    private queryParams: Params;

    constructor(private facadeService: ManagementFacadeService, public router: Router, public activatedRoute: ActivatedRoute) {
        this.attributeValues = new Array<string>();

    }

    public applyUrlParams() {
        this.activatedRoute.queryParamMap.subscribe( params => {
            this.modelName = params.has('modelName') ? params.get('modelName') : '';
            this.attributeValues = params.has('attributeValues') ? params.getAll('attributeValues') : [];
            this.generateTextFields();
        })
    }

    public changeUrlParams() {
        // Slices attribute values to the size of the creation attributes so that there aren't extraneous slots.
        this.attributeValues = (!isNullOrUndefined(this.attributesForCreation) && this.attributesForCreation.length > 0) ?
                                this.attributeValues.slice(0, this.attributesForCreation.length) :
                                this.attributeValues;

        // Version is necessary so that the route ALWAYS updates.
        // For the moment, Angular is bugged (https://github.com/angular/angular/issues/17609) so it is necessary.
        this.queryParams = { modelName : this.modelName, attributeValues : this.attributeValues, version : Math.random() };
        this.router.navigate(
            [],
            {
                relativeTo: this.activatedRoute,
                queryParams : this.queryParams,
                queryParamsHandling: 'merge'
            }
        )
    }

    async ngOnInit() {
        this.availableModels = await this.facadeService.getModelNames();

        this.applyUrlParams();
    }

    public async generateTextFields(): Promise<void> {
        if (!isNullOrUndefined(this.modelName) && this.modelName !== '') {
            this.attributesForCreation = await this.facadeService.getAttributesForCreating(this.modelName);
        }
    }

    public clearValues() {
        this.attributeValues = [];
        this.modelName = '';
    }

    public async createModel(eventName: string): Promise<void> {
        this.successText = 'Event loading...';
        this.changeUrlParams();
        this.successText = await this.facadeService.sendHttpEvent(eventName, this.attributesForCreation, this.attributeValues);
    }
}
