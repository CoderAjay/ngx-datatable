import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'empty-data-demo',
  template: `
    <div>
      <h3>
        Empty Demo
      </h3>
      <ngx-datatable
        class="dark"
        style="min-height: 400px;"
        #mydatatable
        [headerHeight]="50"
        [limit]="5"
        [columnMode]="'force'"
        [footerHeight]="50"
        [rowHeight]="'auto'"
        [trackByProp]="'updated'"
        [displayMessage]="{
          name: 'hello',
          message: 'something might have gone wrong',
          retry: true
        }"
        [loadingIndicator]="isFetching"
        (retryAction)="hello()"
        [rows]="[]">
        <ngx-datatable-column name="Name"></ngx-datatable-column>
        <ngx-datatable-column name="Gender"></ngx-datatable-column>
        <ngx-datatable-column name="Company"></ngx-datatable-column>
      </ngx-datatable>
    </div>
  `
})
export class EmptyDataComponent {
  public isFetching = false;

  @ViewChild('mydatatable') mydatatable: any;

  count: number = 50;
  rows: any[] = [];
  active: boolean = true;
  temp: any[] = [];
  cols: any = [
    'name', 'gender', 'company'
  ];
  

  hello() {
    this.isFetching = true;
    
    setTimeout(() => { this.isFetching = false }, 2000);
  }

  constructor(private cd: ChangeDetectorRef) {
  }
}
