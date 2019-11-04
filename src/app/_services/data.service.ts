import { Injectable } from '@angular/core';
import { interval } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})

export class DataService {
  records = [];
  names = ['Henry', 'Bob', 'Lisa', 'John', 'Martin'];
  ages = Array.from(Array(100).keys()).map(age => age + 1);
  data$;

  constructor() {
    this.data$ = interval(2000).pipe(
      map(() => {
        const record = this.generateOrder();
        if (!this.records.find(el => el.id === record.id)) {
          this.records.push(record);
          return { action: 'create', data: record };
        } else {
          this.records = this.records.filter(el => el.id !== record.id);
          return { action: 'delete', id: record.id };
        }
      })
    );
  }

  private getId() {
    return Math.floor(Math.random() * 100);
  }
  private getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
  }
  private generateOrder() {
    return {
      id: this.getId(),
      name: this.getRandomElement(this.names),
      age: this.getRandomElement(this.ages)
    };
  }
}
