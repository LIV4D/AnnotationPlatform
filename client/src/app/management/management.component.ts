import { Component, OnInit, NgModule } from '@angular/core';
import { ManagementFacadeService } from './management.facade.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { isNullOrUndefined } from 'util';

@Component({
  selector: 'app-management',
  templateUrl: './management.component.html',
  styleUrls: ['./management.component.scss']
})
export class ManagementComponent implements OnInit {

    public attributesForCreation: string[];
    public attributeValues: Array<string>;
    public modelName = '';
    public successText = '';
    public availableModels: string[];

    constructor(private facadeService: ManagementFacadeService, private router: Router, private activatedRoute: ActivatedRoute) {
        this.attributeValues = new Array<string>();
        this.activatedRoute.paramMap.subscribe( params => {
            this.modelName = params.get('modelName');
            this.generateTextFields();
        });
    }

    public changeUrlParams() {

        // this.activatedRoute.paramMap.subscribe( params => {
        //     params.
        // });
        // const queryParams: Params = { modelName : this.modelName };
        console.log(this.activatedRoute.firstChild);
        this.router.navigate(
            [this.modelName],
            {
                relativeTo: this.activatedRoute,
                queryParamsHandling: 'merge',
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
    }
}
