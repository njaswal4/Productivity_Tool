export const schema = gql`
  enum Role {
    USER
    ADMIN
  }

  type User {
    id: Int!
    name: String!
    email: String!
    roles: [Role!]!
    bookings: [Booking]!
    exceptionRequests: [ExceptionRequest!]!
    attendancesInRange(start: DateTime!, end: DateTime!): [Attendance!]!
    attendances: [Attendance!]!
    selectedMeetingRoom: MeetingRoom
  }

  input UpdateUserInput {
    name: String
    email: String
    selectedMeetingRoomId: Int
    roles: [Role!]
  }

  type Query {
    users: [User!]! @requireAuth
    user(id: Int!): User @requireAuth
  }

  type Mutation {
    createUser(input: CreateUserInput!): User! @requireAuth
    updateUser(id: Int!, input: UpdateUserInput!): User! @requireAuth
    deleteUser(id: Int!): User! @requireAuth
    updateUserRoles(id: Int!, roles: [Role!]!): User! @requireAuth(roles: ["ADMIN"])
  }

  input CreateUserInput {
    name: String!
    email: String!
    roles: [Role!]
  }
`
