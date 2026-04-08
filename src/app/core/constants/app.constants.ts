import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-constants.guard',
  imports: [],
  template: `<p>constants.guard works!</p>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConstantsGuard { }
