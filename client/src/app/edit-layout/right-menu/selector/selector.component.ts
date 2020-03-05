import { AppService } from './../../../app.service';
import { Component, OnInit } from '@angular/core';
import { SelectorService } from './selector.service';
import { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } from 'constants';

@Component({
    selector: 'app-selector',
    templateUrl: './selector.component.html',
    styleUrls: ['./selector.component.scss']
})
export class SelectorComponent implements OnInit {
    
    constructor(public selectorService: SelectorService) {}

     ngOnInit(): void {}

    diagnosticClicked(d: number): void{
        this.selectorService.diagnostic = d;
    }

    toggleEdema(): void{
        this.selectorService.edema = !this.selectorService.edema;
    }
}
