import React, { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@redwoodjs/web'

const GET_MEETING_ROOMS_WITH_DESCRIPTION = gql`
  query GetMeetingRoomsWithDescription {
    meetingRooms {
      id
      name
      description
    }
  }
`

const GET_USER_MEETING_ROOM = gql`
  query GetUserMeetingRoom($userId: Int!) {
    user(id: $userId) {
      id
      selectedMeetingRoom {
        id
        name
        description
      }
    }
  }
`

const UPDATE_USER_MEETING_ROOM = gql`
  mutation UpdateUserMeetingRoom($userId: Int!, $meetingRoomId: Int!) {
    updateUser(id: $userId, input: { selectedMeetingRoomId: $meetingRoomId }) {
      id
      selectedMeetingRoom {
        id
        name
      }
    }
  }
`

const MeetingRoomSelectionSection = ({ userId }) => {
  const { data: roomsData, loading: roomsLoading, error: roomsError } = useQuery(GET_MEETING_ROOMS_WITH_DESCRIPTION)
  const { data: userData, loading: userLoading, error: userError, refetch: refetchUser } = useQuery(GET_USER_MEETING_ROOM, {
    variables: { userId },
  })

  const [selectedRoomId, setSelectedRoomId] = useState(null)
  const [updateUserMeetingRoom, { loading: updateLoading }] = useMutation(UPDATE_USER_MEETING_ROOM, {
    onCompleted: () => {
      refetchUser()
      alert('Meeting room selection updated successfully.')
    },
    onError: (error) => {
      alert('Error updating meeting room selection: ' + error.message)
    },
  })

  useEffect(() => {
    if (userData?.user?.selectedMeetingRoom?.id) {
      setSelectedRoomId(userData.user.selectedMeetingRoom.id)
    }
  }, [userData])

  const handleChange = (e) => {
    setSelectedRoomId(parseInt(e.target.value))
  }

  const handleSave = () => {
    if (selectedRoomId) {
      updateUserMeetingRoom({ variables: { userId, meetingRoomId: selectedRoomId } })
    } else {
      alert('Please select a meeting room before saving.')
    }
  }

  if (roomsLoading || userLoading) return <div>Loading meeting rooms...</div>
  if (roomsError) return <div>Error loading meeting rooms: {roomsError.message}</div>
  if (userError) return <div>Error loading user data: {userError.message}</div>

  return (
    <div className="bg-white border border-blue-300 rounded-xl shadow p-6 max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-blue-700">Select a Meeting Room</h2>
      <select
        value={selectedRoomId || ''}
        onChange={handleChange}
        className="w-full p-2 border border-gray-300 rounded mb-4"
      >
        <option value="" disabled>
          -- Select a meeting room --
        </option>
        {roomsData.meetingRooms.map((room) => (
          <option key={room.id} value={room.id}>
            {room.name} {room.description ? `- ${room.description}` : ''}
          </option>
        ))}
      </select>
      <button
        onClick={handleSave}
        disabled={updateLoading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        {updateLoading ? 'Saving...' : 'Save Selection'}
      </button>
    </div>
  )
}

export default MeetingRoomSelectionSection
