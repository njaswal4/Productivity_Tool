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

const BookingForm = (props) => {
  const { data, loading, error } = useQuery(GET_MEETING_ROOMS)

  const onSubmit = (data) => {
    props.onSave(data, props?.booking?.id)
  }

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
          </div>

          <div className="col-span-2 flex justify-center mt-8">
            <Submit
              disabled={props.loading}
              className="rw-button rw-button-blue px-6 py-3 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition"
            >
              Save
            </Submit>
          </div>
        </Form>
      </div>
    </div>
  )
}

export default BookingForm
