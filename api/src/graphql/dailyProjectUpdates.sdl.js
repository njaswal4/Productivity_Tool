export const schema = gql`
  type DailyProjectUpdate {
    id: Int!
    allocationId: Int!
    allocation: ProjectAllocation!
    projectId: Int!
    project: Project!
    date: DateTime!
    status: String!
    description: String!
    hoursWorked: Float
    blockers: String
    nextDayPlan: String
    completionPercentage: Float
    milestoneReached: String
    meetingsAttended: [Int]!
    user: User!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Query {
    dailyProjectUpdates(startDate: DateTime, endDate: DateTime): [DailyProjectUpdate!]! @requireAuth
    dailyProjectUpdate(id: Int!): DailyProjectUpdate @requireAuth
    updatesByAllocation(allocationId: Int!): [DailyProjectUpdate!]! @requireAuth
    updatesByProject(projectId: Int!): [DailyProjectUpdate!]! @requireAuth
    updatesByUser(userId: Int!): [DailyProjectUpdate!]! @requireAuth
    updatesByDate(date: DateTime!): [DailyProjectUpdate!]! @requireAuth
    userUpdatesForDate(userId: Int!, date: DateTime!): [DailyProjectUpdate!]! @requireAuth
    projectUpdatesForDate(projectId: Int!, date: DateTime!): [DailyProjectUpdate!]! @requireAuth
  }

  input CreateDailyProjectUpdateInput {
    allocationId: Int!
    projectId: Int!
    date: DateTime
    description: String!
    hoursWorked: Float
    blockers: String
    nextDayPlan: String
    completionPercentage: Float
    milestoneReached: String
    meetingsAttended: [Int]
  }

  input UpdateDailyProjectUpdateInput {
    description: String
    hoursWorked: Float
    blockers: String
    nextDayPlan: String
    completionPercentage: Float
    milestoneReached: String
    meetingsAttended: [Int]
  }

  type Mutation {
    createDailyProjectUpdate(input: CreateDailyProjectUpdateInput!): DailyProjectUpdate!
      @requireAuth
    updateDailyProjectUpdate(id: Int!, input: UpdateDailyProjectUpdateInput!): DailyProjectUpdate!
      @requireAuth
    deleteDailyProjectUpdate(id: Int!): DailyProjectUpdate!
      @requireAuth
  }
`
