// src/components/WelcomeSection/WelcomeSection.js

import React, { useState, useEffect } from 'react'
import { useAuth } from 'src/auth'
import Code from '../Code/Code'
import { useQuery, gql } from '@redwoodjs/web'

const USER_ATTENDANCE_QUERY = gql`
  query UserAttendance($id: Int!) {
    user(id: $id) {
      attendances {
        duration
        status
        clockIn
        clockOut
      }
    }
  }
`

function parseDuration(durationStr, clockIn, clockOut) {
  if (durationStr && durationStr !== '-') {
    const match = durationStr.match(/(\d+)h\s*(\d+)m/)
    if (!match) return 0
    return parseInt(match[1], 10) + parseInt(match[2], 10) / 60
  }
  if (clockIn && clockOut) {
    const diffMs = new Date(clockOut) - new Date(clockIn)
    return diffMs > 0 ? diffMs / 1000 / 60 / 60 : 0
  }
  return 0
}

const AttendanceStats = ({ userId }) => {
  const { data, loading, error } = useQuery(USER_ATTENDANCE_QUERY, {
    variables: { id: Number(userId) },
    skip: !userId,
  })

  if (loading) return <div>Loading...</div>
  if (error || !data?.user) return <div>Unable to load stats.</div>

  const records = data.user.attendances || []
  const totalHours = records.reduce(
    (sum, att) => sum + parseDuration(att.duration, att.clockIn, att.clockOut), 0
  )
  const presentDays = records.filter(a => a.status === 'Present').length

  return (
    <div className="text-center">
      <div className="text-2xl font-bold">{presentDays}</div>
      <div className="text-gray-600 mb-2">Days Present</div>
      <div className="text-2xl font-bold">{totalHours.toFixed(2)}</div>
      <div className="text-gray-600">Total Hours Worked</div>
    </div>
  )
}

const quotes = [
  "Success is the sum of small efforts, repeated day in and day out.",
  "Don’t watch the clock; do what it does. Keep going.",
  "The secret of getting ahead is getting started.",
  "It always seems impossible until it’s done.",
  "Productivity is never an accident.",
]

function MotivationalQuote() {
  const [quote, setQuote] = useState(quotes[0])
  useEffect(() => {
    setQuote(quotes[Math.floor(Math.random() * quotes.length)])
  }, [])
  return (
    <div className="mt-4 italic text-gray-600 text-center text-sm">
      “{quote}”
    </div>
  )
}

const WEEKLY_ATTENDANCE_QUERY = gql`
  query WeeklyAttendance($id: Int!, $start: DateTime!, $end: DateTime!) {
    user(id: $id) {
      attendancesInRange(start: $start, end: $end) {
        duration
        clockIn
        clockOut
      }
    }
  }
`

function getWeekRange() {
  const now = new Date()
  const start = new Date(now)
  start.setDate(now.getDate() - now.getDay() + 1)
  start.setHours(0,0,0,0)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  end.setHours(23,59,59,999)
  return { start, end }
}

function ProgressBar({ userId, weeklyGoal }) {
  const { start, end } = getWeekRange()
  const { data, loading } = useQuery(WEEKLY_ATTENDANCE_QUERY, {
    variables: { id: Number(userId), start: start.toISOString(), end: end.toISOString() },
    skip: !userId,
  })
  if (loading) return <div className="w-full h-4 bg-gray-100 rounded mt-4 mb-2" />
  const records = data?.user?.attendancesInRange || []
  const totalHours = records.reduce(
    (sum, att) => sum + parseDuration(att.duration, att.clockIn, att.clockOut), 0
  )
  const percent = Math.min(100, (totalHours / weeklyGoal) * 100)
  return (
    <div className="w-full mt-4 mb-2">
      <div className="flex justify-between text-xs mb-1">
        <span>Weekly Goal: {weeklyGoal}h</span>
        <span>{totalHours.toFixed(1)}h</span>
      </div>
      <div className="w-full bg-gray-200 rounded h-3">
        <div
          className="bg-green-500 h-3 rounded"
          style={{ width: `${percent}%`, transition: 'width 0.5s' }}
        />
      </div>
    </div>
  )
}

const WelcomeSection = () => {
  const [currentTime, setCurrentTime] = useState("")
  const [name, setName] = useState('')
  const [tasks, setTasks] = useState([
    { text: 'Check emails', done: false },
    { text: 'Plan your day', done: false },
    { text: 'Complete one key task', done: false },
  ])
  const { currentUser } = useAuth()

  useEffect(() => {
    // Updates the current time every minute
    const updateTime = () => {
      const now = new Date()
      // Format the date using weekday, year, month, and day.
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
      const dateString = now.toLocaleDateString(undefined, options)
      // Format the time string in 12-hour format with two-digit hours and minutes.
      const timeString = now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true })
      setCurrentTime(`${dateString} | ${timeString}`)
    }
    updateTime()
    // Update every 60000ms (1 minute)
    const intervalId = setInterval(updateTime, 60000)
    return () => clearInterval(intervalId)
  }, [])

  // Get username from email
  const Name =
    currentUser?.name || currentUser?.email || 'User'

  const toggleTask = idx => {
    setTasks(tasks =>
      tasks.map((task, i) =>
        i === idx ? { ...task, done: !task.done } : task
      )
    )
  }

  return (
    <div className="relative z-30 flex flex-col md:flex-row items-start md:items-center justify-between mb-8 mt-32">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Hello, {Name}!
        </h1>
        <p className="text-gray-600 mt-1">{currentTime}</p>
      </div>
      <div className="mt-4 md:mt-0">
        
      </div>
    </div>
  )
}

export default WelcomeSection
