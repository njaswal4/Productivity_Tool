import React, { useState, useEffect } from 'react'
import { useMutation, useQuery } from '@redwoodjs/web'
import { useAuth } from 'src/auth'
//import { toast } from '@redwoodjs/web/toast'
import BookingLog from 'src/components/BookingLog/BookingLog'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { format } from 'date-fns'
import { FaRegCalendarAlt, FaRegClock } from 'react-icons/fa'
import MeetingRoomSelector from '../BookingForm/MeetingRoomSelector'
const CREATE_BOOKING = gql`
  mutation CreateBookingMutation($input: CreateBookingInput!) {
    createBooking(input: $input) {
      id
    }
  }
`

const BOOKINGS_QUERY = gql`
  query BookingsForForm {
    bookings {
      id
      startTime
      endTime
      meetingRoomId
    }
  }
`

export const BookingForm = ({ refetchBookings }) => {
  const { currentUser } = useAuth()
  const [title, setTitle] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedSlots, setSelectedSlots] = useState([])
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [createBooking] = useMutation(CREATE_BOOKING)
  const [selectRoomId, setSelectedRoomId] = useState('')
  const { data: bookingsData, refetch: refetchBookingsData } = useQuery(BOOKINGS_QUERY, {
    variables: { userId: currentUser?.id },
  })

  const slots = [
    { start: '09:00 AM', end: '09:30 AM' },
    { start: '09:30 AM', end: '10:00 AM' },
    { start: '10:00 AM', end: '10:30 AM' },
    { start: '10:30 AM', end: '11:00 AM' },
    { start: '11:00 AM', end: '11:30 AM' },
    { start: '11:30 AM', end: '12:00 PM' },
    { start: '12:00 PM', end: '12:30 PM' },
    { start: '12:30 PM', end: '01:00 PM' },
    { start: '01:00 PM', end: '01:30 PM' },
    { start: '01:30 PM', end: '02:00 PM' },
    { start: '02:00 PM', end: '02:30 PM' },
    { start: '02:30 PM', end: '03:00 PM' },
    { start: '03:00 PM', end: '03:30 PM' },
    { start: '03:30 PM', end: '04:00 PM' },
    { start: '04:00 PM', end: '04:30 PM' },
    { start: '04:30 PM', end: '05:00 PM' },
  ]

  // Helper to parse slot time string to Date object on selectedDate
  const parseSlotTime = (date, timeStr) => {
    const [time, modifier] = timeStr.split(' ')
    let [hours, minutes] = time.split(':').map(Number)
    if (modifier === 'PM' && hours !== 12) {
      hours += 12
    }
    if (modifier === 'AM' && hours === 12) {
      hours = 0
    }
    const newDate = new Date(date)
    newDate.setHours(hours, minutes, 0, 0)
    return newDate
  }

  // Check if slot is in the past relative to now
  const isSlotInPast = (slot) => {
    const now = new Date()
    const slotEnd = parseSlotTime(selectedDate, slot.end)
    return slotEnd <= now
  }

  // Check if slot overlaps with any existing booking for the SAME meeting room
  const isSlotBooked = (slot) => {
    if (!bookingsData || !bookingsData.bookings || !selectRoomId) return false
    const slotStart = parseSlotTime(selectedDate, slot.start)
    const slotEnd = parseSlotTime(selectedDate, slot.end)

    return bookingsData.bookings.some((booking) => {
      // Only check bookings for the same meeting room
      if (booking.meetingRoomId !== Number(selectRoomId)) {
        return false
      }
      
      const bookingStart = new Date(booking.startTime)
      const bookingEnd = new Date(booking.endTime)
      // Check if slot overlaps with booking
      return (
        (slotStart >= bookingStart && slotStart < bookingEnd) ||
        (slotEnd > bookingStart && slotEnd <= bookingEnd) ||
        (slotStart <= bookingStart && slotEnd >= bookingEnd)
      )
    })
  }

  const toggleSlotSelection = (slot) => {
    // Prevent selecting disabled slots
    if (isSlotInPast(slot) || isSlotBooked(slot)) {
      return
    }
    setSelectedSlots((prev) =>
      prev.some((s) => s.start === slot.start && s.end === slot.end)
        ? prev.filter((s) => s.start !== slot.start || s.end !== slot.end)
        : [...prev, slot]
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (selectedSlots.length === 0) {
      setError('Please select at least one time slot.')
      setSuccess('')
      return
    }

    if (!title.trim()) {
      setError('Please enter a meeting title.')
      setSuccess('')
      return
    }

    if (!selectRoomId) {
      setError('Please select a meeting room.')
      setSuccess('')
      return
    }

    // Use parseSlotTime for mobile compatibility!
    const startTime = parseSlotTime(selectedDate, selectedSlots[0].start)
    const endTime = parseSlotTime(selectedDate, selectedSlots[selectedSlots.length - 1].end)

    if (!startTime || isNaN(startTime.getTime()) || !endTime || isNaN(endTime.getTime())) {
      setError('Invalid start or end time.')
      setSuccess('')
      return
    }

    try {
      await createBooking({
        variables: {
          input: {
            title,
            userId: currentUser.id,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            notes,
            meetingRoomId: selectRoomId ? Number(selectRoomId) : null,
          },
        },
      })
      setSuccess('Booking successful!')
      setError('')
      setTitle('')
      setSelectedSlots([])
      setNotes('')
      
      // Notify other components about the update
      window.dispatchEvent(new Event('bookingsUpdated'))
      window.localStorage.setItem('bookingsUpdated', Date.now())
      
      if (refetchBookings) refetchBookings()
      if (refetchBookingsData) refetchBookingsData()
    } catch (err) {
      console.error('Error creating booking:', err)
      setError(err.message)
      setSuccess('')
    }
  }

  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess('')
        setError('')
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [success, error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-100 px-2 py-8 sm:px-4 md:px-6 lg:px-8">
      <div className="max-w-[1600px] mx-auto bg-white/60 backdrop-blur-xl border border-gray-200 rounded-[2rem] shadow-2xl p-2 sm:p-6 md:p-10 lg:p-16 space-y-10">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-center text-gray-800">
          Book a Meeting Room
        </h1>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 items-start w-full"
        >
          {/* Calendar Column */}
          <div className="w-full bg-white/70 backdrop-blur-md border border-gray-300 rounded-3xl px-2 sm:px-6 md:px-10 py-6 md:py-10 shadow-md hover:shadow-xl transition">
            <div className="flex items-center gap-2 mb-4 md:mb-6 text-red-500 justify-center">
              <FaRegCalendarAlt className="text-xl" />
              <h2 className="text-lg md:text-xl font-semibold tracking-wide">Choose Date</h2>
            </div>
            <div className="flex justify-center">
              <Calendar
                onChange={setSelectedDate}
                value={selectedDate}
                minDate={new Date()}
                className="react-calendar w-full max-w-[350px] md:max-w-[700px] p-2 md:p-6 rounded-2xl"
                tileClassName={({ date }) =>
                  format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
                    ? 'bg-red-500 text-white font-semibold rounded-xl shadow-md'
                    : 'hover:bg-red-100 hover:shadow-sm rounded-xl transition-all'
                }
              />
            </div>
          </div>

          {/* Time Slots Column */}
          <div className="w-full bg-white/70 backdrop-blur-md border border-gray-300 rounded-3xl px-2 sm:px-6 md:px-10 py-6 md:py-10 shadow-md hover:shadow-xl transition flex flex-col items-center">
            <div className="flex items-center gap-2 mb-2 md:mb-4 text-red-500">
              <FaRegClock className="text-xl" />
              <h2 className="text-lg md:text-xl font-semibold tracking-wide">Choose Time Slots</h2>
            </div>
            <p className="text-center text-gray-600 mb-4 md:mb-6 font-medium text-sm md:text-base">
              {format(selectedDate, 'eeee, MMMM do yyyy')}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4 w-full max-w-[520px] max-h-[400px] overflow-y-auto pr-1">
              {slots
                .filter((slot) => !isSlotInPast(slot) && !isSlotBooked(slot))
                .map((slot, idx) => (
                  <button
                    key={idx}
                    onClick={() => toggleSlotSelection(slot)}
                    className={`py-2 md:py-3 rounded-xl text-sm md:text-base font-semibold transition transform duration-200 border ${
                      selectedSlots.some((s) => s.start === slot.start && s.end === slot.end)
                        ? 'bg-red-500 text-white shadow-lg scale-105'
                        : 'bg-white hover:bg-red-100 hover:scale-105 text-gray-800'
                    }`}
                  >
                    {slot.start} - {slot.end}
                  </button>
                ))}
            </div>
            {slots.filter((slot) => !isSlotInPast(slot) && !isSlotBooked(slot)).length === 0 && (
              <p className="text-center text-gray-600 mt-4">
                No available slots for the selected date. Please choose another date or check back later.
              </p>
            )}
          </div>

          {/* Meeting Title and Notes */}
          <div className="col-span-1 md:col-span-2 flex flex-col gap-4 mt-6 md:mt-8">
            <div>
              <MeetingRoomSelector
                selectedRoomId={selectRoomId}
                onChange={(roomId) => setSelectedRoomId(roomId)}
              />
            </div>
            <input
              type="text"
              placeholder="Meeting Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rw-input w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring focus:ring-red-500"
            />
            <textarea
              placeholder="Notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="rw-input w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring focus:ring-red-500"
            />
          </div>

          <div className="col-span-1 md:col-span-2 flex justify-center mt-6 md:mt-8">
            <button
              type="submit"
              className="rw-button rw-button-blue px-6 py-3 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition"
              disabled={!selectRoomId}
            >
              Book Now
            </button>
          </div>
        </form>
        {error && <div className="text-red-600 font-bold text-center mb-2">{error}</div>}
        {success && <div className="text-green-600 font-bold text-center mb-2">{success}</div>}
      </div>
      <BookingLog />
    </div>
  )
}

export const BookingDetail = () => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-gray-800">Booking Detail</h2>
      <p className="text-gray-600">Details about the booking will go here.</p>
    </div>
  )
}

export default BookingForm
