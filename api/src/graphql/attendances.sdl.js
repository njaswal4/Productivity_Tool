export const schema = gql`
  type Attendance {
    id: Int!
    userId: Int!
    user: User!
    date: DateTime!
    clockIn: DateTime
    clockOut: DateTime
    duration: String
    status: String!
    location: String
    breaks: [AttendanceBreak!]!
  }

  type Query {
    attendances(userId: Int, date: DateTime): [Attendance!]! @requireAuth
    attendance(id: Int!): Attendance @requireAuth
    attendancesInRange(userId: Int!, start: DateTime!, end: DateTime!): [Attendance!]! @requireAuth
  }

  input CreateAttendanceInput {
    userId: Int!
    date: DateTime!
    clockIn: DateTime
    clockOut: DateTime
    duration: String
    status: String!
    location: String
  }

  input UpdateAttendanceInput {
    userId: Int
    date: DateTime
    clockIn: DateTime
    clockOut: DateTime
    duration: String
    status: String
    location: String
  }

  type Mutation {
    createAttendance(input: CreateAttendanceInput!): Attendance! @requireAuth
    updateAttendance(id: Int!, input: UpdateAttendanceInput!): Attendance! @requireAuth
    deleteAttendance(id: Int!): Attendance! @requireAuth
  }
`
