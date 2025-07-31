export const schema = gql`
  type Project {
    id: Int!
    name: String!
    description: String
    code: String!
    status: String!
    priority: String!
    startDate: DateTime!
    endDate: DateTime
    estimatedHours: Float
    budget: Float
    managerId: Int
    manager: User
    allocations: [ProjectAllocation]!
    meetings: [ProjectMeeting]!
    dailyUpdates: [DailyProjectUpdate]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Query {
    projects: [Project!]! @requireAuth
    project(id: Int!): Project @requireAuth
    activeProjects: [Project!]! @requireAuth
    projectsByManager(managerId: Int!): [Project!]! @requireAuth
    projectsWithUserAllocations(userId: Int!): [Project!]! @requireAuth
  }

  input CreateProjectInput {
    name: String!
    description: String
    code: String!
    status: String
    priority: String
    startDate: DateTime!
    endDate: DateTime
    estimatedHours: Float
    budget: Float
    managerId: Int
  }

  input UpdateProjectInput {
    name: String
    description: String
    code: String
    status: String
    priority: String
    startDate: DateTime
    endDate: DateTime
    estimatedHours: Float
    budget: Float
    managerId: Int
  }

  type Mutation {
    createProject(input: CreateProjectInput!): Project!
      @requireAuth(roles: ["ADMIN"])
    updateProject(id: Int!, input: UpdateProjectInput!): Project!
      @requireAuth(roles: ["ADMIN"])
    deleteProject(id: Int!): Project! @requireAuth(roles: ["ADMIN"])
  }
`
