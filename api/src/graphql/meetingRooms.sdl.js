import { gql } from '@redwoodjs/graphql-server'

export const schema = gql`
  type MeetingRoom {
    id: Int!
    name: String!
    description: String
    bookings: [Booking!]!
  }

  type Query {
    meetingRooms: [MeetingRoom!]! @requireAuth
    meetingRoom(id: Int!): MeetingRoom @requireAuth
  }

  input CreateMeetingRoomInput {
    name: String!
    description: String
  }

  input UpdateMeetingRoomInput {
    name: String
    description: String
  }

  type Mutation {
    createMeetingRoom(input: CreateMeetingRoomInput!): MeetingRoom! @requireAuth
    updateMeetingRoom(id: Int!, input: UpdateMeetingRoomInput!): MeetingRoom! @requireAuth
    deleteMeetingRoom(id: Int!): MeetingRoom! @requireAuth
  }
`
