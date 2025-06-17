import { db } from 'src/lib/db'

export const meetingRooms = () => {
  return db.meetingRoom.findMany()
}

export const meetingRoom = ({ id }) => {
  return db.meetingRoom.findUnique({
    where: { id },
  })
}

export const createMeetingRoom = ({ input }) => {
  return db.meetingRoom.create({
    data: input,
  })
}

export const updateMeetingRoom = ({ id, input }) => {
  return db.meetingRoom.update({
    where: { id },
    data: input,
  })
}

export const deleteMeetingRoom = ({ id }) => {
  return db.meetingRoom.delete({
    where: { id },
  })
}
