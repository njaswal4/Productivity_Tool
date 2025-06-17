export const schema = gql`
  type OvertimeBreak {
    id: Int!
    overtime: OvertimeAttendance!
    overtimeId: Int!
    breakIn: DateTime!
    breakOut: DateTime
    duration: String
  }

  type Query {
    overtimeBreaks: [OvertimeBreak!]! @requireAuth
    overtimeBreak(id: Int!): OvertimeBreak @requireAuth
  }

  input CreateOvertimeBreakInput {
    overtimeId: Int!
    breakIn: DateTime!
    breakOut: DateTime
    duration: String
  }

  input UpdateOvertimeBreakInput {
    overtimeId: Int
    breakIn: DateTime
    breakOut: DateTime
    duration: String
  }

  type Mutation {
    createOvertimeBreak(input: CreateOvertimeBreakInput!): OvertimeBreak!
      @requireAuth
    updateOvertimeBreak(
      id: Int!
      input: UpdateOvertimeBreakInput!
    ): OvertimeBreak! @requireAuth
    deleteOvertimeBreak(id: Int!): OvertimeBreak! @requireAuth
  }
`
