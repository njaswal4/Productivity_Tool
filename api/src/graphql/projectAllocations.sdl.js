export const schema = gql`
  type ProjectAllocation {
    id: Int!
    projectId: Int!
    project: Project!
    userId: Int!
    user: User!
    allocatedDate: DateTime!
    role: String
    hoursAllocated: Float
    isActive: Boolean!
    allocatedBy: Int
    allocatedByUser: User
    dailyUpdates: [DailyProjectUpdate]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Query {
    projectAllocations: [ProjectAllocation!]! @requireAuth
    projectAllocation(id: Int!): ProjectAllocation @requireAuth
    activeProjectAllocations: [ProjectAllocation!]! @requireAuth
    allocationsByProject(projectId: Int!): [ProjectAllocation!]! @requireAuth
    allocationsByUser(userId: Int!): [ProjectAllocation!]! @requireAuth
    dailyAllocations(userId: Int!, date: DateTime!): [ProjectAllocation!]! @requireAuth
  }

  input CreateProjectAllocationInput {
    projectId: Int!
    userId: Int!
    role: String
    hoursAllocated: Float
    isActive: Boolean
    allocatedBy: Int
  }

  input UpdateProjectAllocationInput {
    role: String
    hoursAllocated: Float
    isActive: Boolean
  }

  type Mutation {
    createProjectAllocation(input: CreateProjectAllocationInput!): ProjectAllocation!
      @requireAuth(roles: ["ADMIN"])
    updateProjectAllocation(id: Int!, input: UpdateProjectAllocationInput!): ProjectAllocation!
      @requireAuth(roles: ["ADMIN"])
    deleteProjectAllocation(id: Int!): ProjectAllocation!
      @requireAuth(roles: ["ADMIN"])
    deactivateProjectAllocation(id: Int!): ProjectAllocation!
      @requireAuth(roles: ["ADMIN"])
  }
`
