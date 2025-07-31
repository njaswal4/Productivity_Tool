export const schema = gql`
  type ProjectMeeting {
    id: Int!
    title: String!
    description: String
    meetingDate: DateTime!
    duration: Int!
    location: String
    meetingType: String!
    projectId: Int!
    project: Project!
    organizerId: Int
    organizer: User
    status: String!
    isRecurring: Boolean!
    attendeeIds: [Int]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Query {
    projectMeetings: [ProjectMeeting!]! @requireAuth
    projectMeeting(id: Int!): ProjectMeeting @requireAuth
    meetingsByProject(projectId: Int!): [ProjectMeeting!]! @requireAuth
    upcomingMeetings(userId: Int!): [ProjectMeeting!]! @requireAuth
    todaysMeetings(userId: Int!): [ProjectMeeting!]! @requireAuth
    meetingsByDateRange(startDate: DateTime!, endDate: DateTime!): [ProjectMeeting!]! @requireAuth
  }

  input CreateProjectMeetingInput {
    title: String!
    description: String
    meetingDate: DateTime!
    duration: Int!
    location: String
    meetingType: String
    projectId: Int!
    organizerId: Int
    isRecurring: Boolean
    attendeeIds: [Int]
  }

  input UpdateProjectMeetingInput {
    title: String
    description: String
    meetingDate: DateTime
    duration: Int
    location: String
    meetingType: String
    status: String
    isRecurring: Boolean
    attendeeIds: [Int]
  }

  type Mutation {
    createProjectMeeting(input: CreateProjectMeetingInput!): ProjectMeeting!
      @requireAuth
    updateProjectMeeting(id: Int!, input: UpdateProjectMeetingInput!): ProjectMeeting!
      @requireAuth
    deleteProjectMeeting(id: Int!): ProjectMeeting!
      @requireAuth(roles: ["ADMIN"])
    markMeetingCompleted(id: Int!): ProjectMeeting!
      @requireAuth
    cancelMeeting(id: Int!): ProjectMeeting!
      @requireAuth
  }
`
