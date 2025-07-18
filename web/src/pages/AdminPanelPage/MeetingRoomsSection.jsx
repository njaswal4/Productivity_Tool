import React, { useState } from 'react'
import { useQuery, useMutation, gql } from '@apollo/client'

const MEETING_ROOMS_QUERY = gql`
  query MeetingRooms {
    meetingRooms {
      id
      name
      description
    }
  }
`
const CREATE_MEETING_ROOM_MUTATION = gql`
  mutation CreateMeetingRoom($input: CreateMeetingRoomInput!) {
    createMeetingRoom(input: $input) {
      id
      name
      description
    }
  }
`
const UPDATE_MEETING_ROOM_MUTATION = gql`
  mutation UpdateMeetingRoom($id: Int!, $input: UpdateMeetingRoomInput!) {
    updateMeetingRoom(id: $id, input: $input) {
      id
      name
      description
    }
  }
`
const DELETE_MEETING_ROOM_MUTATION = gql`
  mutation DeleteMeetingRoom($id: Int!) {
    deleteMeetingRoom(id: $id) {
      id
    }
  }
`

const MeetingRoomsSection = () => {
  const { data, loading, error, refetch } = useQuery(MEETING_ROOMS_QUERY)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [editingRoom, setEditingRoom] = useState(null)

  const [createMeetingRoom] = useMutation(CREATE_MEETING_ROOM_MUTATION, {
    onCompleted: () => {
      refetch()
      setName('')
      setDescription('')
      setEditingRoom(null)
      window.dispatchEvent(new Event('meetingRoomsUpdated'))
      window.localStorage.setItem('meetingRoomsUpdated', Date.now())
    },
  })
  const [updateMeetingRoom] = useMutation(UPDATE_MEETING_ROOM_MUTATION, {
    onCompleted: () => {
      refetch()
      setName('')
      setDescription('')
      setEditingRoom(null)
      window.dispatchEvent(new Event('meetingRoomsUpdated'))
      window.localStorage.setItem('meetingRoomsUpdated', Date.now())
    },
  })
  const [deleteMeetingRoom] = useMutation(DELETE_MEETING_ROOM_MUTATION, {
    onCompleted: () => {
      refetch()
      window.dispatchEvent(new Event('meetingRoomsUpdated'))
      window.localStorage.setItem('meetingRoomsUpdated', Date.now())
    },
  })

  const handleEdit = (room) => {
    setEditingRoom(room)
    setName(room.name)
    setDescription(room.description || '')
  }
  const handleCancelEdit = () => {
    setEditingRoom(null)
    setName('')
    setDescription('')
  }
  const handleSubmit = (e) => {
    e.preventDefault()
    if (editingRoom) {
      updateMeetingRoom({
        variables: { id: editingRoom.id, input: { name, description } },
      })
    } else {
      createMeetingRoom({ variables: { input: { name, description } } })
    }
  }

  if (loading) return <div>Loading meeting rooms...</div>
  if (error) return <div className="text-red-500">Error: {error.message}</div>

  return (
    <div className="mt-12 rounded-2xl border border-gray-200 bg-gray-50 shadow-lg p-8">
      <h2 className="mb-8 text-2xl font-semibold text-gray-900">Meeting Rooms</h2>

      <form onSubmit={handleSubmit} className="mb-8 space-y-6">
        <input
          type="text"
          placeholder="Room name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full rounded-md border border-gray-300 bg-white p-2 focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
        />
        <input
          type="text"
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-md border border-gray-300 bg-white p-2 focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
        />

        <div className="flex justify-end gap-4">
          <button
            type="submit"
            className="rounded-md bg-orange-500 px-5 py-2 text-white font-semibold transition hover:bg-orange-600"
          >
            {editingRoom ? 'Update Room' : 'Add Room'}
          </button>
          {editingRoom && (
            <button
              type="button"
              className="rounded-md bg-gray-300 px-5 py-2 text-gray-800 font-semibold transition hover:bg-gray-400"
              onClick={handleCancelEdit}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <table className="w-full rounded-md border border-gray-300">
        <thead>
          <tr className="bg-orange-100">
            <th className="px-4 py-3 text-left text-gray-900 font-semibold">Name</th>
            <th className="px-4 py-3 text-left text-gray-900 font-semibold">Description</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {data.meetingRooms.map((room) => (
            <tr
              key={room.id}
              className="border-t border-gray-300 hover:bg-orange-50 transition"
            >
              <td className="px-4 py-3 text-gray-800">{room.name}</td>
              <td className="px-4 py-3 text-gray-800">{room.description}</td>
              <td className="flex justify-end gap-4 px-4 py-3">
                <button
                  className="rounded-md border border-orange-600 px-4 py-2 text-orange-600 font-semibold transition hover:bg-orange-600 hover:text-white"
                  onClick={() => handleEdit(room)}
                >
                  Edit
                </button>
                <button
                  className="rounded-md border border-red-600 px-4 py-2 text-red-600 font-semibold transition hover:bg-red-600 hover:text-white"
                  onClick={() =>
                    deleteMeetingRoom({ variables: { id: room.id } })
                  }
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default MeetingRoomsSection
