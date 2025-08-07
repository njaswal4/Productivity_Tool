export const schema = gql`
  type OfficeSupplyCategory {
    id: Int!
    name: String!
    description: String
    supplies: [OfficeSupply]!
  }

  type Query {
    officeSupplyCategories: [OfficeSupplyCategory!]! @requireAuth
    officeSupplyCategory(id: Int!): OfficeSupplyCategory @requireAuth
  }

  input CreateOfficeSupplyCategoryInput {
    name: String!
    description: String
  }

  input UpdateOfficeSupplyCategoryInput {
    name: String
    description: String
  }

  type Mutation {
    createOfficeSupplyCategory(
      input: CreateOfficeSupplyCategoryInput!
    ): OfficeSupplyCategory! @requireAuth
    updateOfficeSupplyCategory(
      id: Int!
      input: UpdateOfficeSupplyCategoryInput!
    ): OfficeSupplyCategory! @requireAuth
    deleteOfficeSupplyCategory(id: Int!): OfficeSupplyCategory! @requireAuth
  }
`
