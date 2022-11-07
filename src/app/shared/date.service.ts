import { Injectable } from '@angular/core';

@Injectable()
export class DateService {
  constructor() {}

  getTodaysDate() {
    let todaysDate_datetime = new Date(
      new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
    );
    let date_str = todaysDate_datetime.getDate().toString();
    let month_str = (todaysDate_datetime.getMonth() + 1).toString();
    let year_str = todaysDate_datetime.getFullYear().toString();
    if (month_str.length == 1) {
      month_str = '0' + month_str;
    }
    if (date_str.length == 1) {
      date_str = '0' + date_str;
    }
    let todaysDate_string = year_str + '-' + month_str + '-' + date_str;

    return todaysDate_string;
  }

  dateConverter(date: string) {
    let result = '';
    let actualDate = new Date(
      new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
    );
    if (date != null) {
      actualDate = new Date(date);
    }

    result = actualDate.toString().substring(0, 15);

    return result;
  }
  isNumeric(num) {
    return !isNaN(num);
  }
  padLeft(nr, n, str) {
    return Array(n - String(nr).length + 1).join(str || '0') + nr;
  }
}
