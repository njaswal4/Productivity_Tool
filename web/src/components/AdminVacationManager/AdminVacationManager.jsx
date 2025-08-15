import { useState, useMemo, useEffect } from 'react'
import { useMutation, useQuery } from '@redwoodjs/web'
import { toast, Toaster } from '@redwoodjs/web/toast'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import FormModal from 'src/components/FormModal/FormModal'

// Initialize the calendar localizer
const localizer = momentLocalizer(moment)

const ADMIN_VACATION_REQUESTS = gql`
  query AdminVacationRequests {
    vacationRequests {
      id
      startDate
      endDate
      reason
      status
      rejectionReason
      originalRequestId
      createdAt
      user {
        id
        name
        email
      }
      originalRequest {
        id
        startDate
        endDate
        reason
        status
        rejectionReason
      }
    }
  }
`

const APPROVE_VACATION_REQUEST = gql`
  mutation ApproveVacationRequest($id: Int!) {
    approveVacationRequest(id: $id) {
      id
      status
    }
  }
`

const REJECT_VACATION_REQUEST = gql`
  mutation RejectVacationRequest($id: Int!, $input: RejectVacationRequestInput!) {
    rejectVacationRequest(id: $id, input: $input) {
      id
      status
      rejectionReason
    }
  }
`

const AdminVacationManager = () => {
  const [itemsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState('list')
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectRequestId, setRejectRequestId] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const today = new Date()

  const { data, loading, error, refetch } = useQuery(ADMIN_VACATION_REQUESTS)

  const [approveVacationRequest, { loading: approveLoading }] = useMutation(
    APPROVE_VACATION_REQUEST,
    {
      onCompleted: () => {
        toast.success('Request approved')
        // Notify other components about the update
        window.dispatchEvent(new Event('vacationRequestsUpdated'))
        window.localStorage.setItem('vacationRequestsUpdated', Date.now())
      },
      onError: (error) => {
        toast.error(`Error: ${error.message}`)
      },
      update: (cache, { data: { approveVacationRequest } }) => {
        try {
          const { vacationRequests } = cache.readQuery({
            query: ADMIN_VACATION_REQUESTS,
          })

          // Update the cache with the new status
          cache.writeQuery({
            query: ADMIN_VACATION_REQUESTS,
            data: {
              vacationRequests: vacationRequests.map((req) =>
                req.id === approveVacationRequest.id
                  ? { ...req, status: 'Approved' }
                  : req
              ),
            },
          })
        } catch (error) {
          console.error('Error updating cache:', error)
        }
      },
    }
  )

  const [rejectVacationRequest, { loading: rejectLoading }] = useMutation(
    REJECT_VACATION_REQUEST,
    {
      onCompleted: () => {
        toast.success('Request rejected')
        // Notify other components about the update
        window.dispatchEvent(new Event('vacationRequestsUpdated'))
        window.localStorage.setItem('vacationRequestsUpdated', Date.now())
      },
      onError: (error) => {
        toast.error(`Error: ${error.message}`)
      },
      update: (cache, { data: { rejectVacationRequest } }) => {
        try {
          const { vacationRequests } = cache.readQuery({
            query: ADMIN_VACATION_REQUESTS,
          })

          // Update the cache with the new status
          cache.writeQuery({
            query: ADMIN_VACATION_REQUESTS,
            data: {
              vacationRequests: vacationRequests.map((req) =>
                req.id === rejectVacationRequest.id
                  ? { ...req, status: 'Rejected', rejectionReason: rejectVacationRequest.rejectionReason }
                  : req
              ),
            },
          })
        } catch (error) {
          console.error('Error updating cache:', error)
        }
      },
    }
  )

  const handleApprove = (id) => {
    approveVacationRequest({ variables: { id } })
  }

  const handleReject = (id) => {
    setRejectRequestId(id)
    setRejectionReason('')
    setShowRejectModal(true)
  }

  const handleConfirmReject = () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason')
      return
    }
    
    rejectVacationRequest({ 
      variables: { 
        id: rejectRequestId,
        input: {
          rejectionReason: rejectionReason.trim()
        }
      } 
    })
    
    setShowRejectModal(false)
    setRejectRequestId(null)
    setRejectionReason('')
  }

  const allRequests = data?.vacationRequests || []

  // Format data for calendar view
  const calendarEvents = useMemo(() => {
    return allRequests.map((req) => ({
      id: req.id,
      title: `${req.user.name}: ${
        req.reason.substring(0, 15)
      }${req.reason.length > 15 ? '...' : ''}`,
      start: new Date(new Date(req.startDate).toISOString().split('T')[0]), // Ensures UTC date
      end: new Date(new Date(req.endDate).toISOString().split('T')[0]),     // Ensures UTC date
      allDay: true,
      status: req.status,
      resource: req.user.name,
    }))
  }, [allRequests])

  const filteredRequests = useMemo(() => {
    return allRequests.filter((req) => {
      const matchesStatus =
        statusFilter === 'All' || req.status === statusFilter
      const matchesSearch =
        searchTerm === '' ||
        req.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.reason.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesStatus && matchesSearch
    })
  }, [allRequests, statusFilter, searchTerm])

  const paginatedRequests = useMemo(() => {
    return filteredRequests.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    )
  }, [filteredRequests, currentPage, itemsPerPage])

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage)

  const eventStyleGetter = (event) => {
    let style = {
      backgroundColor: '#FEF3C7', // Pending (yellow)
      borderRadius: '5px',
      opacity: 0.8,
      color: '#92400E',
      border: '1px solid #F59E0B',
      display: 'block',
    }

    if (event.status === 'Approved') {
      style.backgroundColor = '#D1FAE5' // green
      style.color = '#065F46'
      style.border = '1px solid #10B981'
    } else if (event.status === 'Rejected' || event.status === 'Cancelled') {
      style.backgroundColor = '#FEE2E2' // red
      style.color = '#991B1B'
      style.border = '1px solid #EF4444'
    }

    return { style }
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  useEffect(() => {
    const handleVacationUpdated = async () => {
      console.log('Admin: vacationRequestsUpdated event received, refetching...')
      await refetch()
    }

    // Listen for custom event from user component
    window.addEventListener('vacationRequestsUpdated', handleVacationUpdated)

    // Listen for localStorage changes (cross-tab communication)
    const handleStorageChange = (e) => {
      if (e.key === 'vacationRequestsUpdated') {
        console.log('Admin: vacationRequestsUpdated storage event, refetching...')
        refetch()
      }
    }
    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('vacationRequestsUpdated', handleVacationUpdated)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [refetch])

  // Add the same date formatter function to your component:
  const formatDate = (dateString) => {
    // Create a date in UTC to avoid timezone shifts
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC', // Important! This ensures consistent date display
    })
  }

  return (
    <div className="admin-vacation-manager bg-white rounded-lg shadow p-6">
      <Toaster toastOptions={{ duration: 3000 }} />

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Vacation Request Management</h2>

        <div className="flex items-center space-x-3">
          <div className="bg-gray-100 rounded-lg p-1 flex">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                viewMode === 'list'
                  ? 'bg-white shadow text-indigo-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                viewMode === 'calendar'
                  ? 'bg-white shadow text-indigo-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Calendar
            </button>
          </div>
        </div>
      </div>

      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Search employee or reason..."
              value={searchTerm}
              onChange={handleSearch}
              className="rounded border px-3 py-2 pl-10 w-full sm:w-64"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          <div className="flex items-center">
            <label className="flex items-center">
              <span className="mr-2 text-sm font-medium text-gray-700">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="rounded border px-2 py-2 text-sm"
              >
                <option value="All">All</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </label>
          </div>
        </div>

        <div className="bg-indigo-50 px-3 py-1 rounded-lg text-sm text-indigo-800 w-full sm:w-auto text-center sm:text-left">
          <span className="font-medium">{filteredRequests.length}</span> vacation
          requests found
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <svg
            className="animate-spin h-10 w-10 text-indigo-600 mx-auto"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="mt-3 text-gray-500">Loading vacation requests...</p>
        </div>
      ) : error ? (
        <div className="text-red-500 py-4 bg-red-50 rounded-lg p-4 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 text-red-500 mx-auto mb-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p>Error loading vacation requests</p>
          <p className="text-sm mt-1">{error.message}</p>
        </div>
      ) : viewMode === 'calendar' ? (
        <div className="h-[600px] mb-6 border rounded-lg p-2">
          <Calendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            eventPropGetter={eventStyleGetter}
            views={['month', 'week', 'agenda']}
            defaultView="month"
          />
        </div>
      ) : paginatedRequests.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 mx-auto text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="mt-2 text-gray-500">
            No vacation requests found with the current filters.
          </p>
          {(statusFilter !== 'All' || searchTerm !== '') && (
            <button
              onClick={() => {
                setStatusFilter('All')
                setSearchTerm('')
              }}
              className="mt-3 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                  Date Range
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                  Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {paginatedRequests.map((request) => {
                const start = new Date(request.startDate)
                const end = new Date(request.endDate)
                const isActive =
                  today >= start &&
                  today <= end &&
                  request.status === 'Approved'

                return (
                  <tr
                    key={request.id}
                    className={isActive ? 'bg-green-50' : undefined}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {request.user.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {request.user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(request.startDate)} - {formatDate(request.endDate)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {Math.ceil(
                          (new Date(request.endDate) -
                            new Date(request.startDate)) /
                            (1000 * 60 * 60 * 24)
                        ) + 1}{' '}
                        days
                        {isActive && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            Active now
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 break-words max-w-xs max-h-20 overflow-y-auto">
                        {request.reason}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          request.status === 'Pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : request.status === 'Approved'
                            ? 'bg-green-100 text-green-800'
                            : request.status === 'Cancelled'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {request.status === 'Pending' && (
                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleApprove(request.id)}
                            disabled={approveLoading}
                            className="text-green-600 hover:text-green-900 flex items-center"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(request.id)}
                            disabled={rejectLoading}
                            className="text-red-600 hover:text-red-900 flex items-center"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center">
          <nav
            className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
            aria-label="Pagination"
          >
            <button
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(1)}
            >
              <span className="sr-only">First</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <button
              className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              <span className="sr-only">Previous</span>
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {/* Page numbers */}
            {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
              let pageNum
              if (totalPages <= 5) {
                pageNum = idx + 1
              } else if (currentPage <= 3) {
                pageNum = idx + 1
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + idx
              } else {
                pageNum = currentPage - 2 + idx
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium
                    ${
                      currentPage === pageNum
                        ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                >
                  {pageNum}
                </button>
              )
            })}

            <button
              className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              <span className="sr-only">Next</span>
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <button
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(totalPages)}
            >
              <span className="sr-only">Last</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
                <path
                  fillRule="evenodd"
                  d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </nav>
        </div>
      )}
      
      {/* Rejection Modal */}
      {showRejectModal && (
        <FormModal isOpen={showRejectModal} onClose={() => setShowRejectModal(false)}>
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Reject Vacation Request
              </h3>
              <p className="text-sm text-gray-600">
                Please provide a reason for rejecting this vacation request.
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rejection Reason *
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                rows={4}
                placeholder="Please provide a detailed reason for the rejection..."
                required
              />
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Reject Request
              </button>
            </div>
          </div>
        </FormModal>
      )}
    </div>
  )
}

export default AdminVacationManager