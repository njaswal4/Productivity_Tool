export const schema = gql`
  type ExceptionRequest {
    id: Int!
    userId: Int!
    user: User!
    type: String!
    reason: String!
    date: DateTime!
    status: String!
    createdAt: DateTime!
  }

  type Query {
    exceptionRequests(userId: Int): [ExceptionRequest!]! @requireAuth
  }

  input CreateExceptionRequestInput {
    userId: Int!
    type: String!
    reason: String!
    date: DateTime!
    status: String!
  }

  input UpdateExceptionRequestInput {
    userId: Int
    type: String
    reason: String
    date: DateTime
    status: String
  }

  type Mutation {
    createExceptionRequest(
      input: CreateExceptionRequestInput!
    ): ExceptionRequest! @requireAuth
    updateExceptionRequest(
      id: Int!
      input: UpdateExceptionRequestInput!
    ): ExceptionRequest! @requireAuth
    deleteExceptionRequest(id: Int!): ExceptionRequest! @requireAuth
  }
`
