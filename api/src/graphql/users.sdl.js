export const schema = gql`
  enum Role {
    USER
    ADMIN
  }

  type User {
    id: Int!
    email: String!
    name: String
    microsoftId: String
    roles: [String]!
    createdAt: DateTime
    updatedAt: DateTime
    bookings: [Booking]!
    exceptionRequests: [ExceptionRequest!]!
    attendancesInRange(start: DateTime!, end: DateTime!): [Attendance!]!
    attendances: [Attendance!]!
    selectedMeetingRoom: MeetingRoom
    assetAssignments: [AssetAssignment!]!
    vacationRequests: [VacationRequest!]!
  }

  input CreateUserInput {
    email: String!
    name: String
    microsoftId: String
    roles: [Role!]
  }

  input UpdateUserInput {
    email: String
    name: String
    microsoftId: String
    roles: [Role!]
    selectedMeetingRoomId: Int
  }

  input UpsertUserInput {
    email: String!
    name: String
    microsoftId: String
    roles: [String]
  }

  type Query {
    users: [User!]! @requireAuth
    user(id: Int!): User @requireAuth
    userByEmail(email: String!): User @requireAuth
    userByMicrosoftId(microsoftId: String!): User @requireAuth
    currentUser: User @requireAuth
  }

  type Mutation {
    createUser(input: CreateUserInput!): User! @requireAuth
    updateUser(id: Int!, input: UpdateUserInput!): User! @requireAuth
    deleteUser(id: Int!): User! @requireAuth
    upsertUser(input: UpsertUserInput!): User! @requireAuth
    updateUserRoles(id: Int!, roles: [Role!]!): User! @requireAuth
  }
`
