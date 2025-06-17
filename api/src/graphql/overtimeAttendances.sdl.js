export const schema = gql`
  type OvertimeAttendance {
    id: Int!
    userId: Int!
    user: User!
    date: DateTime!
    clockIn: DateTime
    clockOut: DateTime
    duration: String
    breaks: [OvertimeBreak]!
  }

  type Query {
    overtimeAttendances: [OvertimeAttendance!]! @requireAuth
    overtimeAttendance(id: Int!): OvertimeAttendance @requireAuth
  }

  input CreateOvertimeAttendanceInput {
    userId: Int!
    date: DateTime!
    clockIn: DateTime
    clockOut: DateTime
    duration: String
  }

  input UpdateOvertimeAttendanceInput {
    userId: Int
    date: DateTime
    clockIn: DateTime
    clockOut: DateTime
    duration: String
  }

  type Mutation {
    createOvertimeAttendance(
      input: CreateOvertimeAttendanceInput!
    ): OvertimeAttendance! @requireAuth
    updateOvertimeAttendance(
      id: Int!
      input: UpdateOvertimeAttendanceInput!
    ): OvertimeAttendance! @requireAuth
    deleteOvertimeAttendance(id: Int!): OvertimeAttendance! @requireAuth
  }
`
