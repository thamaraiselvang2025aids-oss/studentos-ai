import React, { useState } from 'react';
import { useStudentOS } from '../context/StudentOSContext';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  X,
  Clock,
  Layers,
  GraduationCap,
  Award,
  BookOpen
} from 'lucide-react';

export default function Calendar() {
  const {
    calendarEvents,
    addCalendarEvent,
    deleteCalendarEvent,
    courses,
    assignments,
    hackathons,
    applications
  } = useStudentOS();

  // Derived / Dynamic Events from other subsystems
  const dynamicEvents = React.useMemo(() => {
    const list: typeof calendarEvents = [];

    // Map Assignments
    assignments.forEach((asg) => {
      if (!asg.dueDate) return;
      const matchedCourse = courses.find((c) => c.id === asg.courseId);
      const courseCode = matchedCourse ? matchedCourse.code : 'Course';
      list.push({
        id: `dyn_asg_${asg.id}`,
        title: `${courseCode}: ${asg.title}`,
        start: `${asg.dueDate}T23:59:00`,
        end: `${asg.dueDate}T23:59:00`,
        type: 'assignment',
        description: `Priority: ${asg.priority.toUpperCase()} | Status: ${asg.status.toUpperCase()}\nNotes: ${asg.notes || ''}`
      });
    });

    // Map Hackathons
    hackathons.forEach((hk) => {
      if (!hk.date) return;
      list.push({
        id: `dyn_hk_${hk.id}`,
        title: `🏆 ${hk.name}`,
        start: `${hk.date}T09:00:00`,
        end: `${hk.date}T23:59:00`,
        type: 'personal',
        description: `Hackathon challenge | Team Size: ${hk.teamSize}\nRoles Needed: ${hk.rolesRequired.join(', ')}\nIdeas: ${hk.ideas.join('; ')}\nNotes: ${hk.notes || ''}`
      });
    });

    // Map Internship applications
    applications.forEach((app) => {
      if (!app.nextDeadline) return;
      list.push({
        id: `dyn_app_${app.id}`,
        title: `💼 ${app.company} [${app.role}]`,
        start: `${app.nextDeadline}T10:00:00`,
        end: `${app.nextDeadline}T11:00:00`,
        type: 'exam',
        description: `Application Stage: ${app.status.toUpperCase()}\nCompensation: ${app.salary || 'N/A'}\nNotes: ${app.notes || ''}`
      });
    });

    return [...calendarEvents, ...list];
  }, [calendarEvents, assignments, courses, hackathons, applications]);

  // Calendar states
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(new Date().getDate());
  const [showEventModal, setShowEventModal] = useState(false);

  // New Event Form states
  const [eventTitle, setEventTitle] = useState('');
  const [eventType, setEventType] = useState<'class' | 'exam' | 'assignment' | 'personal' | 'milestone'>('personal');
  const [eventTime, setEventTime] = useState('14:00');
  const [eventDesc, setEventDesc] = useState('');

  // Calendar Helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  const prevMonthDays = Array.from({ length: firstDayIndex }, (_, i) => '');
  const currentMonthDays = Array.from({ length: totalDays }, (_, i) => i + 1);
  const allDays = [...prevMonthDays, ...currentMonthDays];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDay(null);
  };

  const getEventsForDay = (dayNum: number) => {
    if (!dayNum) return [];
    const datestring = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    return dynamicEvents.filter((e) => e.start.startsWith(datestring));
  };

  const handleDayClick = (dayNum: number) => {
    setSelectedDay(dayNum);
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle || selectedDay === null) return;

    const formattedDay = String(selectedDay).padStart(2, '0');
    const formattedMonth = String(month + 1).padStart(2, '0');
    const isoStart = `${year}-${formattedMonth}-${formattedDay}T${eventTime}:00`;

    addCalendarEvent({
      title: eventTitle,
      start: isoStart,
      end: `${year}-${formattedMonth}-${formattedDay}T23:59:00`,
      type: eventType,
      description: eventDesc
    });

    setEventTitle('');
    setEventDesc('');
    setShowEventModal(false);
  };

  return (
    <div id="calendar_view" className="flex-1 overflow-y-auto bg-gray-50 p-6 text-gray-800 scroll-smooth">
      {/* Header */}
      <header className="mb-6 text-left">
        <h1 className="text-2xl font-bold text-gray-950 tracking-tight font-sans">
          Schedule & <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-transparent bg-clip-text">Monthly Calendar</span>
        </h1>
        <p className="text-xs text-gray-600 mt-1 font-sans">
          Coordinate upcoming exams, assignment deadlines, classes, and study sessions directly on an interactive day planner.
        </p>
      </header>

      {/* Main Grid: Calendar left, selected events details right */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Calendar Grid panel */}
        <div className="xl:col-span-2 p-6 rounded-xl bg-white border border-gray-200 shadow-sm flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-950 uppercase font-mono tracking-wider flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-purple-600" /> Month Calendar Grid
            </h2>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg bg-gray-50 border border-gray-300 hover:bg-gray-100 text-gray-700 transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold font-mono text-gray-900 w-28 text-center">
                {monthNames[month]} {year}
              </span>
              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg bg-gray-50 border border-gray-300 hover:bg-gray-100 text-gray-700 transition-all cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-mono font-bold text-gray-500 uppercase tracking-wider">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="py-1">{d}</div>
            ))}
          </div>

          {/* Grid cells */}
          <div className="grid grid-cols-7 gap-2">
            {allDays.map((day, idx) => {
              const dayEvents = day ? getEventsForDay(Number(day)) : [];
              const isSelected = selectedDay === day;

              return (
                <div
                  key={idx}
                  onClick={() => day && handleDayClick(Number(day))}
                  className={`min-h-[85px] p-2 rounded-lg border flex flex-col justify-between transition-all select-none text-left ${
                    day
                      ? isSelected
                        ? 'bg-purple-50 border-purple-400 text-purple-950 ring-1 ring-purple-400/30'
                        : 'bg-gray-50/50 border-gray-200 hover:border-purple-300 hover:bg-white cursor-pointer'
                      : 'bg-transparent border-transparent text-transparent pointer-events-none'
                  }`}
                >
                  <span className={`text-[10px] font-bold font-mono ${isSelected ? 'text-purple-700' : 'text-gray-500'}`}>
                    {day}
                  </span>

                  {/* Small dots list */}
                  <div className="flex flex-col gap-1 mt-1.5">
                    {dayEvents.slice(0, 3).map((ev) => {
                      const colorClass =
                        ev.type === 'class'
                          ? 'bg-purple-100 text-purple-700 border-purple-200'
                          : ev.type === 'exam'
                          ? 'bg-rose-100 text-rose-700 border-rose-200'
                          : ev.type === 'assignment'
                          ? 'bg-amber-100 text-amber-700 border-amber-200'
                          : 'bg-blue-100 text-blue-700 border-blue-200';

                      return (
                        <div
                          key={ev.id}
                          className={`text-[8px] px-1.5 py-0.5 rounded border truncate leading-none font-sans font-semibold uppercase tracking-wider ${colorClass}`}
                        >
                          {ev.title}
                        </div>
                      );
                    })}
                    {dayEvents.length > 3 && (
                      <span className="text-[7px] text-gray-500 font-mono text-center block">+{dayEvents.length - 3} more</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected day events list, and event scheduler */}
        <div className="flex flex-col gap-6 text-left">
          {/* Schedule list */}
          <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-gray-950 font-mono uppercase">
                Events Checklist {selectedDay ? `(Day ${selectedDay})` : ''}
              </h3>
              <button
                onClick={() => selectedDay && setShowEventModal(true)}
                disabled={!selectedDay}
                className="flex items-center gap-1 text-[10px] bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-2.5 py-1.5 rounded-lg font-bold font-mono uppercase cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Schedule Event
              </button>
            </div>

            <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
              {selectedDay ? (
                getEventsForDay(selectedDay).length > 0 ? (
                  getEventsForDay(selectedDay).map((ev) => (
                    <div
                      key={ev.id}
                      className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${
                            ev.type === 'class'
                              ? 'bg-purple-500'
                              : ev.type === 'exam'
                              ? 'bg-rose-500'
                              : ev.type === 'assignment'
                              ? 'bg-amber-500'
                              : 'bg-blue-500'
                          }`}></span>
                          <span className="text-xs font-bold text-gray-900 font-sans">{ev.title}</span>
                        </div>
                        {ev.description && (
                          <p className="text-[10px] text-gray-500 mt-1.5 font-sans leading-relaxed">{ev.description}</p>
                        )}
                        <span className="text-[8px] text-gray-400 font-mono uppercase mt-1 block">At {ev.start.split('T')[1]?.slice(0, 5) || 'all-day'}</span>
                      </div>
                      {!ev.id.startsWith('dyn_') ? (
                        <button
                          onClick={() => deleteCalendarEvent(ev.id)}
                          className="text-gray-400 hover:text-rose-600 p-1.5 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-[8px] text-indigo-600 font-bold font-mono bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded select-none uppercase shrink-0">
                          System Sync
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 italic py-4">No events scheduled on this date. Tap "+ Schedule Event" above to add.</p>
                )
              ) : (
                <p className="text-xs text-gray-400 italic py-4">Select a calendar cell on the left to review scheduled items.</p>
              )}
            </div>
          </div>

          {/* Quick Schedule Reference Legends */}
          <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm text-left">
            <h3 className="text-xs font-bold text-gray-950 font-mono uppercase mb-4">Calendar Legends</h3>
            <div className="flex flex-col gap-3.5">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded bg-purple-500"></span>
                <span className="text-xs text-gray-700 font-sans font-medium">Classes & Lectures</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded bg-rose-500"></span>
                <span className="text-xs text-gray-700 font-sans font-medium">Exams & Quizzes</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded bg-amber-500"></span>
                <span className="text-xs text-gray-700 font-sans font-medium">Assignment Deadlines</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded bg-blue-500"></span>
                <span className="text-xs text-gray-700 font-sans font-medium">Personal Milestones</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Event Dialog Modal */}
      {showEventModal && selectedDay && (
        <div className="fixed inset-0 bg-[var(--overlay-bg)] backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl relative border border-gray-100 flex flex-col gap-4 text-left animate-scale-in">
            <button
              onClick={() => setShowEventModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] bg-purple-50 text-purple-700 font-bold font-mono px-3 py-1 rounded-full border border-purple-200">
                PLANNER LOG
              </span>
              <h3 className="text-md font-bold text-gray-950 mt-3 font-sans">
                Schedule Event: {monthNames[month]} {selectedDay}, {year}
              </h3>
            </div>

            <form onSubmit={handleCreateEvent} className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-1 text-left">
                <label className="text-[9.5px] font-bold font-mono text-gray-500 uppercase">Event Title</label>
                <input
                  type="text"
                  placeholder="e.g. Midterm Lab, Study Session"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  required
                  className="bg-white border border-gray-300 rounded-lg p-2.5 text-xs text-gray-800 font-sans focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div className="flex flex-col gap-1 text-left">
                <label className="text-[9.5px] font-bold font-mono text-gray-500 uppercase">Time</label>
                <input
                  type="time"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                  required
                  className="bg-white border border-gray-300 rounded-lg p-2.5 text-xs text-gray-800 font-sans focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div className="flex flex-col gap-1 text-left">
                <label className="text-[9.5px] font-bold font-mono text-gray-500 uppercase">Category</label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value as any)}
                  className="bg-white border border-gray-300 rounded-lg p-2.5 text-xs text-gray-800 font-sans focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  <option value="class">Class Session</option>
                  <option value="exam">Quiz / Exam</option>
                  <option value="assignment">Assignment Deadline</option>
                  <option value="personal">Personal Event</option>
                  <option value="milestone">Academic Milestone</option>
                </select>
              </div>

              <div className="flex flex-col gap-1 text-left">
                <label className="text-[9.5px] font-bold font-mono text-gray-500 uppercase">Short Details</label>
                <input
                  type="text"
                  placeholder="Syllabus, classroom link or venue info..."
                  value={eventDesc}
                  onChange={(e) => setEventDesc(e.target.value)}
                  className="bg-white border border-gray-300 rounded-lg p-2.5 text-xs text-gray-800 font-sans focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <button
                type="submit"
                className="py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs font-mono uppercase rounded-lg shadow transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Index Scheduled Event
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
