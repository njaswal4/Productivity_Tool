import {
  Form,
  FormError,
  FieldError,
  Label,
  TextField,
  DatetimeLocalField,
  NumberField,
  Submit,
  Select,
} from '@redwoodjs/forms'
import { useState, useEffect } from 'react'
import { FaRegCalendarAlt, FaRegClock } from 'react-icons/fa'
import { useQuery } from '@redwoodjs/web'

const formatDatetime = (value) => {
  if (value) {
    return value.replace(/:\d{2}\.\d{3}\w/, '')
  }
}

const GET_MEETING_ROOMS = gql`
  query GetMeetingRooms {
    meetingRooms {
      id
      name
    }
  }
`

const CHECK_AVAILABILITY = gql`
  query CheckAvailability($meetingRoomId: Int!, $date: String!) {
    checkAvailability(meetingRoomId: $meetingRoomId, date: $date) {
      meetingRoomId
      date
      bookedSlots {
        id
        startTime
        endTime
        user {
          name
          email
        }
      }
    }
  }
`

const BookingForm = (props) => {
  const { data, loading, error } = useQuery(GET_MEETING_ROOMS)
  const [selectedRoomId, setSelectedRoomId] = useState(props?.booking?.meetingRoomId || '')
  const [selectedDate, setSelectedDate] = useState('')

  const { data: availabilityData, loading: availabilityLoading } = useQuery(
    CHECK_AVAILABILITY,
    {
      variables: { 
        meetingRoomId: parseInt(selectedRoomId), 
        date: selectedDate 
      },
      skip: !selectedRoomId || !selectedDate
    }
  )

  useEffect(() => {
    // Set default date to today if not editing
    if (!props?.booking && !selectedDate) {
      const today = new Date().toISOString().split('T')[0]
      setSelectedDate(today)
    }
  }, [props?.booking, selectedDate])

  const onSubmit = (data) => {
    props.onSave(data, props?.booking?.id)
  }

  const formatTime = (dateTime) => {
    return new Date(dateTime).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const bookedSlots = availabilityData?.checkAvailability?.bookedSlots || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-100 px-6 py-16">
      <div className="max-w-[1600px] mx-auto bg-white/60 backdrop-blur-xl border border-gray-200 rounded-[2rem] shadow-2xl p-10 md:p-16 space-y-14">
        <h1 className="text-4xl md:text-5xl font-extrabold text-center text-gray-800">
          Book a Meeting Room
        </h1>

        <Form
          onSubmit={onSubmit}
          error={props.error}
          className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start w-full"
        >
          {/* Calendar Column */}
          <div className="w-full bg-white/70 backdrop-blur-md border border-gray-300 rounded-3xl px-4 sm:px-10 py-10 shadow-md hover:shadow-xl transition">
            <div className="flex items-center gap-2 mb-6 text-red-500 justify-center">
              <FaRegCalendarAlt className="text-xl" />
              <h2 className="text-xl font-semibold tracking-wide">
                Meeting Details
              </h2>
            </div>

            <Label
              name="title"
              className="rw-label text-gray-700 font-semibold mb-2"
              errorClassName="rw-label rw-label-error"
            >
              Title
            </Label>
            <TextField
              name="title"
              defaultValue={props.booking?.title}
              className="rw-input w-full rounded-lg border-gray-300 shadow-sm focus:ring-red-500 focus:border-red-500"
              errorClassName="rw-input rw-input-error"
              validation={{ required: true }}
            />
            <FieldError
              name="title"
              className="rw-field-error text-red-500 mt-1"
            />

            <Label
              name="notes"
              className="rw-label text-gray-700 font-semibold mt-4 mb-2"
              errorClassName="rw-label rw-label-error"
            >
              Notes
            </Label>
            <TextField
              name="notes"
              defaultValue={props.booking?.notes}
              className="rw-input w-full rounded-lg border-gray-300 shadow-sm focus:ring-red-500 focus:border-red-500"
              errorClassName="rw-input rw-input-error"
            />
            <FieldError
              name="notes"
              className="rw-field-error text-red-500 mt-1"
            />
          </div>

          {/* Time Slots Column */}
          <div className="w-full bg-white/70 backdrop-blur-md border border-gray-300 rounded-3xl px-4 sm:px-10 py-10 shadow-md hover:shadow-xl transition">
            <div className="flex items-center gap-2 mb-4 text-red-500">
              <FaRegClock className="text-xl" />
              <h2 className="text-xl font-semibold tracking-wide">Choose Time</h2>
            </div>

            <Label
              name="startTime"
              className="rw-label text-gray-700 font-semibold mb-2"
              errorClassName="rw-label rw-label-error"
            >
              Start Time
            </Label>
            <DatetimeLocalField
              name="startTime"
              defaultValue={formatDatetime(props.booking?.startTime)}
              className="rw-input w-full rounded-lg border-gray-300 shadow-sm focus:ring-red-500 focus:border-red-500"
              errorClassName="rw-input rw-input-error"
              validation={{ required: true }}
            />
            <FieldError
              name="startTime"
              className="rw-field-error text-red-500 mt-1"
            />

            <Label
              name="endTime"
              className="rw-label text-gray-700 font-semibold mt-4 mb-2"
              errorClassName="rw-label rw-label-error"
            >
              End Time
            </Label>
            <DatetimeLocalField
              name="endTime"
              defaultValue={formatDatetime(props.booking?.endTime)}
              className="rw-input w-full rounded-lg border-gray-300 shadow-sm focus:ring-red-500 focus:border-red-500"
              errorClassName="rw-input rw-input-error"
              validation={{ required: true }}
            />
            <FieldError
              name="endTime"
              className="rw-field-error text-red-500 mt-1"
            />

            <Label
              name="userId"
              className="rw-label text-gray-700 font-semibold mt-4 mb-2"
              errorClassName="rw-label rw-label-error"
            >
              User ID
            </Label>
            <NumberField
              name="userId"
              defaultValue={props.booking?.userId}
              className="rw-input w-full rounded-lg border-gray-300 shadow-sm focus:ring-red-500 focus:border-red-500"
              errorClassName="rw-input rw-input-error"
              validation={{ required: true }}
            />
            <FieldError
              name="userId"
              className="rw-field-error text-red-500 mt-1"
            />

            <Label
              name="meetingRoomId"
              className="rw-label text-gray-700 font-semibold mt-4 mb-2"
              errorClassName="rw-label rw-label-error"
            >
              Select Meeting Room
            </Label>
            <Select
              name="meetingRoomId"
              defaultValue={props.booking?.meetingRoomId}
              className="rw-input w-full rounded-lg border-gray-300 shadow-sm focus:ring-red-500 focus:border-red-500"
              errorClassName="rw-input rw-input-error"
              validation={{ required: true }}
              disabled={loading}
              onChange={(e) => setSelectedRoomId(e.target.value)}
            >
              <option value="">Select a meeting room</option>
              {data?.meetingRooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </Select>
            <FieldError
              name="meetingRoomId"
              className="rw-field-error text-red-500 mt-1"
            />

            {/* Date Selection for Availability */}
            <Label
              name="bookingDate"
              className="rw-label text-gray-700 font-semibold mt-4 mb-2"
              errorClassName="rw-label rw-label-error"
            >
              Select Date to Check Availability
            </Label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="rw-input w-full rounded-lg border-gray-300 shadow-sm focus:ring-red-500 focus:border-red-500"
              min={new Date().toISOString().split('T')[0]}
            />

            {/* Availability Display */}
            {selectedRoomId && selectedDate && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-2">
                  Room Availability for {selectedDate}
                </h3>
                {availabilityLoading ? (
                  <p className="text-gray-500">Checking availability...</p>
                ) : bookedSlots.length === 0 ? (
                  <p className="text-green-600 font-medium">✅ This room is available all day!</p>
                ) : (
                  <div>
                    <p className="text-amber-600 font-medium mb-2">⚠️ Already booked times:</p>
                    <div className="space-y-2">
                      {bookedSlots.map((slot) => (
                        <div key={slot.id} className="bg-red-50 border border-red-200 rounded p-2">
                          <div className="text-sm font-medium text-red-800">
                            {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                          </div>
                          <div className="text-xs text-red-600">
                            Booked by: {slot.user.name} ({slot.user.email})
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      💡 Choose a different time slot to avoid conflicts
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="col-span-2 flex justify-center mt-8">
            <Submit
              disabled={props.loading}
              className="rw-button rw-button-blue px-6 py-3 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition disabled:opacity-50"
            >
              {props.loading ? 'Saving...' : 'Save Booking'}
            </Submit>
          </div>

          {props.error && (
            <div className="col-span-2 mt-4">
              <FormError
                error={props.error}
                wrapperClassName="rw-form-error-wrapper"
                titleClassName="rw-form-error-title"
                listClassName="rw-form-error-list"
              />
            </div>
          )}
        </Form>
      </div>
    </div>
  )
}

export default BookingForm
