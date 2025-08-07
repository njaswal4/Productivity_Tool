export const schema = gql`
  type OfficeSupply {
    id: Int!
    name: String!
    description: String
    stockCount: Int!
    unitPrice: Float!
    categoryId: Int!
    category: OfficeSupplyCategory!
    createdAt: DateTime!
    updatedAt: DateTime!
    requests: [SupplyRequest]!
  }

  type Query {
    officeSupplies: [OfficeSupply!]! @requireAuth
    officeSupply(id: Int!): OfficeSupply @requireAuth
  }

  input CreateOfficeSupplyInput {
    name: String!
    description: String
    stockCount: Int!
    unitPrice: Float!
    categoryId: Int!
  }

  input UpdateOfficeSupplyInput {
    name: String
    description: String
    stockCount: Int
    unitPrice: Float
    categoryId: Int
  }

  type Mutation {
    createOfficeSupply(input: CreateOfficeSupplyInput!): OfficeSupply!
      @requireAuth
    updateOfficeSupply(
      id: Int!
      input: UpdateOfficeSupplyInput!
    ): OfficeSupply! @requireAuth
    deleteOfficeSupply(id: Int!): OfficeSupply! @requireAuth
  }
`
