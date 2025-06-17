import React, { useEffect, useState } from 'react'
import { useQuery } from '@redwoodjs/web'

const BOOKINGS_LOG_QUERY = gql`
  query BookingsLog {
    bookings {
      id
      title
      startTime
      endTime
      notes
      meetingRoom {
        id
        name
      }
      user {
        id
        name
        email
      }
    }
  }
`

const getStatus = (startTime, endTime) => {
  const now = new Date()
  const start = new Date(startTime)
  const end = new Date(endTime)
  if (now < start) return 'Upcoming'
  if (now >= start && now <= end) return 'Ongoing'
  return 'Expired'
}

const statusColor = (status) => {
  if (status === 'Upcoming') return 'bg-yellow-400 text-white'
  if (status === 'Ongoing') return 'bg-green-500 text-white'
  return 'bg-gray-400 text-white'
}

const BookingLog = () => {
  const { data, loading, error, refetch } = useQuery(BOOKINGS_LOG_QUERY, {
    fetchPolicy: 'network-only',
  })

  const [bookings, setBookings] = useState([])

  // Poll in the background and update state only if changed
  useEffect(() => {
    if (data?.bookings) setBookings(data.bookings)
  }, [data])

  useEffect(() => {
    const interval = setInterval(async () => {
      const result = await refetch()
      if (result.data?.bookings) {
        // Only update if data actually changed
        if (JSON.stringify(result.data.bookings) !== JSON.stringify(bookings)) {
          setBookings(result.data.bookings)
        }
      }
    }, 10000) // 10 seconds
    return () => clearInterval(interval)
  }, [refetch, bookings])

  const now = new Date()
  const ongoing = bookings.filter(
    b => new Date(b.startTime) <= now && new Date(b.endTime) > now
  )
  const upcoming = bookings.filter(
    b => new Date(b.startTime) > now
  )

  const filtered = [...upcoming, ...ongoing]

  if (loading && bookings.length === 0) return <div className="mt-8">Loading booking log...</div>
  if (error) return <div className="mt-8 text-red-500">Error: {error.message}</div>
  if (filtered.length === 0) {
    return <div className="mt-8 text-gray-500">No upcoming or ongoing meetings.</div>
  }

  return (
    <div className="mt-12 bg-white border border-blue-200 rounded-xl shadow p-6">
      <h2 className="text-xl font-semibold mb-4 text-blue-700">Booking Log (All Users)</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-blue-50">
              <th className="px-4 py-2 text-left">Meeting</th>
              <th className="px-4 py-2 text-left">User</th>
              <th className="px-4 py-2 text-left">Meeting Room</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Start</th>
              <th className="px-4 py-2 text-left">End</th>
              <th className="px-4 py-2 text-left">Notes</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((b) => {
              const status = getStatus(b.startTime, b.endTime)
              return (
                <tr key={b.id} className="border-t">
                  <td className="px-4 py-2">{b.title}</td>
                  <td className="px-4 py-2 font-medium">
                    {b.user?.name || b.user?.email || 'Unknown'}
                  </td>
                  <td className="px-4 py-2">{b.meetingRoom?.name || 'N/A'}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${statusColor(status)}`}>
                      {status}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    {new Date(b.startTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </td>
                  <td className="px-4 py-2">
                    {new Date(b.endTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </td>
                  <td className="px-4 py-2">{b.notes}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default BookingLog
