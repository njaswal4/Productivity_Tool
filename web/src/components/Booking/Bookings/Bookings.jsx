import { Link, routes } from '@redwoodjs/router'
import { useMutation } from '@redwoodjs/web'

import { toast } from '@redwoodjs/web/toast'

import { QUERY } from 'src/components/Booking/BookingsCell'
import { timeTag, truncate } from 'src/lib/formatters'

const DELETE_BOOKING_MUTATION = gql`
  mutation DeleteBookingMutation($id: Int!) {
    deleteBooking(id: $id) {
      id
    }
  }
`

const BookingsList = ({ bookings }) => {
  const [deleteBooking] = useMutation(DELETE_BOOKING_MUTATION, {
    onCompleted: () => {
      toast.success('Booking deleted')
    },
    onError: (error) => {
      toast.error(error.message)
    },
    // This refetches the query on the list page. Read more about other ways to
    // update the cache over here:
    // https://www.apollographql.com/docs/react/data/mutations/#making-all-other-cache-updates
    refetchQueries: [{ query: QUERY }],
    awaitRefetchQueries: true,
  })

  const onDeleteClick = (id) => {
    if (confirm('Are you sure you want to delete booking ' + id + '?')) {
      deleteBooking({ variables: { id } })
    }
  }

  return (
    <div className="rw-segment rw-table-wrapper-responsive">
      <table className="rw-table">
        <thead>
          <tr>
            <th>Id</th>
            <th>Title</th>
            <th>Notes</th>
            <th>Start time</th>
            <th>End time</th>
            <th>User id</th>
            <th>Created at</th>
            <th>&nbsp;</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking.id}>
              <td>{truncate(booking.id)}</td>
              <td>{truncate(booking.title)}</td>
              <td>{truncate(booking.notes)}</td>
              <td>{timeTag(booking.startTime)}</td>
              <td>{timeTag(booking.endTime)}</td>
              <td>{truncate(booking.userId)}</td>
              <td>{timeTag(booking.createdAt)}</td>
              <td>
                <nav className="rw-table-actions">
                  <Link
                    to={routes.booking({ id: booking.id })}
                    title={'Show booking ' + booking.id + ' detail'}
                    className="rw-button rw-button-small"
                  >
                    Show
                  </Link>
                  <Link
                    to={routes.editBooking({ id: booking.id })}
                    title={'Edit booking ' + booking.id}
                    className="rw-button rw-button-small rw-button-blue"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    title={'Delete booking ' + booking.id}
                    className="rw-button rw-button-small rw-button-red"
                    onClick={() => onDeleteClick(booking.id)}
                  >
                    Delete
                  </button>
                </nav>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default BookingsList
