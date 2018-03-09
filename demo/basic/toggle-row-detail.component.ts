import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'toggle-row-detail',
  template: `
    <div>
      <h3>
        Optional row detail
      </h3>
      <ngx-datatable
        class="dark"
        style="min-height: 400px;"
        #mydatatable
        [headerHeight]="50"
        [limit]="5"
        [scrollbarV]="true"
        [columnMode]="'force'"
        [footerHeight]="50"
        [rowHeight]="50"
        [trackByProp]="'updated'"
        [rowDetailFn]="fn"
        [loadingIndicator]="isFetching"
        (retryAction)="hello()"
        [rows]="rows">
        <ngx-datatable-row-detail [rowHeight]="50" *ngIf="!(itt$ | async)">
          <ng-template let-row="row" ngx-datatable-row-detail-template>
              <div style="background: red; height: 50px; width: 100%; line-height: 50px; text-align:center">
                  Detail row info.
              </div>
          </ng-template>
        </ngx-datatable-row-detail>
        <ngx-datatable-column name="Name"></ngx-datatable-column>
        <ngx-datatable-column name="Gender"></ngx-datatable-column>
        <ngx-datatable-column name="Company"></ngx-datatable-column>
      </ngx-datatable>
    </div>
  `
})
export class ToggleRowDetailComponent {
  public isFetching = false;

  @ViewChild('mydatatable') mydatatable: any;

  count: number = 50;
  rows: any[] = [
    { name: 'test2', gender: 'test', company: 'intergral'},
    { name: 'test', gender: 'test', company: 'intergral'},
    { name: 'test2', gender: 'test', company: 'intergral'},
    { name: 'test', gender: 'test', company: 'intergral'},
    { name: 'test', gender: 'test', company: 'intergral'},
    { name: 'test', gender: 'test', company: 'intergral'},
    { name: 'test', gender: 'test', company: 'intergral'},
    { name: 'test', gender: 'test', company: 'intergral'},
    { name: 'test', gender: 'test', company: 'intergral'},
    { name: 'test2', gender: 'test', company: 'intergral'},
    { name: 'test', gender: 'test', company: 'intergral'},
    { name: 'test', gender: 'test', company: 'intergral'},
    { name: 'test', gender: 'test', company: 'intergral'},
    { name: 'test', gender: 'test', company: 'intergral'},
    { name: 'test', gender: 'test', company: 'intergral'},
    { name: 'test2', gender: 'test', company: 'intergral'},
    { name: 'test2', gender: 'test', company: 'intergral'},
    { name: 'test', gender: 'test', company: 'intergral'},
    { name: 'test2', gender: 'test', company: 'intergral'},
    { name: 'test2', gender: 'test', company: 'intergral'},
    { name: 'test', gender: 'test', company: 'intergral'},
    { name: 'test', gender: 'test', company: 'intergral'},
    { name: 'test', gender: 'test', company: 'intergral'},
    { name: 'test', gender: 'test', company: 'intergral'},
    { name: 'test', gender: 'test', company: 'intergral'},
    { name: 'test', gender: 'test', company: 'intergral'},
    { name: 'test', gender: 'test', company: 'intergral'},
    { name: 'test', gender: 'test', company: 'intergral'},
    { name: 'test', gender: 'test', company: 'intergral'},
    { name: 'test', gender: 'test', company: 'intergral'},
    { name: 'test', gender: 'test', company: 'intergral'},
    { name: 'test', gender: 'test', company: 'intergral'},
    { name: 'test', gender: 'test', company: 'intergral'},
  ];
  active: boolean = true;
  temp: any[] = [];
  cols: any = [
    'name', 'gender', 'company'
  ];
  

  hello() {
    this.isFetching = true;
    
    setTimeout(() => {this.isFetching = false }, 2000);
  }

  constructor(private cd: ChangeDetectorRef) {
  }

  public fn(row) {
    return (row.name === 'test2');
  }
}
