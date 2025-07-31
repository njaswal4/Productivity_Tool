import { navigate, routes } from '@redwoodjs/router'

import { useMutation } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

import BookingForm from 'src/components/Booking/BookingForm'

export const QUERY = gql`
  query EditBookingById($id: Int!) {
    booking: booking(id: $id) {
      id
      title
      notes
      startTime
      endTime
      userId
      createdAt
    }
  }
`

const UPDATE_BOOKING_MUTATION = gql`
  mutation UpdateBookingMutation($id: Int!, $input: UpdateBookingInput!) {
    updateBooking(id: $id, input: $input) {
      id
      title
      notes
      startTime
      endTime
      userId
      createdAt
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Failure = ({ error }) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ booking }) => {
  const [updateBooking, { loading, error }] = useMutation(
    UPDATE_BOOKING_MUTATION,
    {
      onCompleted: () => {
        toast.success('Booking updated')
        // Notify other components about the update
        window.dispatchEvent(new Event('bookingsUpdated'))
        window.localStorage.setItem('bookingsUpdated', Date.now())
        navigate(routes.bookings())
      },
      onError: (error) => {
        toast.error(error.message)
      },
    }
  )

  const onSave = (input, id) => {
    updateBooking({ variables: { id, input } })
  }

  return (
    <div className="rw-segment">
      <header className="rw-segment-header">
        <h2 className="rw-heading rw-heading-secondary">
          Edit Booking {booking?.id}
        </h2>
      </header>
      <div className="rw-segment-main">
        <BookingForm
          booking={booking}
          onSave={onSave}
          error={error}
          loading={loading}
        />
      </div>
    </div>
  )
}
