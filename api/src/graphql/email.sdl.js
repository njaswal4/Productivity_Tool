export const schema = gql`
  type TestEmailResult {
    success: Boolean!
    message: String
    error: String
  }

  type Mutation {
    testEmail(email: String!): TestEmailResult! @requireAuth(roles: ["ADMIN"])
  }
`
