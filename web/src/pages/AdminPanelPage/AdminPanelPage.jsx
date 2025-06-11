import React, { useState, useEffect } from 'react'
import { Metadata, useQuery, useMutation } from '@redwoodjs/web'

const EXCEPTION_REQUESTS_QUERY = gql`
  query ExceptionRequests {
    exceptionRequests {
      id
      userId
      type
      reason
      date
      status
      user {
        name
      }
    }
  }
`

const ALL_USERS_ATTENDANCE_QUERY = gql`
  query {
    users {
      id
      name
      attendances {
        id
        duration
        status
        clockIn
        clockOut
      }
    }
  }
`

const DELETE_USER_MUTATION = gql`
  mutation DeleteUser($id: Int!) {
    deleteUser(id: $id) {
      id
      name
    }
  }
`

const UPDATE_EXCEPTION_REQUEST = gql`
  mutation UpdateExceptionRequest($id: Int!, $input: UpdateExceptionRequestInput!) {
    updateExceptionRequest(id: $id, input: $input) {
      id
      status
    }
  }
`

const AdminPanelPage = () => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)

  const { data, loading, error, refetch } = useQuery(EXCEPTION_REQUESTS_QUERY, {
    fetchPolicy: 'network-only',
  })
  const [updateExceptionRequest] = useMutation(UPDATE_EXCEPTION_REQUEST, {
    onCompleted: () => refetch(),
  })

  const { data: allUsersData, loading: allUsersLoading, error: allUsersError, refetch: refetchUsers } = useQuery(
    ALL_USERS_ATTENDANCE_QUERY,
    { fetchPolicy: 'network-only' }
  )

  const [deleteUser] = useMutation(DELETE_USER_MUTATION, {
    onCompleted: () => {
      refetchUsers()
      setShowDeleteDialog(false)
      setUserToDelete(null)
    },
  })

  // Pagination states
  const [exceptionPage, setExceptionPage] = useState(1)
  const [userPage, setUserPage] = useState(1)
  const itemsPerPage = 5

  // Paginated data
  const paginatedExceptions = data?.exceptionRequests?.slice(
    (exceptionPage - 1) * itemsPerPage,
    exceptionPage * itemsPerPage
  )
  const paginatedUsers = allUsersData?.users?.slice(
    (userPage - 1) * itemsPerPage,
    userPage * itemsPerPage
  )

  // Approve or reject form
  const handleAction = (id, status) => {
    updateExceptionRequest({ variables: { id, input: { status } } })
  }

  // Interval for refreshing data
  useEffect(() => {
    const interval = setInterval(() => {
      refetch()
      refetchUsers()
    }, 10000) // Refresh every 10 seconds

    return () => clearInterval(interval) // Cleanup interval on component unmount
  }, [refetch, refetchUsers])

  return (
    <>
      <Metadata title="Admin Panel" description="Manage users and exception requests" />

      {/* Delete User Dialog */}
      {showDeleteDialog && userToDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full">
            <h3 className="text-lg font-bold mb-4">Delete User</h3>
            <p className="mb-6">
              Are you sure you want to delete <span className="font-semibold">{userToDelete.name}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                onClick={() => setShowDeleteDialog(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                onClick={() => {
                  deleteUser({ variables: { id: userToDelete.id } })
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto mt-8 px-4">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">Admin Panel</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Manage Users Section */}
          <div className="bg-gray-50 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Manage Users</h2>
            {allUsersLoading ? (
              <div className="text-gray-500">Loading...</div>
            ) : allUsersError ? (
              <div className="text-red-500">Error: {allUsersError.message}</div>
            ) : (allUsersData?.users || []).length === 0 ? (
              <div className="text-gray-500">No users found.</div>
            ) : (
              <>
                <div className="space-y-4">
                  {paginatedUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between bg-white rounded-lg shadow p-4 border border-gray-200"
                    >
                      <span className="text-gray-800 font-medium">{user.name}</span>
                      <button
                        className="px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition"
                        onClick={() => {
                          setUserToDelete(user)
                          setShowDeleteDialog(true)
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
                {/* Pagination Controls */}
                <div className="flex justify-between items-center mt-6">
                  <button
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
                    disabled={userPage === 1}
                    onClick={() => setUserPage((prev) => prev - 1)}
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {userPage} of {Math.ceil(allUsersData?.users?.length / itemsPerPage)}
                  </span>
                  <button
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
                    disabled={userPage === Math.ceil(allUsersData?.users?.length / itemsPerPage)}
                    onClick={() => setUserPage((prev) => prev + 1)}
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Exception Requests Section */}
          <div className="bg-gray-50 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Pending Exception Requests</h2>
            {loading ? (
              <div className="text-gray-500">Loading...</div>
            ) : error ? (
              <div className="text-red-500">Error: {error.message}</div>
            ) : data?.exceptionRequests.length === 0 ? (
              <div className="text-gray-500">No pending requests.</div>
            ) : (
              <>
                <div className="space-y-4">
                  {paginatedExceptions.map((form) => (
                    <div
                      key={form.id}
                      className="flex flex-col bg-white rounded-lg shadow p-4 border border-gray-200"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-800 font-medium">{form.user?.name || form.userId}</span>
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            form.status === 'Pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : form.status === 'Approved'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {form.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{form.reason}</p>
                      <div className="flex justify-end gap-2 mt-4">
                        {form.status === 'Pending' && (
                          <>
                            <button
                              className="px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition"
                              onClick={() => handleAction(form.id, 'Approved')}
                            >
                              Approve
                            </button>
                            <button
                              className="px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition"
                              onClick={() => handleAction(form.id, 'Rejected')}
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {/* Pagination Controls */}
                <div className="flex justify-between items-center mt-6">
                  <button
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
                    disabled={exceptionPage === 1}
                    onClick={() => setExceptionPage((prev) => prev - 1)}
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {exceptionPage} of {Math.ceil(data?.exceptionRequests?.length / itemsPerPage)}
                  </span>
                  <button
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
                    disabled={exceptionPage === Math.ceil(data?.exceptionRequests?.length / itemsPerPage)}
                    onClick={() => setExceptionPage((prev) => prev + 1)}
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default AdminPanelPage
