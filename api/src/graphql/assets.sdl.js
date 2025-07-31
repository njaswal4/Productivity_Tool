export const schema = gql`
  type Asset {
    id: Int!
    assetId: String!
    name: String!
    model: String!
    serialNumber: String
    purchaseDate: DateTime!
    warrantyExpiry: DateTime
    purchasePrice: Float
    vendor: String
    status: String!
    condition: String!
    location: String
    notes: String
    proofOfPurchaseUrl: String
    proofOfPurchaseType: String
    proofOfPurchaseFileName: String
    categoryId: Int!
    category: AssetCategory!
    assignments: [AssetAssignment]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Query {
    assets: [Asset!]! @requireAuth
    asset(id: Int!): Asset @requireAuth
    assetByAssetId(assetId: String!): Asset @requireAuth
    availableAssets: [Asset!]! @requireAuth(roles: ["ADMIN"])
    assetsByCategory(categoryId: Int!): [Asset!]! @requireAuth
    assetsByUser(userId: Int!): [Asset!]! @requireAuth
  }

  input CreateAssetInput {
    assetId: String!
    name: String!
    model: String!
    serialNumber: String
    purchaseDate: DateTime!
    warrantyExpiry: DateTime
    purchasePrice: Float
    vendor: String
    status: String
    condition: String
    location: String
    notes: String
    proofOfPurchaseUrl: String
    proofOfPurchaseType: String
    proofOfPurchaseFileName: String
    categoryId: Int!
  }

  input UpdateAssetInput {
    assetId: String
    name: String
    model: String
    serialNumber: String
    purchaseDate: DateTime
    warrantyExpiry: DateTime
    purchasePrice: Float
    vendor: String
    status: String
    condition: String
    location: String
    notes: String
    proofOfPurchaseUrl: String
    proofOfPurchaseType: String
    proofOfPurchaseFileName: String
    categoryId: Int
  }

  type Mutation {
    createAsset(input: CreateAssetInput!): Asset! @requireAuth(roles: ["ADMIN"])
    updateAsset(id: Int!, input: UpdateAssetInput!): Asset!
      @requireAuth(roles: ["ADMIN"])
    deleteAsset(id: Int!): Asset! @requireAuth(roles: ["ADMIN"])
  }
`
