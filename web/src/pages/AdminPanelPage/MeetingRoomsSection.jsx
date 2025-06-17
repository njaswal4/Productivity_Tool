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
      updateMeetingRoom({ variables: { id: editingRoom.id, input: { name, description } } })
    } else {
      createMeetingRoom({ variables: { input: { name, description } } })
    }
  }

  if (loading) return <div>Loading meeting rooms...</div>
  if (error) return <div className="text-red-500">Error: {error.message}</div>

  return (
    <div className="bg-white rounded-lg border-2 shadow-black shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4">Meeting Rooms</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 mb-4">
        <input
          type="text"
          placeholder="Room name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <input
          type="text"
          placeholder="Description (optional)"
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <div className="flex gap-2">
          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
          >
            {editingRoom ? 'Update Room' : 'Add Room'}
          </button>
          {editingRoom && (
            <button
              type="button"
              className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 transition"
              onClick={handleCancelEdit}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
      <table className="min-w-full bg-white border rounded shadow">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b text-left">Name</th>
            <th className="py-2 px-4 border-b text-left">Description</th>
            <th className="py-2 px-4 border-b"></th>
          </tr>
        </thead>
        <tbody>
          {data.meetingRooms.map(room => (
            <tr key={room.id} className="hover:bg-gray-50">
              <td className="py-2 px-4 border-b">{room.name}</td>
              <td className="py-2 px-4 border-b">{room.description}</td>
              <td className="py-2 px-4 border-b flex gap-2">
                <button
                  className="text-white border-2 px-4 rounded-md bg-blue-600 hover:bg-blue-800 transition"
                  onClick={() => handleEdit(room)}
                >
                  Edit
                </button>
                <button
                  className="text-white border-2 rounded-md bg-red-500 px-2 hover:bg-red-700 transition"
                  onClick={() => deleteMeetingRoom({ variables: { id: room.id } })}
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
