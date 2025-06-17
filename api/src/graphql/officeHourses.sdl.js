export const schema = gql`
  type OfficeHours {
    id: Int!
    startTime: String!
    endTime: String!
    updatedAt: DateTime!
  }

  type Query {
    officeHourses: [OfficeHours!]! @requireAuth
    officeHours(id: Int!): OfficeHours @requireAuth
  }

  input CreateOfficeHoursInput {
    startTime: String!
    endTime: String!
  }

  input UpdateOfficeHoursInput {
    startTime: String
    endTime: String
  }

  type Mutation {
    createOfficeHours(input: CreateOfficeHoursInput!): OfficeHours! @requireAuth
    updateOfficeHours(id: Int!, input: UpdateOfficeHoursInput!): OfficeHours!
      @requireAuth
    deleteOfficeHours(id: Int!): OfficeHours! @requireAuth
  }
`
