export const schema = gql`
  enum Role {
    USER
    ADMIN
  }

  enum Department {
    ENGINEERING
    DESIGN
    MARKETING
    SALES
    HR
    FINANCE
    OPERATIONS
    CUSTOMER_SUCCESS
    PRODUCT
    LEGAL
  }

  enum Designation {
    JUNIOR_DEVELOPER
    SENIOR_DEVELOPER
    LEAD_DEVELOPER
    ARCHITECT
    DESIGNER
    SENIOR_DESIGNER
    MARKETING_SPECIALIST
    SALES_REPRESENTATIVE
    HR_SPECIALIST
    ACCOUNTANT
    PROJECT_MANAGER
    PRODUCT_MANAGER
  }

  type User {
    id: Int!
    email: String!
    name: String
    microsoftId: String
    roles: [String]!
    createdAt: DateTime
    updatedAt: DateTime
    bookings: [Booking]!
    exceptionRequests: [ExceptionRequest!]!
    attendancesInRange(start: DateTime!, end: DateTime!): [Attendance!]!
    attendances: [Attendance!]!
    selectedMeetingRoom: MeetingRoom
    assetAssignments: [AssetAssignment!]!
    vacationRequests: [VacationRequest!]!
    
    # Employee Management Fields
    employeeId: String
    department: Department
    designation: Designation
    dateOfJoining: DateTime
    reportingManagerId: Int
    reportingManagerUser: User
    directReports: [User!]!
    
    # Project Allocations
    projectAllocations: [ProjectAllocation!]!
    managedProjects: [Project!]!
  }

  input CreateUserInput {
    email: String!
    name: String
    microsoftId: String
    roles: [Role!]
    employeeId: String
    department: Department
    designation: Designation
    dateOfJoining: DateTime
    reportingManagerId: Int
  }

  input UpdateUserInput {
    email: String
    name: String
    microsoftId: String
    roles: [Role!]
    selectedMeetingRoomId: Int
    employeeId: String
    department: Department
    designation: Designation
    dateOfJoining: DateTime
    reportingManagerId: Int
  }

  input UpsertUserInput {
    email: String!
    name: String
    microsoftId: String
    roles: [String]
  }

  type Query {
    users: [User!]! @requireAuth
    user(id: Int!): User @requireAuth
    userByEmail(email: String!): User @requireAuth
    userByMicrosoftId(microsoftId: String!): User @requireAuth
    currentUser: User @requireAuth
  }

  type Mutation {
    createUser(input: CreateUserInput!): User! @requireAuth
    updateUser(id: Int!, input: UpdateUserInput!): User! @requireAuth
    deleteUser(id: Int!): User! @requireAuth
    upsertUser(input: UpsertUserInput!): User! @requireAuth
    updateUserRoles(id: Int!, roles: [Role!]!): User! @requireAuth
  }
`
