export const schema = gql`
  type TestNotificationResult {
    success: Boolean!
    message: String!
  }

  type Mutation {
    testAdminNotification(type: String!, testData: String!): TestNotificationResult!
      @requireAuth(roles: ["ADMIN"])
  }
`
