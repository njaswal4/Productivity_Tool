export const schema = gql`
  type Booking {
    id: Int!
    title: String!
    notes: String
    startTime: DateTime!
    endTime: DateTime!
    userId: Int!
    user: User!
    meetingRoomId: Int
    meetingRoom: MeetingRoom
    createdAt: DateTime!
  }
type MeetingRoom {
  id: Int!
  name: String!
  bookings: [Booking!]!
}
  type Query {
    bookings(userId: Int): [Booking!]! @requireAuth
  }

  input CreateBookingInput {
    title: String!
    notes: String
    startTime: DateTime!
    endTime: DateTime!
    userId: Int!
    meetingRoomId: Int
  }

  input UpdateBookingInput {
    title: String
    notes: String
    startTime: DateTime
    endTime: DateTime
    userId: Int
    meetingRoomId: Int
  }

  type Mutation {
    createBooking(input: CreateBookingInput!): Booking! @requireAuth
    updateBooking(id: Int!, input: UpdateBookingInput!): Booking! @requireAuth
    deleteBooking(id: Int!): Booking! @requireAuth
  }
`
