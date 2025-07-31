export const schema = gql`
  type AssetRequest {
    id: Int!
    userId: Int!
    user: User!
    assetCategoryId: Int
    assetCategory: AssetCategory
    specificAssetId: Int
    specificAsset: Asset
    reason: String!
    urgency: String!
    expectedDuration: String
    status: String!
    approvedBy: String
    approvedAt: DateTime
    rejectionReason: String
    fulfillmentNotes: String
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Query {
    assetRequests: [AssetRequest!]! @requireAuth
    assetRequest(id: Int!): AssetRequest @requireAuth
    myAssetRequests: [AssetRequest!]! @requireAuth
    pendingAssetRequests: [AssetRequest!]! @requireAuth(roles: ["ADMIN"])
  }

  input CreateAssetRequestInput {
    assetCategoryId: Int
    specificAssetId: Int
    reason: String!
    urgency: String!
    expectedDuration: String
  }

  input UpdateAssetRequestInput {
    assetCategoryId: Int
    specificAssetId: Int
    reason: String
    urgency: String
    expectedDuration: String
    status: String
    approvedBy: String
    approvedAt: DateTime
    rejectionReason: String
    fulfillmentNotes: String
  }

  input ApproveAssetRequestInput {
    assignAssetId: Int
    fulfillmentNotes: String
  }

  input RejectAssetRequestInput {
    rejectionReason: String!
  }

  type Mutation {
    createAssetRequest(input: CreateAssetRequestInput!): AssetRequest! @requireAuth
    updateAssetRequest(id: Int!, input: UpdateAssetRequestInput!): AssetRequest! @requireAuth
    deleteAssetRequest(id: Int!): AssetRequest! @requireAuth
    approveAssetRequest(id: Int!, input: ApproveAssetRequestInput!): AssetRequest! @requireAuth(roles: ["ADMIN"])
    rejectAssetRequest(id: Int!, input: RejectAssetRequestInput!): AssetRequest! @requireAuth(roles: ["ADMIN"])
  }
`
