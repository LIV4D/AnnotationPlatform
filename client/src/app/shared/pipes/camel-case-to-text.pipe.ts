import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'camelCaseToText' })
export class CamelCaseToTextPipe implements PipeTransform {
    transform(value: string): string {
        value = value.charAt(0).toUpperCase() + value.substring(1);
        const res = value.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
        return res;
    }
}
