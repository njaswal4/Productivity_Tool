export const schema = gql`
  type SupplyRequest {
    id: Int!
    quantityRequested: Int!
    justification: String!
    urgency: String!
    status: String!
    approvedAt: DateTime
    approverNotes: String
    totalCost: Float
    isOverdue: Boolean!
    userId: Int!
    user: User!
    supplyId: Int!
    supply: OfficeSupply!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Query {
    supplyRequests: [SupplyRequest!]! @requireAuth
    supplyRequest(id: Int!): SupplyRequest @requireAuth
    mySupplyRequests: [SupplyRequest!]! @requireAuth
    pendingSupplyRequests: [SupplyRequest!]! @requireAuth
  }

  input CreateSupplyRequestInput {
    quantityRequested: Int!
    justification: String!
    urgency: String!
    supplyId: Int!
  }

  input UpdateSupplyRequestInput {
    quantityRequested: Int
    justification: String
    urgency: String
    status: String
    approverNotes: String
    supplyId: Int
  }

  type Mutation {
    createSupplyRequest(input: CreateSupplyRequestInput!): SupplyRequest!
      @requireAuth
    updateSupplyRequest(
      id: Int!
      input: UpdateSupplyRequestInput!
    ): SupplyRequest! @requireAuth
    deleteSupplyRequest(id: Int!): SupplyRequest! @requireAuth
    fulfillSupplyRequest(id: Int!): SupplyRequest! @requireAuth
    approveSupplyRequest(id: Int!, approverNotes: String): SupplyRequest! @requireAuth
    rejectSupplyRequest(id: Int!, approverNotes: String!): SupplyRequest! @requireAuth
  }
`
