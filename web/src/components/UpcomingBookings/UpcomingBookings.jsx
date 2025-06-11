import React, { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@redwoodjs/web'

const BOOKINGS_QUERY = gql`
  query UpcomingBookingsQuery($userId: Int!) {
    bookings(userId: $userId) {
      id
      title
      startTime
      endTime
      notes
    }
  }
`

const DELETE_BOOKING_MUTATION = gql`
  mutation DeleteBookingMutation($id: Int!) {
    deleteBooking(id: $id) {
      id
    }
  }
`

const FINISH_BOOKING_MUTATION = gql`
  mutation FinishBookingMutation($id: Int!, $endTime: DateTime!) {
    updateBooking(id: $id, input: { endTime: $endTime }) {
      id
      endTime
    }
  }
`

const getStatus = (startTime, endTime) => {
  const now = new Date()
  const start = new Date(startTime)
  const end = new Date(endTime)
  if (now < start) return 'Upcoming'
  if (now >= start && now <= end) return 'Ongoing'
  if (now > end) return 'Expired'
  return 'Upcoming'
}

const statusColor = (status) => {
  if (status === 'Upcoming') return 'bg-yellow-400 text-white'
  if (status === 'Ongoing') return 'bg-green-500 text-white'
  if (status === 'Expired') return 'bg-gray-400 text-white'
  return ''
}

// Date card formatter: "Mon 12"
const dateCard = (dateStr) => {
  const date = new Date(dateStr)
  const weekday = date.toLocaleDateString(undefined, { weekday: 'short' })
  const day = date.getDate()
  return (
    <div className="flex flex-col items-center justify-center bg-gray-100 rounded-lg px-2 py-1 w-14 h-14 mr-4">
      <span className="text-xs text-gray-500">{weekday}</span>
      <span className="text-lg font-bold text-gray-800">{day}</span>
    </div>
  )
}

const MEETINGS_PER_PAGE = 5

const MeetingList = ({ bookings, onDeleteClick, showDelete, onFinishClick }) => {
  const [page, setPage] = useState(1)
  const totalPages = Math.ceil(bookings.length / MEETINGS_PER_PAGE)
  const paginated = bookings.slice((page - 1) * MEETINGS_PER_PAGE, page * MEETINGS_PER_PAGE)

  return (
    <>
      {paginated.length === 0 ? (
        <div className="text-gray-400 text-sm">No meetings.</div>
      ) : (
        <div className="divide-y divide-gray-200">
          {paginated.map((b) => {
            const status = getStatus(b.startTime, b.endTime)
            return (
              <div key={b.id} className="p-4 flex items-start">
                {dateCard(b.startTime)}
                <div className="flex-grow">
                  <div className="flex justify-between">
                    <h3 className="font-medium text-gray-900">{b.title}</h3>
                    <span className="text-sm text-gray-500">
                      {new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(b.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{b.notes}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-md text-xs font-bold ${statusColor(status)}`}>
                      {status}
                    </span>
                    {showDelete && status === 'Upcoming' && (
                      <button
                        onClick={() => onDeleteClick(b)}
                        className="ml-2 px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-700 transition"
                      >
                        Delete
                      </button>
                    )}
                    {status === 'Ongoing' && (
                      <button
                        onClick={() => onFinishClick(b)}
                        className="ml-2 px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-red-700 transition"
                      >
                        Finish
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4 gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 disabled:opacity-50"
          >
            Prev
          </button>
          <span className="px-2 py-1 text-sm">{page} / {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </>
  )
}

const UpcomingBookings = ({ userId }) => {
  const { data, loading, error, refetch } = useQuery(BOOKINGS_QUERY, {
    variables: { userId },
    fetchPolicy: 'network-only',
  })

  const [deleteBooking] = useMutation(DELETE_BOOKING_MUTATION, {
    refetchQueries: [{ query: BOOKINGS_QUERY, variables: { userId } }],
  })

  const [finishBooking] = useMutation(FINISH_BOOKING_MUTATION, {
    refetchQueries: [{ query: BOOKINGS_QUERY, variables: { userId } }],
  })

  // Popup state
  const [showPopup, setShowPopup] = useState(false)
  const [bookingToDelete, setBookingToDelete] = useState(null)
  const [showPast, setShowPast] = useState(false)

  // Local state for bookings
  const [bookings, setBookings] = useState([])

  // Update bookings when data changes
  useEffect(() => {
    if (data?.bookings) setBookings(data.bookings)
  }, [data])

  // Poll in the background and update state only if changed
  useEffect(() => {
    const interval = setInterval(async () => {
      const result = await refetch()
      if (result.data?.bookings) {
        if (JSON.stringify(result.data.bookings) !== JSON.stringify(bookings)) {
          setBookings(result.data.bookings)
        }
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [refetch, bookings])

  const handleDeleteClick = (booking) => {
    setBookingToDelete(booking)
    setShowPopup(true)
  }

  const confirmDelete = () => {
    if (bookingToDelete) {
      deleteBooking({ variables: { id: bookingToDelete.id } })
    }
    setShowPopup(false)
    setBookingToDelete(null)
  }

  const cancelDelete = () => {
    setShowPopup(false)
    setBookingToDelete(null)
  }

  const handleFinishClick = (booking) => {
    finishBooking({
      variables: { id: booking.id, endTime: new Date().toISOString() }
    })
  }

  if (loading && bookings.length === 0) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  if (!bookings.length) return <div>No bookings yet.</div>

  const upcoming = bookings.filter(b => getStatus(b.startTime, b.endTime) === 'Upcoming')
  const ongoing = bookings.filter(b => getStatus(b.startTime, b.endTime) === 'Ongoing')
  const expired = bookings.filter(b => getStatus(b.startTime, b.endTime) === 'Expired')

  return (
    <div className="bg-white border-2 border-primary/30 rounded-xl shadow-lg overflow-hidden col-span-1 lg:col-span-2 p-4">
      <div className="gap-2 mb-4">
        <p className="text-3xl font-bold text-blue-600 pr-30">My Bookings</p>
        <div className="flex  justify-end">
          <button
            onClick={() => setShowPast(false)}
            className={`px-4 py-2 rounded ${!showPast ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Upcoming & Ongoing
          </button>
          <button
            onClick={() => setShowPast(true)}
            className={`px-4 py-2 rounded ${showPast ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Past Meetings
          </button>
        </div>
      </div>

      {!showPast ? (
        <>
          <div className="mb-8 border-l-4 border-yellow-400 bg-yellow-50 rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-2 text-yellow-700">Upcoming Meetings</h3>
            <MeetingList bookings={upcoming} onDeleteClick={handleDeleteClick} showDelete={true} />
          </div>
          <div className="border-l-4 border-green-500 bg-green-50 rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-2 text-green-700">Ongoing Meetings</h3>
            <MeetingList bookings={ongoing} onFinishClick={handleFinishClick} showDelete={false} />
          </div>
        </>
      ) : (
        <div className="border-l-4 border-gray-400 bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-lg mb-2 text-gray-700">Past Meetings</h3>
          <MeetingList bookings={expired} showDelete={false} />
        </div>
      )}

      {/* Popup Card */}
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-4">Delete Booking</h2>
            <p className="mb-6">
              Are you sure you want to delete <span className="font-bold">{bookingToDelete?.title}</span>?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded bg-red-500 hover:bg-red-700 text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UpcomingBookings
