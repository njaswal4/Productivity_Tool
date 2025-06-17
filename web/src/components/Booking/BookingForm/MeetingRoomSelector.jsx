import React, { useEffect } from 'react'
import { useQuery, gql } from '@apollo/client'

const MEETING_ROOMS_QUERY = gql`
  query MeetingRooms {
    meetingRooms {
      id
      name
      description
    }
  }
`

const MeetingRoomSelector = ({ selectedRoomId, onChange }) => {
  const { data, loading, error, refetch } = useQuery(MEETING_ROOMS_QUERY)

  useEffect(() => {
    const handler = () => refetch()
    window.addEventListener('meetingRoomsUpdated', handler)
    // Listen for localStorage changes (cross-tab)
    const storageHandler = (e) => {
      if (e.key === 'meetingRoomsUpdated') refetch()
    }
    window.addEventListener('storage', storageHandler)
    return () => {
      window.removeEventListener('meetingRoomsUpdated', handler)
      window.removeEventListener('storage', storageHandler)
    }
  }, [refetch])

  if (loading) return <div>Loading meeting rooms...</div>
  if (error) return <div className="text-red-500">Error loading meeting rooms</div>

  return (
    <div className="mb-4">
      <label className="block font-semibold mb-1">Select Meeting Room</label>
      <select
        value={selectedRoomId}
        onChange={e => onChange(e.target.value)}
        className="rw-input w-full px-4 py-2 rounded-lg border border-gray-300"
        required
      >
        <option value="">-- Select a room --</option>
        {data.meetingRooms.map(room => (
          <option key={room.id} value={room.id}>
            {room.name} {room.description ? `(${room.description})` : ''}
          </option>
        ))}
      </select>
    </div>
  )
}

export default MeetingRoomSelector
