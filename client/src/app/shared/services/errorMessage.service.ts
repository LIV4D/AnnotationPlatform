import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export enum ErrorSeverity {
    benign,
    noticeable,
    critical,
}

export class ErrorMessageService {

  constructor() { }
}
