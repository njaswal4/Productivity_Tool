export const schema = gql`
  type AssetCategory {
    id: Int!
    name: String!
    description: String
    assets: [Asset]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Query {
    assetCategories: [AssetCategory!]! @requireAuth
    assetCategory(id: Int!): AssetCategory @requireAuth
  }

  input CreateAssetCategoryInput {
    name: String!
    description: String
  }

  input UpdateAssetCategoryInput {
    name: String
    description: String
  }

  type Mutation {
    createAssetCategory(input: CreateAssetCategoryInput!): AssetCategory!
      @requireAuth(roles: ["ADMIN"])
    updateAssetCategory(
      id: Int!
      input: UpdateAssetCategoryInput!
    ): AssetCategory! @requireAuth(roles: ["ADMIN"])
    deleteAssetCategory(id: Int!): AssetCategory! @requireAuth(roles: ["ADMIN"])
  }
`
