import { Component, Input } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-no-data',
  templateUrl: './no-data.component.html',
  styleUrls: ['./no-data.component.css'],
})
export class NoDataComponent {
  @Input() title = 'Sin datos';
  @Input() message = 'No hay información para mostrar en este momento';
}
