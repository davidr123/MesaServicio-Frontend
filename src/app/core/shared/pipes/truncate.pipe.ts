import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'TruncatePipe',
})
export class TruncatePipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}
