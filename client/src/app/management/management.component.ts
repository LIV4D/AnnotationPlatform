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
    public attributeTypes: Array<string>;
    public modelName = '';
    public successText = '';
    public availableModels: string[];
    private queryParams: Params;

    constructor(private facadeService: ManagementFacadeService, public router: Router, public activatedRoute: ActivatedRoute) {
        this.attributeValues = new Array<string>();

    }

    async ngOnInit() {
        this.availableModels = await this.facadeService.getModelNames();

        this.applyUrlParams();
    }

    public applyUrlParams() {
        this.activatedRoute.queryParamMap.subscribe( params => {
            this.modelName = params.has('modelName') ? params.get('modelName') : '';
            this.attributeValues = params.has('attributeValues') ? params.getAll('attributeValues') : [];
            this.generateTextFields();
        })
    }

    public changeUrlParams() {
        this.trimAttributeValueArray();

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

    /**
     * Slices attribute values array to the size of the creation attributes array so that there aren't extraneous slots.
     */
    private trimAttributeValueArray() {
        this.attributeValues = (!isNullOrUndefined(this.attributesForCreation) && this.attributesForCreation.length > 0) ?
                                this.attributeValues.slice(0, this.attributesForCreation.length) :
                                this.attributeValues;
    }

    public async generateTextFields(): Promise<void> {
        if (!isNullOrUndefined(this.modelName) && this.modelName !== '') {
            const properties = await this.facadeService.getAttributesForCreating(this.modelName);
            this.attributesForCreation = properties.get('propertyNames') as string[];
            this.attributeTypes = properties.get('propertyTypes') as string[];
        }
    }

    public inputType(index: number): string {
        if (!isNullOrUndefined(this.attributeTypes) && index < this.attributeTypes.length) {
            return 'Input value of type ' + this.attributeTypes[index];
        }
    }

    public clearValues(): void {
        this.attributeValues = [];
        this.modelName = '';
    }

    public async createModel(eventName: string): Promise<void> {
        this.successText = 'Event loading...';
        this.changeUrlParams();
        this.successText = await this.facadeService.sendHttpEvent(eventName, this.attributesForCreation, this.attributeValues);
    }
}
