// src/components/Calendar/Calendar.js
import React, { useState } from 'react'

const Calendar = () => {
  // Set state to the first day of the current month
  const [currentDate, setCurrentDate] = useState(new Date())
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth() // 0-based index

  // Change month handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1))
  }

  // Names of the months for the header
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  // Get the starting day index and number of days in the month
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay() // 0 = Sunday
  const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate()

  // Build array: add empty entries for the days before month start and then fill with day numbers
  const calendarDays = []
  for (let i = 0; i < firstDayIndex; i++) {
    calendarDays.push(null)
  }
  for (let day = 1; day <= totalDays; day++) {
    calendarDays.push(day)
  }

  // Split days into weeks (arrays of 7)
  const weeks = []
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7))
  }

  // Highlight today's date
  const today = new Date()
  const isToday = (day) =>
    day === today.getDate() &&
    currentMonth === today.getMonth() &&
    currentYear === today.getFullYear()

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Header with month navigation */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
        <button
          onClick={handlePrevMonth}
          aria-label="Previous Month"
          className="px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
        >
          <i className="ri-arrow-left-s-line"></i>
        </button>
        <div className="text-lg font-semibold">
          {monthNames[currentMonth]} {currentYear}
        </div>
        <button
          onClick={handleNextMonth}
          aria-label="Next Month"
          className="px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
        >
          <i className="ri-arrow-right-s-line"></i>
        </button>
      </div>

      {/* Calendar grid */}
      <div className="p-4">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => (
            <div key={index} className="text-center text-sm font-medium text-gray-700">
              {day}
            </div>
          ))}
        </div>
        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {weeks.map((week, weekIndex) => (
            <React.Fragment key={weekIndex}>
              {week.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  className="h-12 flex items-center justify-center border p-1"
                >
                  {day ? (
                    <span
                      className={`text-sm ${
                        isToday(day)
                          ? 'bg-blue-500 text-white px-2 py-1 rounded-full'
                          : 'text-gray-900'
                      }`}
                    >
                      {day}
                    </span>
                  ) : (
                    ""
                  )}
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Calendar
