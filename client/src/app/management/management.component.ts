import { Component, OnInit, NgModule } from '@angular/core';
import { ManagementFacadeService } from './management.facade.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';

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
        this.activatedRoute.params.subscribe( params => {
            this.modelName = params.modelName;
            this.generateTextFields();
        });
    }

    // public changeUrlParams() {
    //     const queryParams: Params = { modelName : this.modelName };
    //     this.router.navigate(
    //         [],
    //         {
    //             relativeTo: this.activatedRoute,
    //             queryParams,
    //             queryParamsHandling: 'merge'
    //         }
    //     )
    // }

    async ngOnInit() {
        this.availableModels = await this.facadeService.getModelNames();
    }

    public async generateTextFields(): Promise<void> {
        this.attributesForCreation = await this.facadeService.getAttributesForCreating(this.modelName);
        // this.changeUrlParams();
    }

    public createModel(eventName: string): void {
        this.successText = 'Event loading...';
        this.successText = this.facadeService.sendHttpEvent(eventName, this.attributesForCreation, this.attributeValues);
    }
}
