import React from 'react'

const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function getStartOfWeekUTC(date) {
  // Monday as first day of week, in UTC
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  const day = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() - day + 1)
  d.setUTCHours(0, 0, 0, 0)
  return d
}

const AttendanceCard = ({
  todayAttendance, // { clockIn, clockOut, status, duration, location }
  weeklyAttendances = [], // Array of attendance records for the week
  onClockIn, // Receive the onClockIn function
  onClockOut,
  loading,
  refetch, // Receive refetch function
}) => {
  const hasClockedIn = !!todayAttendance?.clockIn
  const hasClockedOut = !!todayAttendance?.clockOut

  // Calculate duration if not provided by backend
  const getDuration = (clockIn, clockOut) => {
    if (!clockIn || !clockOut) return '-'
    const diffMs = new Date(clockOut) - new Date(clockIn)
    const hours = Math.floor(diffMs / 1000 / 60 / 60)
    const minutes = Math.floor((diffMs / 1000 / 60) % 60)
    return `${hours}h ${minutes}m`
  }

  // Build weekly data: map each day (UTC) to its attendance record (if any)
  const today = new Date()
  const weekStart = getStartOfWeekUTC(today)
  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(weekStart)
    d.setUTCDate(weekStart.getUTCDate() + i)
    d.setUTCHours(0, 0, 0, 0)
    return d
  })

  // Map attendance records to days using UTC
  const attendanceByDay = weekDays.map((day) => {
    const record = weeklyAttendances.find((a) => {
      const recDate = new Date(a.date)
      recDate.setUTCHours(0, 0, 0, 0)
      return recDate.getTime() === day.getTime()
    })
    return record
  })

  const handleClockIn = async () => {
    try {
      await onClockIn() // Call the onClockIn function
      refetch() // Refetch attendance history
    } catch (error) {
      console.error('Error during clock-in:', error)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden row-span-2">
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
        <h2 className="font-semibold text-gray-800 text-lg">Today's Attendance</h2>
        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold border border-blue-200">
          {new Date().toLocaleDateString()}
        </span>
      </div>
      <div className="p-6">
        <div className="mb-6 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100 border-4 border-green-200 shadow mb-3">
            <i className="ri-time-line text-green-600 ri-3x text-4xl"></i>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mt-2">
            {hasClockedIn
              ? new Date(todayAttendance.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : '--:--'}
          </h3>
          <p className="text-sm text-gray-500">Clock In Time</p>
        </div>
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-gray-700">Status</span>
            <span className={`px-3 py-1 text-xs rounded-full border font-semibold ${
              todayAttendance?.status === 'Present'
                ? 'bg-green-100 text-green-800 border-green-200'
                : todayAttendance?.status === 'Late'
                ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                : todayAttendance?.status === 'Leave'
                ? 'bg-blue-100 text-blue-800 border-blue-200'
                : todayAttendance?.status === 'Weekend'
                ? 'bg-gray-100 text-gray-800 border-gray-200'
                : 'bg-red-100 text-red-800 border-red-200'
            }`}>
              {todayAttendance?.status || 'Absent'}
            </span>
          </div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-gray-700">Hours Today</span>
            <span className="text-sm text-gray-900 font-mono">
              {todayAttendance?.duration ||
                getDuration(todayAttendance?.clockIn, todayAttendance?.clockOut) ||
                '-'}
            </span>
          </div>
        </div>
        {/* Button logic: only one clock in/out per day */}
        {!hasClockedIn && (
          <button
            className="w-full py-3 bg-green-500 text-white rounded-lg font-semibold text-lg shadow hover:bg-green-600 transition disabled:opacity-50"
            onClick={handleClockIn}
            disabled={loading}
          >
            {loading ? 'Clocking In...' : 'Clock In'}
          </button>
        )}
        {hasClockedIn && !hasClockedOut && (
          <button
            className="w-full py-3 bg-red-500 text-white rounded-lg font-semibold text-lg shadow hover:bg-red-600 transition disabled:opacity-50"
            onClick={onClockOut}
            disabled={loading}
          >
            {loading ? 'Clocking Out...' : 'Clock Out'}
          </button>
        )}
        {hasClockedIn && hasClockedOut && (
          <div className="w-full py-3 text-center text-green-600 font-semibold text-lg mt-4">
            Attendance Complete
          </div>
        )}

      </div>
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <h3 className="font-medium text-gray-800 mb-3">Weekly Overview</h3>
        <div className="grid grid-cols-7 gap-2 text-center">
          {daysOfWeek.map((day, i) => (
            <div key={day} className="text-xs text-gray-500">{day}</div>
          ))}
          {attendanceByDay.map((record, i) => (
            <div
              key={i}
              className={`h-8 flex items-center justify-center rounded text-xs border
                ${record && record.duration
                  ? 'bg-green-100 text-green-800 border-green-200'
                  : 'bg-gray-100 text-gray-500 border-gray-200'
                }`}
            >
              {record && (record.duration ||
                getDuration(record.clockIn, record.clockOut)) || '-'}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AttendanceCard
