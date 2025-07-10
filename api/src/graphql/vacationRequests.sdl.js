export const schema = gql`
  type VacationRequest {
    id: Int!
    user: User!
    userId: Int!
    startDate: DateTime!
    endDate: DateTime!
    reason: String!
    status: String!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Query {
    vacationRequests: [VacationRequest!]! @requireAuth
    vacationRequest(id: Int!): VacationRequest @requireAuth
    userVacationRequests: [VacationRequest!]! @requireAuth
  }

  input CreateVacationRequestInput {
    startDate: DateTime!
    endDate: DateTime!
    reason: String!
  }

  input UpdateVacationRequestInput {
    startDate: DateTime
    endDate: DateTime
    reason: String
    status: String
  }

  type Mutation {
    createVacationRequest(input: CreateVacationRequestInput!): VacationRequest! @requireAuth
    updateVacationRequest(id: Int!, input: UpdateVacationRequestInput!): VacationRequest! @requireAuth
    approveVacationRequest(id: Int!): VacationRequest! @requireAuth(roles: ["ADMIN"])
    rejectVacationRequest(id: Int!): VacationRequest! @requireAuth(roles: ["ADMIN"])
    deleteVacationRequest(id: Int!): VacationRequest! @requireAuth
  }
`
