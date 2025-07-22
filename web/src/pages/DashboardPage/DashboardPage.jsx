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
import VacationPlanner from 'src/components/VacationPlanner/VacationPlanner'

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
      title
      notes
      startTime
      endTime
      userId
      meetingRoomId
      createdAt
    }
  }
`

const WEEKLY_BREAKS_QUERY = gql`
  query WeeklyBreaks($userId: Int!, $start: DateTime!, $end: DateTime!) {
    attendanceBreaksForUserInRange(userId: $userId, start: $start, end: $end) {
      id
      attendanceId
      breakIn
      breakOut
      duration
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
  d.setUTCHours(0, 0, 0, 0)
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

  // New mutations for break and overtime
  const CREATE_BREAK_MUTATION = gql`
    mutation CreateAttendanceBreak($input: CreateAttendanceBreakInput!) {
      createAttendanceBreak(input: $input) {
        id
        breakIn
        breakOut
        duration
      }
    }
  `

  const UPDATE_BREAK_MUTATION = gql`
    mutation UpdateAttendanceBreak($id: Int!, $input: UpdateAttendanceBreakInput!) {
      updateAttendanceBreak(id: $id, input: $input) {
        id
        breakIn
        breakOut
        duration
      }
    }
  `

  const CREATE_OVERTIME_MUTATION = gql`
    mutation CreateOvertimeAttendance($input: CreateOvertimeAttendanceInput!) {
      createOvertimeAttendance(input: $input) {
        id
        clockIn
        clockOut
      }
    }
  `

  const UPDATE_OVERTIME_MUTATION = gql`
    mutation UpdateOvertimeAttendance($id: Int!, $input: UpdateOvertimeAttendanceInput!) {
      updateOvertimeAttendance(id: $id, input: $input) {
        id
        clockIn
        clockOut
      }
    }
  `

  const [createBreakMutation, { loading: createBreakLoading }] = useMutation(CREATE_BREAK_MUTATION, {
    onCompleted: () => {
      refetch()
      refetchWeekly()
    },
  })

  const [updateBreakMutation, { loading: updateBreakLoading }] = useMutation(UPDATE_BREAK_MUTATION, {
    onCompleted: () => {
      refetch()
      refetchWeekly()
      refetchBreaks()
    },
    // Add event loader to ensure UI updates after mutation
    awaitRefetchQueries: true,
    refetchQueries: ['GetAttendanceBreaks'],
  })

  const [createOvertimeMutation] = useMutation(CREATE_OVERTIME_MUTATION, {
    onCompleted: () => {
      refetch()
      refetchWeekly()
    },
  })

  const [updateOvertimeMutation] = useMutation(UPDATE_OVERTIME_MUTATION, {
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

  // Breaks and overtime state
  const [breaks, setBreaks] = React.useState([])
  const [overtimeToday, setOvertimeToday] = React.useState(null)
  const [officeHours, setOfficeHours] = React.useState(null)

  const GET_BREAKS_QUERY = gql`
 
    query GetAttendanceBreaks($attendanceId: Int!) {
      attendanceBreaks(attendanceId: $attendanceId) {
        id
        attendanceId
        breakIn
        breakOut
        duration
      }
    }
  `

  const GET_OVERTIME_QUERY = gql`
    query GetOvertimeAttendance($userId: Int!, $date: DateTime!) {
      overtimeAttendances {
        id
        userId
        date
        clockIn
        clockOut
      }
    }
  `

const GET_OFFICE_HOURS_QUERY = gql`
  query GetOfficeHours {
    officeHourses {
      id
      startTime
      endTime
    }
  }
`

  const { data: breaksData, refetch: refetchBreaks } = useQuery(GET_BREAKS_QUERY, {
    variables: { attendanceId: todayAttendance?.id },
    skip: !todayAttendance,
  })

  const { data: overtimeData, refetch: refetchOvertime } = useQuery(GET_OVERTIME_QUERY, {
    variables: { userId, date: localDateISO },
    skip: !userId || !localDateISO,
  })

  const { data: officeHoursData, refetch: refetchOfficeHours } = useQuery(GET_OFFICE_HOURS_QUERY)

  React.useEffect(() => {
    const handler = () => {
      console.log('attendanceBreaksUpdated event received, refetching breaks')
      refetchBreaks()
    }
    window.addEventListener('attendanceBreaksUpdated', handler)
    if (breaksData?.attendanceBreaks) {
      console.log('Setting breaks state:', breaksData.attendanceBreaks)
      setBreaks(breaksData.attendanceBreaks)
    }
    return () => {
      window.removeEventListener('attendanceBreaksUpdated', handler)
    }
  }, [breaksData, refetchBreaks])

  React.useEffect(() => {
    if (overtimeData?.overtimeAttendances && overtimeData.overtimeAttendances.length > 0) {
      setOvertimeToday(overtimeData.overtimeAttendances[0])
    } else {
      setOvertimeToday(null)
    }
  }, [overtimeData])

  React.useEffect(() => {
    if (officeHoursData?.officeHourses && officeHoursData.officeHourses.length > 0) {
      setOfficeHours(officeHoursData.officeHourses[0])
    }
  }, [officeHoursData])

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

  // Break handlers
  const handleBreakIn = () => {
    if (!todayAttendance) return
    const now = new Date().toISOString()
    createBreakMutation({
      variables: {
        input: {
          attendanceId: todayAttendance.id,
          breakIn: now,
        },
      },
      onCompleted: () => {
        // Refetch both today's and weekly breaks after mutation
        refetchBreaks()
        refetchWeeklyBreaks()
      },
    })
  }

  const handleBreakOut = async () => {
    if (!todayAttendance) return
    // Find latest break without breakOut
    const latestBreak = breaks.find(b => b.breakIn && !b.breakOut)
    if (!latestBreak) return
    try {
      await updateBreakMutation({
        variables: {
          id: latestBreak.id,
          input: {
            breakOut: new Date().toISOString(),
            duration: calculateDuration(latestBreak.breakIn, new Date().toISOString()),
          },
        },
      })
      // Refetch both today's and weekly breaks after mutation
      refetchBreaks()
      refetchWeeklyBreaks()
    } catch (error) {
      console.error('Error updating break out:', error)
      alert('Failed to end break. Please try again.')
    }
  }

  // Overtime handlers
  const handleOvertimeClockIn = () => {
    createOvertimeMutation({
      variables: {
        input: {
          userId,
          date: localDateISO,
          clockIn: new Date().toISOString(),
        },
      },
    })
  }

  const handleOvertimeClockOut = () => {
    if (!overtimeToday) return
    updateOvertimeMutation({
      variables: {
        id: overtimeToday.id,
        input: {
          clockOut: new Date().toISOString(),
        },
      },
    })
  }

  // Helper to calculate duration string
  const calculateDuration = (start, end) => {
    const diffMs = new Date(end) - new Date(start)
    const hours = Math.floor(diffMs / 1000 / 60 / 60)
    const minutes = Math.floor((diffMs / 1000 / 60) % 60)
    return `${hours}h ${minutes}m`
  }

  const { data: weeklyBreaksData, refetch: refetchWeeklyBreaks } = useQuery(WEEKLY_BREAKS_QUERY, {
    variables: {
      userId,
      start: weekStart.toISOString(),
      end: weekEnd.toISOString(),
    },
    fetchPolicy: 'network-only',
  })

  const weeklyBreaks = weeklyBreaksData?.attendanceBreaksForUserInRange || []

  return (
    <>
   
      <Metadata title="Dashboard" description="Dashboard page" />
      <Header />
  
      <main className="relative pt-10 px-4 md:px-8 lg:px-12 h-screen">
     
            
         
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
              refetch={refetch}
              officeHours={officeHours}
              breaks={weeklyBreaks} 
              overtimeToday={overtimeToday}
              onBreakIn={handleBreakIn}
              onBreakOut={handleBreakOut}
              onOvertimeClockIn={handleOvertimeClockIn}
              onOvertimeClockOut={handleOvertimeClockOut}
            />
          </div>
        </div>
        {/* Attendance Section with ID for scroll */}
        <div>
          <Attendance userId={userId} todayAttendance={todayAttendance} userName={userName} refetch={refetch} />
        </div>
        <div id="bookings-section" className="mt-8">
          <BookingForm userName={userName} refetchBookings={refetch} />
        </div>
        {/* Add the vacation planner section */}
        <div id="vacation-section" className="mb-8">
          <VacationPlanner />
        </div>
      </main>
    </>
  )
}

export default DashboardPage
