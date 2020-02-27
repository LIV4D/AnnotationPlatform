import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ManagementFacadeService } from './management.facade.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-management',
  templateUrl: './management.component.html',
  styleUrls: ['./management.component.scss']
})
export class ManagementComponent implements OnInit {

    public attributesForCreation: any[];
    public modelName = '';

    constructor(private facadeService: ManagementFacadeService, private router: Router) { }

    ngOnInit() {
    }

    public generateTextFields(): void {
        this.getAttributesForCreating(this.modelName);
    }

    public getAttributesForCreating(model: string): void {
        this.facadeService.getAttributesForCreating(model);
    }
    // ok so, need a function to load a model.
    // need a function to put that model into text fields.
    // so for each attribute of the interface, create a text field.
    // need a function to send the text fields chosen to the database so it can be created.
}
