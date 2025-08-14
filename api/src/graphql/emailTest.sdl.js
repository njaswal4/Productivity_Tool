export const schema = gql`
  type EmailTestResult {
    success: Boolean!
    message: String
    error: String
    messageId: String
    provider: String
    timestamp: DateTime
    deliveryTips: String
    domainInfo: String
  }

  type Query {
    testEmailDelivery(recipientEmail: String!): EmailTestResult! @skipAuth
  }

  type Mutation {
    sendOutlookTestEmail(recipientEmail: String!): EmailTestResult! @skipAuth
    validateEmailProvider(email: String!): EmailTestResult! @skipAuth
    sendCustomDomainTest(recipientEmail: String!): EmailTestResult! @skipAuth
  }
`
