export const schema = gql`
  type User {
    id: Int!
    name: String!
    email: String!
    bookings: [Booking]!
    exceptionRequests: [ExceptionRequest!]!
    attendancesInRange(start: DateTime!, end: DateTime!): [Attendance!]!
     attendances: [Attendance!]!
  }

  type Query {
    users: [User!]! @requireAuth
    user(id: Int!): User @requireAuth
  }

  input CreateUserInput {
    name: String!
    email: String!
  }

  input UpdateUserInput {
    name: String
    email: String
  }

  type Mutation {
    createUser(input: CreateUserInput!): User! @requireAuth
    updateUser(id: Int!, input: UpdateUserInput!): User! @requireAuth
    deleteUser(id: Int!): User! @requireAuth
  }
`
