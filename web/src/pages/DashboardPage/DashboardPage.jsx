import { Link, routes } from '@redwoodjs/router'
import Header from 'src/components/Header/Header'
import { useAuth } from 'src/auth'
import { Metadata } from '@redwoodjs/web'
import WelcomeSection from 'src/components/WelcomeSection/WelcomeSection'
import UpcomingBookings from 'src/components/UpcomingBookings/UpcomingBookings'
import AttendanceCard from 'src/components/AttendanceCard/AttendanceCard'
import Attendance from 'src/components/Attendance/Attendance'
import React, { useState } from 'react'
import Booking, { BookingForm, BookingDetail } from 'src/components/Booking/Booking'
import { useQuery, useMutation } from '@redwoodjs/web'

const CLOCK_IN_MUTATION = gql`
  mutation ClockIn($userId: Int!, $date: DateTime!, $clockIn: DateTime!) {
    createAttendance(input: {
      userId: $userId,
      date: $date,
      clockIn: $clockIn,
      status: "Present"
    }) {
      id
      clockIn
      status
    }
  }
`

const CLOCK_OUT_MUTATION = gql`
  mutation ClockOut($id: Int!, $clockOut: DateTime!) {
    updateAttendance(id: $id, input: { clockOut: $clockOut }) {
      id
      clockOut
    }
  }
`

const WEEKLY_ATTENDANCES_QUERY = gql`
  query WeeklyAttendances($userId: Int!, $start: DateTime!, $end: DateTime!) {
    attendancesInRange(userId: $userId, start: $start, end: $end) {
      id
      date
      clockIn
      clockOut
      duration
      status
      location
    }
  }
`

const BOOKINGS_QUERY = gql`
  query DashboardBookingsQuery($userId: Int!) {
    bookings(userId: $userId) {
      id
      clockIn
      clockOut
      status
      duration
      location
      date
    }
  }
`

// Helper for UTC midnight ISO string
function getUTCMidnightISOString(date = new Date()) {
  const utc = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  return utc.toISOString().slice(0, 10)
}

function getLocalMidnightISOString(date = new Date()) {
  const local = new Date(date)
  local.setHours(0, 0, 0, 0)
  const tzOffset = local.getTimezoneOffset() * 60000
  const localMidnight = new Date(local.getTime() - tzOffset)
  return localMidnight.toISOString().slice(0, 10)
}

function getStartOfWeekUTC(date) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  const day = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() - day + 1)
  return d
}
const weekStart = getStartOfWeekUTC(new Date())
const weekEnd = new Date(weekStart)
weekEnd.setUTCDate(weekStart.getUTCDate() + 6)
weekEnd.setUTCHours(23, 59, 59, 999)
const daysOfWeek = Array.from({ length: 7 }, (_, i) => {
  const d = new Date(weekStart)
  d.setUTCDate(weekStart.getUTCDate() + i)
  return d.toISOString().slice(0, 10)
})

const DashboardPage = () => {
  const { currentUser } = useAuth()
  const userId = currentUser.id
  const [userName, setUserName] = useState('')

  // For bookings and other attendance data
  const { data, loading, error, refetch } = useQuery(BOOKINGS_QUERY, {
    variables: { userId },
    fetchPolicy: 'network-only',
  })

  // For weekly attendances (used in AttendanceCard)
  const { data: weeklyData, loading: weeklyLoading, refetch: refetchWeekly } = useQuery(WEEKLY_ATTENDANCES_QUERY, {
    variables: {
      userId,
      start: weekStart.toISOString(),
      end: weekEnd.toISOString(),
    },
    fetchPolicy: 'network-only',
  })

  const [clockInMutation, { loading: clockInLoading }] = useMutation(CLOCK_IN_MUTATION, {
    onCompleted: () => {
      refetch()
      refetchWeekly()
    },
  })
  const [clockOutMutation, { loading: clockOutLoading }] = useMutation(CLOCK_OUT_MUTATION, {
    onCompleted: () => {
      refetch()
      refetchWeekly()
    },
  })

  // Use local date for matching and creating attendance
  const localDateString = getLocalMidnightISOString()
  const localDateISO = `${localDateString}T00:00:00.000Z`

  const weeklyAttendances = weeklyData?.attendancesInRange || []
  const utcDateString = getUTCMidnightISOString()
  const todayAttendance = weeklyAttendances.find(a =>
    a.date.startsWith(utcDateString)
  ) || null

  const handleClockIn = () => {
    clockInMutation({
      variables: {
        userId,
        date: localDateISO,
        clockIn: new Date().toISOString(),
      },
    })
  }

  const handleClockOut = () => {
    if (!todayAttendance) return
    clockOutMutation({
      variables: {
        id: todayAttendance.id,
        clockOut: new Date().toISOString(),
      },
    })
  }

  return (
    <>
      <Metadata title="Dashboard" description="Dashboard page" />
      <Header />
      <main className="pt-10 px-4 md:px-8 lg:px-12">
        <WelcomeSection />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Left: Upcoming Bookings (2/3 width on large screens) */}
          <div className="lg:col-span-2">
            <UpcomingBookings userId={userId} refetchBookings={refetch} />
          </div>
          {/* Right: Attendance Card (1/3 width on large screens) */}
          <div id="attendance-section">
            <AttendanceCard
              todayAttendance={todayAttendance}
              weeklyAttendances={weeklyAttendances}
              onClockIn={handleClockIn}
              onClockOut={handleClockOut}
              loading={loading || clockInLoading || clockOutLoading || weeklyLoading}
              refetch={refetch} // Pass refetch function
            />
          </div>
        </div>
        {/* Attendance Section with ID for scroll */}
        <div>
          <Attendance userId={userId} userName={userName} refetch={refetch} />
        </div>
        <div id="bookings-section" className="mt-8">
          <BookingForm userName={userName} refetchBookings={refetch} />
        </div>
      </main>
    </>
  )
}

export default DashboardPage
