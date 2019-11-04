import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import { VIRTUAL_SCROLL_STRATEGY } from '@angular/cdk/scrolling';
import { map } from 'rxjs/operators';
import { combineLatest, Observable } from 'rxjs';
import { DataService } from './_services/data.service';
import { TableVirtualScrollStrategy } from './_services/table-vs-strategy.service';

interface DataObject {
  id: number;
  name: string;
  age: number;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [{
    provide: VIRTUAL_SCROLL_STRATEGY,
    useClass: TableVirtualScrollStrategy,
  }],
})

export class AppComponent implements OnInit {
  static BUFFER_SIZE = 3;
  rowHeight = 48;
  headerHeight = 56;
  filterValue = '';

  gridHeight = 400;

  data = [];
  result = new MatTableDataSource<DataObject>(this.data);
  displayedColumns: string[] = ['id', 'name', 'age'];

  dataSource: Observable<Array<DataObject>>;

  @ViewChild(MatSort, {static: false}) sort: MatSort;


  constructor(private dataService: DataService,
              @Inject(VIRTUAL_SCROLL_STRATEGY) private readonly scrollStrategy: TableVirtualScrollStrategy) {

    this.dataService.data$.subscribe((dataObject) => {
      if (dataObject.action === 'create') {
        this.data.push(dataObject.data);
      } else if (dataObject.action === 'delete') {
        this.data = this.data.filter(el => el.id !== dataObject.id);
      }

      const range = Math.ceil(this.gridHeight / this.rowHeight) + AppComponent.BUFFER_SIZE;
      this.scrollStrategy.setScrollHeight(this.rowHeight, this.headerHeight);

      this.dataSource = combineLatest([this.data, this.scrollStrategy.scrolledIndexChange]).pipe(
        map((value: any) => {
          // Determine the start and end rendered range
          const start = Math.max(0, value[1] - AppComponent.BUFFER_SIZE);
          const end = Math.min(this.data.length, value[1] + range);
          return (this.data.slice(start, end));
        })
      );
      this.result = new MatTableDataSource<DataObject>(this.data);
      if (this.filterValue) {
        this.applyFilter(this.filterValue);
      }
      this.result.sort = this.sort;
    });

  }

  applyFilter(filterValue: string) {
    this.result.filter = filterValue.trim().toLowerCase();
  }

  ngOnInit() {}
}
