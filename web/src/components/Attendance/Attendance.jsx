import React, { useEffect, useState} from 'react'
import Calendar from '../Calander/Calander'
import { navigate } from '@redwoodjs/router'
import { useQuery, useMutation } from '@redwoodjs/web'
import gql from 'graphql-tag'
import AttendanceCard from '../AttendanceCard/AttendanceCard'

const ATTENDANCE_QUERY = gql`
  query AttendanceQuery($userId: Int) {
    attendances(userId: $userId) {
      id
      date
      clockIn
      clockOut
      duration
      status
    }
  }
`

const CREATE_ATTENDANCE_MUTATION = gql`
  mutation CreateAttendanceMutation($input: CreateAttendanceInput!) {
    createAttendance(input: $input) {
      id
      date
      clockIn
      clockOut
      duration
      status
    }
  }
`

const EXCEPTION_REQUESTS_QUERY = gql`
  query GetUserWithExceptions($id: Int!) {
    user(id: $id) {
      id
      name
      exceptionRequests {
        id
        type
        reason
        date
        status
      }
    }
  }
`

const Attendance = ({ userId, userName }) => {
  const { data, loading, error, refetch } = useQuery(ATTENDANCE_QUERY, {
    variables: { userId },
    fetchPolicy: 'network-only',
    skip: !userId,
  })

  const [createAttendance] = useMutation(CREATE_ATTENDANCE_MUTATION, {
    onCompleted: () => {
      refetch() // Refetch attendance data after mutation completes
    },
  })

  const { data: exceptionData, loading: exceptionLoading, error: exceptionError, refetch: refetchExceptions } = useQuery(EXCEPTION_REQUESTS_QUERY, {
    variables: { id: userId },
    skip: !userId,
    fetchPolicy: 'network-only',
  })

  const [exceptionRequests, setExceptionRequests] = useState([])
  const [attendances, setAttendances] = useState([])

  // Pagination states
  const [attendancePage, setAttendancePage] = useState(1)
  const [exceptionPage, setExceptionPage] = useState(1)
  const itemsPerPage = 5

  // Update state when data changes
  useEffect(() => {
    if (data?.attendances) setAttendances(data.attendances)
  }, [data])

  useEffect(() => {
    if (exceptionData?.user?.exceptionRequests) {
      setExceptionRequests(exceptionData.user.exceptionRequests)
    }
  }, [exceptionData])

  // Polling for attendance updates
  useEffect(() => {
    const interval = setInterval(async () => {
      const result = await refetch()
      if (result.data?.attendances) {
        if (JSON.stringify(result.data.attendances) !== JSON.stringify(attendances)) {
          setAttendances(result.data.attendances)
        }
      }
    }, 10000) // Poll every 10 seconds
    return () => clearInterval(interval)
  }, [refetch, attendances])

  // Polling for exception updates
  useEffect(() => {
    const interval = setInterval(async () => {
      const result = await refetchExceptions()
      if (result.data?.user?.exceptionRequests) {
        if (JSON.stringify(result.data.user.exceptionRequests) !== JSON.stringify(exceptionRequests)) {
          setExceptionRequests(result.data.user.exceptionRequests)
        }
      }
    }, 10000) // Poll every 10 seconds
    return () => clearInterval(interval)
  }, [refetchExceptions, exceptionRequests])

  // Helper to calculate duration if not provided
  const getDuration = (clockIn, clockOut) => {
    if (!clockIn || !clockOut) return '-'
    const diffMs = new Date(clockOut) - new Date(clockIn)
    const hours = Math.floor(diffMs / 1000 / 60 / 60)
    const minutes = Math.floor((diffMs / 1000 / 60) % 60)
    return `${hours}h ${minutes}m`
  }

  // Paginated data
  const paginatedAttendances = attendances.slice(
    (attendancePage - 1) * itemsPerPage,
    attendancePage * itemsPerPage
  )
  const paginatedExceptions = exceptionRequests.slice(
    (exceptionPage - 1) * itemsPerPage,
    exceptionPage * itemsPerPage
  )

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Attendance History Table */}
      <div className="flex-1 bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mt-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Attendance History</h2>
        <div className="overflow-x-auto rounded-xl">
          {loading ? (
            <div>Loading...</div>
          ) : error ? (
            <div className="text-red-500">Error: {error.message}</div>
          ) : (
            <>
              <table className="min-w-full divide-y divide-gray-200 rounded-xl overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Clock In
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Clock Out
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {paginatedAttendances.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-6 text-gray-400">
                        No attendance records found.
                      </td>
                    </tr>
                  ) : (
                    paginatedAttendances.map((record, idx) => (
                      <tr
                        key={record.id}
                        className={
                          idx % 2 === 0
                            ? 'bg-gray-50 hover:bg-indigo-50 transition'
                            : 'hover:bg-indigo-50 transition'
                        }
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 rounded-l-lg">
                          {new Date(record.date).toLocaleDateString('en-GB', { timeZone: 'UTC' })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.clockIn
                            ? new Date(record.clockIn).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.clockOut
                            ? new Date(record.clockOut).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                          {record.duration && record.duration !== '-'
                            ? record.duration
                            : getDuration(record.clockIn, record.clockOut)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border
                              ${
                                record.status === 'Present'
                                  ? 'bg-green-100 text-green-800 border-green-200'
                                  : record.status === 'Late'
                                  ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                                  : record.status === 'Leave'
                                  ? 'bg-blue-100 text-blue-800 border-blue-200'
                                  : record.status === 'Weekend'
                                  ? 'bg-gray-100 text-gray-800 border-gray-200'
                                  : 'bg-red-100 text-red-800 border-red-200'
                              }`}
                          >
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              {/* Pagination Controls */}
              <div className="flex justify-between items-center mt-4">
                <button
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
                  disabled={attendancePage === 1}
                  onClick={() => setAttendancePage((prev) => prev - 1)}
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {attendancePage} of {Math.ceil(attendances.length / itemsPerPage)}
                </span>
                <button
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
                  disabled={attendancePage === Math.ceil(attendances.length / itemsPerPage)}
                  onClick={() => setAttendancePage((prev) => prev + 1)}
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Exception Management Section */}
      <div className="w-full lg:w-1/3 bg-white rounded-lg shadow p-4 mt-6 flex flex-col">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Exception Management</h2>
        <button
          className="w-full mb-4 py-2 bg-indigo-600 text-white rounded shadow hover:bg-indigo-700 transition-colors font-semibold"
          onClick={() => navigate('/form')}
        >
          Submit New Exception
        </button>
        {/* Exception Requests List */}
        <div className="space-y-3 mb-6">
          {exceptionLoading ? (
            <div>Loading...</div>
          ) : exceptionError ? (
            <div className="text-red-500">Error: {exceptionError.message}</div>
          ) : !exceptionData?.user ? (
            <div className="text-red-500">User not found or not loaded.</div>
          ) : paginatedExceptions.length === 0 ? (
            <div className="text-gray-500">You have not submitted any requests.</div>
          ) : (
            paginatedExceptions.map((ex) => (
              <div
                key={ex.id}
                className="flex flex-col bg-gray-50 rounded-lg border px-4 py-3"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-gray-800">{ex.type}</span>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full
                    ${ex.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : ''}
                    ${ex.status === 'Approved' ? 'bg-green-100 text-green-700' : ''}
                    ${ex.status === 'Rejected' ? 'bg-red-100 text-red-700' : ''}
                  `}>
                    {ex.status}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(ex.date).toLocaleDateString('en-GB', { timeZone: 'UTC' })} - {ex.reason}
                </div>
              </div>
            ))
          )}
        </div>
        {/* Pagination Controls */}
        <div className="flex justify-between items-center mt-4">
          <button
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
            disabled={exceptionPage === 1}
            onClick={() => setExceptionPage((prev) => prev - 1)}
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {exceptionPage} of {Math.ceil(exceptionRequests.length / itemsPerPage)}
          </span>
          <button
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
            disabled={exceptionPage === Math.ceil(exceptionRequests.length / itemsPerPage)}
            onClick={() => setExceptionPage((prev) => prev + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}

export default Attendance
