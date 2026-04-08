import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'statusLabelPipe',
})
export class StatusLabelPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}
