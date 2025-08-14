export const schema = gql`
  type AssetAssignment {
    id: Int!
    assetId: Int!
    asset: Asset!
    userId: Int!
    user: User!
    issueDate: DateTime!
    returnDate: DateTime
    expectedReturnDate: DateTime
    department: String
    issuedBy: String
    returnedBy: String
    issueNotes: String
    returnNotes: String
    condition: String
    status: String!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type AssetAssignmentReport {
    totalAssignments: Int!
    activeAssignments: Int!
    returnedAssignments: Int!
    overdueAssignments: Int!
    assignments: [AssetAssignment!]!
    assetsByCategory: [AssetCategoryStats!]!
    monthlyStats: [MonthlyAssetStats!]!
  }

  type AssetCategoryStats {
    categoryName: String!
    count: Int!
    activeCount: Int!
    returnedCount: Int!
  }

  type MonthlyAssetStats {
    month: String!
    year: Int!
    assignedCount: Int!
    returnedCount: Int!
  }

  type Query {
    assetAssignments: [AssetAssignment!]! @requireAuth
    assetAssignment(id: Int!): AssetAssignment @requireAuth
    activeAssetAssignments: [AssetAssignment!]! @requireAuth
    myAssetAssignments: [AssetAssignment!]! @requireAuth
    myAssetAssignmentReport(startDate: DateTime, endDate: DateTime): AssetAssignmentReport! @requireAuth
    allUsersAssetReport(startDate: DateTime, endDate: DateTime): AssetAssignmentReport! @requireAuth(roles: ["ADMIN"])
    assetAssignmentsByUser(userId: Int!): [AssetAssignment!]! @requireAuth
    assetAssignmentsByAsset(assetId: Int!): [AssetAssignment!]! @requireAuth
    assetHistory(assetId: Int!): [AssetAssignment!]! @requireAuth
  }

  input CreateAssetAssignmentInput {
    assetId: Int!
    userId: Int!
    expectedReturnDate: DateTime
    department: String
    issuedBy: String
    issueNotes: String
    condition: String
  }

  input UpdateAssetAssignmentInput {
    returnDate: DateTime
    expectedReturnDate: DateTime
    returnedBy: String
    returnNotes: String
    condition: String
    status: String
  }

  input ReturnAssetInput {
    returnedBy: String!
    returnNotes: String
    condition: String!
  }

  type Mutation {
    createAssetAssignment(input: CreateAssetAssignmentInput!): AssetAssignment!
      @requireAuth(roles: ["ADMIN"])
    updateAssetAssignment(
      id: Int!
      input: UpdateAssetAssignmentInput!
    ): AssetAssignment! @requireAuth(roles: ["ADMIN"])
    returnAsset(
      assignmentId: Int!
      input: ReturnAssetInput!
    ): AssetAssignment! @requireAuth
    deleteAssetAssignment(id: Int!): AssetAssignment!
      @requireAuth(roles: ["ADMIN"])
  }
`
