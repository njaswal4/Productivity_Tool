import React, { useEffect, useState } from 'react'

const REQUIRED_HOURS = 9

function parseTime(str) {
  const [h, m] = str.split(':').map(Number)
  const d = new Date()
  d.setHours(h, m, 0, 0)
  return d
}

const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function getStartOfWeekUTC(date) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  const day = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() - day + 1)
  d.setUTCHours(0, 0, 0, 0)
  return d
}

const getDuration = (clockIn, clockOut) => {
  if (!clockIn || !clockOut) return '-'
  const diffMs = new Date(clockOut) - new Date(clockIn)
  const hours = Math.floor(diffMs / 1000 / 60 / 60)
  const minutes = Math.floor((diffMs / 1000 / 60) % 60)
  return `${hours}h ${minutes}m`
}

const msToHrsMin = ms => {
  const h = Math.floor(ms / 1000 / 60 / 60)
  const m = Math.floor((ms / 1000 / 60) % 60)
  return `${h}h ${m}m`
}

const AttendanceCard = ({
  todayAttendance,
  weeklyAttendances = [],
  officeHours,
  onClockIn,
  onClockOut,
  onBreakIn,
  onBreakOut,
  loading,
  breaks = [],
  overtimeToday,
  onOvertimeClockIn,
  onOvertimeClockOut,
}) => {
  const hasClockedIn = !!todayAttendance?.clockIn
  const hasClockedOut = !!todayAttendance?.clockOut

  // Office hours config
  const startTime = officeHours?.startTime || '09:00'
  const endTime = officeHours?.endTime || '18:00'
  const officeStart = parseTime(startTime)
  const officeEnd = parseTime(endTime)

  // --- Break logic ---
  // Find the latest break for today
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todaysBreaks = (breaks || []).filter(b => {
    const recDate = new Date(b.breakIn)
    recDate.setHours(0, 0, 0, 0)
    return recDate.getTime() === today.getTime()
  })
  const latestBreak = todaysBreaks.length > 0
    ? todaysBreaks.reduce((a, b) => new Date(a.breakIn) > new Date(b.breakIn) ? a : b)
    : null
  const onBreak = !!(latestBreak && latestBreak.breakIn && !latestBreak.breakOut)

  // Calculate total break ms for today
  const totalBreakMs = todaysBreaks.reduce((sum, b) => {
    if (b.breakIn && b.breakOut) {
      return sum + (new Date(b.breakOut) - new Date(b.breakIn))
    }
    return sum
  }, 0)

  // --- Auto clock out after office hours ---
  useEffect(() => {
    if (
      hasClockedIn &&
      !hasClockedOut &&
      new Date() > officeEnd
    ) {
      onClockOut()
    }
  }, [hasClockedIn, hasClockedOut, officeEnd, onClockOut])

  // --- Duration calculations ---
  const getDurationMs = (start, end) =>
    start && end ? new Date(end) - new Date(start) : 0

  const officeDurationMs = Math.max(
    getDurationMs(todayAttendance?.clockIn, todayAttendance?.clockOut) - totalBreakMs,
    0
  )
  const overtimeDurationMs = getDurationMs(overtimeToday?.clockIn, overtimeToday?.clockOut)

  const requiredMs = (officeHours?.requiredHours || REQUIRED_HOURS) * 60 * 60 * 1000
  const totalWorkedMs = officeDurationMs + overtimeDurationMs
  const officeDisplayMs = Math.min(totalWorkedMs, requiredMs)
  const overtimeDisplayMs = Math.max(totalWorkedMs - requiredMs, 0)

  // --- Weekly overview ---
  const weekStart = getStartOfWeekUTC(today)
  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(weekStart)
    d.setUTCDate(weekStart.getUTCDate() + i)
    d.setUTCHours(0, 0, 0, 0)
    return d
  })

  const attendanceByDay = weekDays.map((day) => {
    const record = (weeklyAttendances || []).find((a) => {
      const recDate = new Date(a.date)
      recDate.setUTCHours(0, 0, 0, 0)
      return recDate.getTime() === day.getTime()
    })
    return record
  })

  // --- UI logic ---
  const afterOffice = new Date() > officeEnd

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
          <h3 className="text-2xl font-bold text-gray-900 mt-2">
            {hasClockedIn
              ? new Date(todayAttendance.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : '--:--'}
          </h3>
          <p className="text-sm text-gray-500">Clock In Time</p>
        </div>
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-gray-700">Office Duration</span>
            <span className="text-sm text-gray-900 font-mono">
              {msToHrsMin(officeDisplayMs)}
            </span>
          </div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-gray-700">Breaks</span>
            <span className="text-sm text-gray-900 font-mono">
              {msToHrsMin(totalBreakMs)}
            </span>
          </div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-gray-700">Overtime Duration</span>
            <span className="text-sm text-gray-900 font-mono">
              {msToHrsMin(overtimeDisplayMs)}
            </span>
          </div>
        </div>
        {!hasClockedIn && !afterOffice && (
          <button
            className="w-full py-3 bg-green-500 text-white rounded-lg font-semibold text-lg shadow hover:bg-green-600 transition disabled:opacity-50"
            onClick={onClockIn}
            disabled={loading}
          >
            {loading ? 'Clocking In...' : 'Clock In'}
          </button>
        )}
        {hasClockedIn && !hasClockedOut && !afterOffice && !onBreak && (
          <div className="flex gap-2">
            <button
              className="flex-1 py-3 bg-yellow-500 text-white rounded-lg font-semibold text-lg shadow hover:bg-yellow-600 transition"
              onClick={onBreakIn}
              disabled={loading}
            >
              {loading ? 'Starting Break...' : 'Break'}
            </button>
            <button
              className="flex-1 py-3 bg-red-500 text-white rounded-lg font-semibold text-lg shadow hover:bg-red-600 transition"
              onClick={onClockOut}
              disabled={loading}
            >
              {loading ? 'Clocking Out...' : 'Clock Out'}
            </button>
          </div>
        )}
        {hasClockedIn && !hasClockedOut && !afterOffice && onBreak && (
          <div className="flex gap-2">
            <button
              className="flex-1 py-3 bg-green-500 text-white rounded-lg font-semibold text-lg shadow hover:bg-green-600 transition"
              onClick={onBreakOut}
              disabled={loading}
            >
              {loading ? 'Ending Break...' : 'Break Out'}
            </button>
            <button
              className="flex-1 py-3 bg-red-500 text-white rounded-lg font-semibold text-lg shadow hover:bg-red-600 transition"
              onClick={onClockOut}
              disabled={loading}
            >
              {loading ? 'Clocking Out...' : 'Clock Out'}
            </button>
          </div>
        )}
        {afterOffice && !overtimeToday?.clockIn && (
          <button
            className="w-full py-3 bg-indigo-500 text-white rounded-lg font-semibold text-lg shadow hover:bg-indigo-600 transition disabled:opacity-50"
            onClick={onOvertimeClockIn}
            disabled={loading}
          >
            {loading ? 'Clocking In Overtime...' : 'Overtime Clock In'}
          </button>
        )}
        {overtimeToday?.clockIn && !overtimeToday?.clockOut && (
          <button
            className="w-full py-3 bg-red-500 text-white rounded-lg font-semibold text-lg shadow hover:bg-red-600 transition disabled:opacity-50"
            onClick={onOvertimeClockOut}
            disabled={loading}
          >
            {loading ? 'Clocking Out Overtime...' : 'Overtime Clock Out'}
          </button>
        )}
        {(hasClockedIn && hasClockedOut) && (
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
