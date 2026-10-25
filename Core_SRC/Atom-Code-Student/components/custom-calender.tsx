"use client";
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CourseData {
  courseId: string;
  courseName: string;
  courseStartDate: string;
  courseEndDate: string;
  courseLanguage: string;
  courseStatus: boolean;
  courseProgres: number;
}

const CalendarLayout = ({ Courses }: { Courses: CourseData[] }) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const events = Courses.flatMap(course => [
    {
      title: `${course.courseName} Start`,
      date: new Date(course.courseStartDate.split('/').reverse().join('-')),
      type: 'start'
    },
    {
      title: `${course.courseName} End`,
      date: new Date(course.courseEndDate.split('/').reverse().join('-')),
      type: 'end'
    }
  ]);

  const formatDate = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getDaysInMonth = (year: number, month: number): number => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number): number => new Date(year, month, 1).getDay();
  const handleDateClick = (day: Date): void => {
    setSelectedDate(day);
  };

  const renderDays = (): JSX.Element[] => {
    const days: JSX.Element[] = [];
    const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
    const firstDayOfMonth = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());

    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="empty-cell bg-violet-200 dark:bg-violet-950"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
      const isCurrentDate = date.toDateString() === new Date().toDateString();
      const isSunday = date.getDay() === 0;

      const dayEvents = events.filter(
        (event) =>
          event.date.getFullYear() === date.getFullYear() &&
          event.date.getMonth() === date.getMonth() &&
          event.date.getDate() === date.getDate()
      );

      let bgColor = '';
      if (dayEvents.some(event => event.type === 'start')) {
        bgColor = 'bg-green-500 text-white  hover:bg-green-500/50';
      } else if (dayEvents.some(event => event.type === 'end')) {
        bgColor = 'bg-red-500 text-white hover:bg-red-500/50';
      } else if (isCurrentDate) {
        bgColor = 'bg-primary text-white';
      }

      days.push(
        <div
          key={day}
          className={`calendar-day ${isSelected ? 'selected' : ''} ${bgColor} ${isSunday ? 'bg-violet-200 dark:bg-violet-950 text-white' : ''} w-70 flex items-center justify-center flex-col h-[6rem] border-2 hover:bg-primary hover:text-white font-bold gap-2`}
          onClick={() => handleDateClick(date)}
        >
          <div className={`day-number text-center font-bold`}>{day}</div>
          {dayEvents.length > 0 && (
            <div className="events">
              {dayEvents.map((event, index) => (
                <div key={index} className="event text-center p-1 rounded-sm py-1 text-white text-sm">
                  {event.title}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  return (
    <div className="calendar-container p-4 m-4 mx-auto w-full shadow-lg">
      <div className="header flex flex-row justify-center items-center text-primary p-4 w-full">
        <h2 className="m-0 font-bold font-lg flex justify-start w-[96%] border p-2">{currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>
        <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
          className="text-primary px-2 border py-1 rounded cursor-pointer">
          <ChevronLeft className='h-[2rem] w-[2rem]' />
        </button>
        <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
          className="text-primary px-2 border py-1 rounded cursor-pointer">
          <ChevronRight className='h-[2rem] w-[2rem]' />
        </button>
      </div>
      <div className="days-of-week flex justify-between w-full">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
          <div key={index} className="day-of-week font-bold text-center px-4 border-2 w-full border-primary">
            {day}
          </div>
        ))}
      </div>
      <div className="calendar-days grid grid-cols-7 gap-1">
        {renderDays()}
      </div>
    </div>
  );
};

export default CalendarLayout;
