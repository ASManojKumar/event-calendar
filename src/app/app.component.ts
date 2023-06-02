import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

export class CalendarDay {
  public date: Date;
  public title: string;
  public isPastDate: boolean;
  public isToday: boolean;
  public isPastMonth: boolean;
  public events: any = [];

  constructor(d: Date) {
    this.date = d;
    this.isPastDate = d.setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0);
    this.isToday = d.setHours(0, 0, 0, 0) == new Date().setHours(0, 0, 0, 0);
    this.isPastMonth = d.getMonth() == (new Date().getMonth() - 1);
  }

}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {
  public calendar: CalendarDay[] = [];
  public monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  public displayMonth: string;
  private monthIndex: number = 0;
  public displayYear: number;
  public eventTitle: string;
  public eventDate: any;
  private calendarEventList: any = [];
  public isEdit: boolean;
  private deleteEventId: string;
  public minDate: string;

  constructor(private modalService: NgbModal) {
    this.minDate = new Date().toISOString().split('T')[0];
    // fetch data from localstorage
    if (window.localStorage.getItem('eventData'))
      this.calendarEventList = JSON.parse(window.localStorage.getItem('eventData'))
  }

  ngOnInit(): void {
    this.generateCalendarDays(this.monthIndex);
  }

  generateCalendarDays(monthIndex: number): void {
    // we reset our calendar
    this.calendar = [];

    // we set the date 
    let day: Date = new Date(new Date().setMonth(new Date().getMonth() + monthIndex));

    // set the dispaly month for UI
    this.displayMonth = this.monthNames[day.getMonth()];

    // set the year for UI
    this.displayYear = day.getFullYear();

    let startingDateOfCalendar = this.getStartDateForCalendar(day);

    let dateToAdd = startingDateOfCalendar;

    for (var i = 0; i < 42; i++) {
      this.calendar.push(new CalendarDay(new Date(dateToAdd)));
      dateToAdd = new Date(dateToAdd.setDate(dateToAdd.getDate() + 1));
    }

    this.addEventToCalendar();
  }

  getStartDateForCalendar(selectedDate: Date) {
    // for the day we selected let's get the previous month last day
    let lastDayOfPreviousMonth = new Date(selectedDate.setDate(0));

    // start by setting the starting date of the calendar same as the last day of previous month
    let startingDateOfCalendar: Date = lastDayOfPreviousMonth;

    // but since we actually want to find the last Monday of previous month
    // we will start going back in days intil we encounter our last Monday of previous month
    if (startingDateOfCalendar.getDay() != 1) {
      do {
        startingDateOfCalendar = new Date(startingDateOfCalendar.setDate(startingDateOfCalendar.getDate() - 1));
      } while (startingDateOfCalendar.getDay() != 1);
    }

    return startingDateOfCalendar;
  }

  increaseMonth() {
    this.monthIndex++;
    this.generateCalendarDays(this.monthIndex);
  }

  decreaseMonth() {
    this.monthIndex--
    this.generateCalendarDays(this.monthIndex);
  }

  setCurrentMonth() {
    this.monthIndex = 0;
    this.generateCalendarDays(this.monthIndex);
  }

  openModal(content, type, event?) {
    this.isEdit = type == 'save' ? false : true;
    this.eventTitle = type == 'save' ? '' : event.title;
    this.eventDate = type == 'save' ? '' : event.date;
    if (type == 'edit')
      this.deleteEventId = event.id
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then(
      (result) => {
        if (type == 'save') {
          let data = {
            'title': this.eventTitle,
            'date': this.eventDate,
            'id': Math.random().toString(16).slice(2)
          }
          this.calendarEventList.push(data);
        } else {
          const findIndex = this.calendarEventList.findIndex(
            x => x.id == this.deleteEventId
          )
          this.calendarEventList[findIndex].title = this.eventTitle;
          this.calendarEventList[findIndex].date = this.eventDate;
        }
        this.addEventToCalendar();
      },
      (reason) => { },
    );
  }

  addEventToCalendar() {
    this.calendar.forEach(element => {
      element.events = [];
    });
    for (let i = 0; i < this.calendar.length; i++) {
      for (let j = 0; j < this.calendarEventList.length; j++) {
        if (this.calendar[i].date.getTime() == new Date(this.calendarEventList[j].date).setHours(0, 0, 0)) {
          this.calendar[i].events.push({
            'id': this.calendarEventList[j].id,
            'title': this.calendarEventList[j].title,
            'date': this.calendarEventList[j].date
          })
        }
      }
    }
    // save data to localstorage
    window.localStorage.setItem('eventData', JSON.stringify(this.calendarEventList));
  }

  deleteEvent(content) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-delete-event' }).result.then(
      (result) => {
        const findIndex = this.calendarEventList.findIndex(
          x => x.id == this.deleteEventId
        )
        this.calendarEventList.splice(findIndex, 1);
        this.addEventToCalendar();
        this.modalService.dismissAll();
      },
      (reason) => { },
    );
  }

}
