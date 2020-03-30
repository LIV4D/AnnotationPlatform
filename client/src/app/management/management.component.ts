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

    constructor(private facadeService: ManagementFacadeService, public router: Router, public activatedRoute: ActivatedRoute) {
        this.attributeValues = new Array<string>();

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
        const queryParams: Params = { modelName : this.modelName, attributeValues : this.attributeValues };
        this.router.navigate(
            [],
            {
                relativeTo: this.activatedRoute,
                queryParams,
                queryParamsHandling: 'merge'
            }
        )
    }

    async ngOnInit() {
        this.availableModels = await this.facadeService.getModelNames();
    }

    public async generateTextFields(): Promise<void> {
        if (!isNullOrUndefined(this.modelName) && this.modelName !== '') {
            this.attributesForCreation = await this.facadeService.getAttributesForCreating(this.modelName);
            this.changeUrlParams();
        }
    }

    public createModel(eventName: string): void {
        this.successText = 'Event loading...';
        this.successText = this.facadeService.sendHttpEvent(eventName, this.attributesForCreation, this.attributeValues);
        this.changeUrlParams();
    }
}
