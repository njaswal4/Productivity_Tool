export const schema = gql`
  type VacationRequest {
    id: Int!
    user: User!
    userId: Int!
    startDate: DateTime!
    endDate: DateTime!
    reason: String!
    status: String!
    rejectionReason: String
    originalRequestId: Int
    originalRequest: VacationRequest
    resubmissions: [VacationRequest!]!
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
    originalRequestId: Int
  }

  input UpdateVacationRequestInput {
    startDate: DateTime
    endDate: DateTime
    reason: String
    status: String
    rejectionReason: String
  }

  input RejectVacationRequestInput {
    rejectionReason: String!
  }

  type Mutation {
    createVacationRequest(input: CreateVacationRequestInput!): VacationRequest! @requireAuth
    updateVacationRequest(id: Int!, input: UpdateVacationRequestInput!): VacationRequest! @requireAuth
    approveVacationRequest(id: Int!): VacationRequest! @requireAuth(roles: ["ADMIN"])
    rejectVacationRequest(id: Int!, input: RejectVacationRequestInput!): VacationRequest! @requireAuth(roles: ["ADMIN"])
    deleteVacationRequest(id: Int!): VacationRequest! @requireAuth
    resubmitVacationRequest(originalId: Int!, input: CreateVacationRequestInput!): VacationRequest! @requireAuth
  }
`
