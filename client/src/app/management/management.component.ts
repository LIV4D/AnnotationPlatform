import { Component, OnInit, NgModule } from '@angular/core';
import { ManagementFacadeService } from './management.facade.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';

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

    constructor(private facadeService: ManagementFacadeService, private router: Router) {
        this.attributeValues = new Array<string>();
    }

    async ngOnInit() {
        this.availableModels = await this.facadeService.getModelNames();
    }

    public async generateTextFields(): Promise<void> {
        this.attributesForCreation = await this.facadeService.getAttributesForCreating(this.modelName);
        this.modelName = '';
    }

    public createModel(): void {
        this.successText = 'Event loading...';
        this.successText = this.facadeService.sendCreationEvent(this.attributesForCreation, this.attributeValues);
    }
}
