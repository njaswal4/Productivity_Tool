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
    updatedAt: DateTime!
  }

  type MeetingRoom {
    id: Int!
    name: String!
    bookings: [Booking!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Query {
    bookings(userId: Int): [Booking!]! @requireAuth  # Back to @requireAuth
    booking(id: Int!): Booking @requireAuth
    meetingRooms: [MeetingRoom!]! @requireAuth
    meetingRoom(id: Int!): MeetingRoom @requireAuth
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
