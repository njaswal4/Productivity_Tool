import React, { useEffect, useState, useMemo, useRef } from 'react'
import { useQuery, gql } from '@apollo/client'
import Papa from 'papaparse'
import { navigate, routes } from '@redwoodjs/router'
import { useAuth } from 'src/auth'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { toast, Toaster } from '@redwoodjs/web/toast'
import ExceptionForm from 'src/components/ExceptionForm'
import FormModal from 'src/components/FormModal'

const ATTENDANCE_QUERY = gql`
  query AttendanceQuery($userId: Int) {
    attendances(userId: $userId) {
      id
      date
      clockIn
      clockOut
      duration
      status
      breaks {
        id
        breakIn
        breakOut
      }
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
        createdAt
      }
    }
  }
`

const Attendance = ({ userId }) => {
  const { currentUser } = useAuth()
  const dropdownRef = useRef(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [showModal, setShowModal] = useState(false)

  const { data, loading, error, refetch } = useQuery(ATTENDANCE_QUERY, {
    variables: { userId },
    fetchPolicy: 'network-only',
    skip: !userId,
  })

  const { data: exceptionData, loading: exceptionLoading, error: exceptionError, refetch: refetchExceptions } = useQuery(
    EXCEPTION_REQUESTS_QUERY,
    {
      variables: { id: userId },
      skip: !userId,
      fetchPolicy: 'network-only',
    }
  )

  const [exceptionRequests, setExceptionRequests] = useState([])
  const [attendances, setAttendances] = useState([])

  // Pagination states
  const [attendancePage, setAttendancePage] = useState(1)
  const [exceptionPage, setExceptionPage] = useState(1)
  const itemsPerPage = 5

  // Memoized paginated data
  const paginatedAttendances = useMemo(() => {
    return attendances.slice(
      (attendancePage - 1) * itemsPerPage,
      attendancePage * itemsPerPage
    )
  }, [attendances, attendancePage, itemsPerPage])

  const paginatedExceptions = useMemo(() => {
    const sorted = [...exceptionRequests].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    ).reverse()
    return sorted.slice(
      (exceptionPage - 1) * itemsPerPage,
      exceptionPage * itemsPerPage
    )
  }, [exceptionRequests, exceptionPage, itemsPerPage])

  // Update state when attendance data changes
  useEffect(() => {
    if (data?.attendances && JSON.stringify(data.attendances) !== JSON.stringify(attendances)) {
      setAttendances(data.attendances)
    }
  }, [data])

  // Update state when exception data changes
  useEffect(() => {
    if (exceptionData?.user?.exceptionRequests) {
      const sorted = [...exceptionData.user.exceptionRequests].sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      ).reverse()
      setExceptionRequests(sorted)
    }
  }, [exceptionData])



  // PDF export option
  const exportAttendancePDF = () => {
    if (!attendances.length) {
      toast.error('No attendance records to export 😓')
      return
    }

    const pdf = new jsPDF()
    const title = `${currentUser?.name || 'User'}'s Attendance History`
    pdf.setFontSize(16)
    pdf.text(title, 14, 20)

    const headers = ['Date', 'Clock In', 'Clock Out', 'Duration', 'Status']

    const dataRows = attendances.map((record) => {
      const date = new Date(record.date).toLocaleDateString('en-GB')
      const clockIn = record.clockIn
        ? new Date(record.clockIn).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })
        : '-'
      const clockOut = record.clockOut
        ? new Date(record.clockOut).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })
        : '-'

      const duration = (() => {
        const breaks = record.breaks || []
        const totalBreakMs = breaks.reduce((sum, b) => {
          if (b.breakIn && b.breakOut) {
            return sum + (new Date(b.breakOut) - new Date(b.breakIn))
          }
          return sum
        }, 0)
        const officeMs =
          record.clockIn && record.clockOut
            ? Math.max(
                new Date(record.clockOut) -
                  new Date(record.clockIn) -
                  totalBreakMs,
                0
              )
            : 0
        const h = Math.floor(officeMs / 1000 / 60 / 60)
        const m = Math.floor((officeMs / 1000 / 60) % 60)
        return record.clockIn && record.clockOut ? `${h}h ${m}m` : '-'
      })()

      return [date, clockIn, clockOut, duration, record.status]
    })

    autoTable(pdf, {
      head: [headers],
      body: dataRows,
      startY: 30,
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [63, 81, 181], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    })

    pdf.save('attendance-history.pdf')
  }

  // CSV Export
  const exportAttendanceCSV = () => {
    if (!attendances.length) {
      toast.error('No attendance records to export 😓')
      return
    }
    // Prepare data for CSV: flatten breaks as a string
    const csvData = attendances.map((rec) => ({
      ...rec,
      breaks: (rec.breaks || [])
        .map(
          (b, idx) =>
            `#${idx + 1}: ${b.breakIn ? new Date(b.breakIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''} - ${
              b.breakOut ? new Date(b.breakOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
            }`
        )
        .join('; '),
    }))
    const csv = Papa.unparse(csvData)
    const blob = new Blob([csv], { type: 'text/csv' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${(currentUser?.name || 'user').toLowerCase()}_attendance_history.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // export handler
  const exportHandler = (type) => {
    if (!attendances || attendances.length === 0) {
      toast.error('No attendance records to export 😓')
      return
    }

    if (type === 'csv') exportAttendanceCSV()
    else if (type === 'pdf') exportAttendancePDF()
  }

  // Listen for outside clicks to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDropdown])

  // Listen for attendance updates (from AttendanceCard)
  useEffect(() => {
    const handler = () => {
      refetch().then(result => {
        // Optionally handle after refetch
      })
    }
    window.addEventListener('attendanceUpdated', handler)
    // For cross-tab support:
    const storageHandler = (e) => {
      if (e.key === 'attendanceUpdated') refetch()
    }
    window.addEventListener('storage', storageHandler)
    return () => {
      window.removeEventListener('attendanceUpdated', handler)
      window.removeEventListener('storage', storageHandler)
    }
  }, [refetch])

  // Listen for exception requests updates (from admin panel)
  useEffect(() => {
    // Listen for admin updates (cross-tab and same tab)
    const handler = () => {
      console.log('User: exceptionRequestsUpdated event received, refetching...')
      refetchExceptions()
    }
    window.addEventListener('exceptionRequestsUpdated', handler)
    const storageHandler = (e) => {
      if (e.key === 'exceptionRequestsUpdated') {
        console.log('User: exceptionRequestsUpdated storage event, refetching...')
        refetchExceptions()
      }
    }
    window.addEventListener('storage', storageHandler)
    return () => {
      window.removeEventListener('exceptionRequestsUpdated', handler)
      window.removeEventListener('storage', storageHandler)
    }
  }, [refetchExceptions])

  return (
    <>
      <Toaster toastOptions={{ duration: 4000 }} />
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Attendance History Table */}
        <div className="attendance-section mt-6 flex-1 rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
          <h2 className="mb-6 text-2xl font-bold text-gray-800">
            Attendance History
          </h2>

          <div
            ref={dropdownRef}
            className="mb-4 mr-4 inline-block flex justify-end text-left"
          >
            <button
              onClick={() => setShowDropdown((prev) => !prev)}
              className="inline-flex justify-center rounded bg-indigo-600 px-4 py-2 font-semibold text-white transition hover:bg-indigo-700"
            >
              Export ▼
            </button>
            {showDropdown && (
              <div className="absolute z-10 mt-2 w-44 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                <button
                  onClick={() => exportHandler('csv')}
                  className="block w-full rounded-md px-4 py-2 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Export as CSV
                </button>
                <button
                  onClick={() => exportHandler('pdf')}
                  className="block w-full rounded-md px-4 py-2 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Export as PDF
                </button>
              </div>
            )}
          </div>
          <div className="overflow-x-auto rounded-xl">
            {loading ? (
              <div>Loading...</div>
            ) : error ? (
              <div className="text-red-500">Error: {error.message}</div>
            ) : (
              <>
                <table className="min-w-full divide-y divide-gray-200 overflow-hidden rounded-xl">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Date', 'Clock In', 'Clock Out', 'Duration', 'Status'].map((header) => (
                        <th
                          key={header}
                          className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-600"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {paginatedAttendances.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="py-6 text-center text-gray-400"
                        >
                          No attendance records found.
                        </td>
                      </tr>
                    ) : (
                      paginatedAttendances.map((record, idx) => (
                        <tr
                          key={record.id}
                          className={
                            idx % 2 === 0
                              ? 'bg-gray-50 transition hover:bg-indigo-50'
                              : 'transition hover:bg-indigo-50'
                          }
                        >
                          <td className="whitespace-nowrap rounded-l-lg px-6 py-4 text-sm text-gray-900">
                            {new Date(record.date).toLocaleDateString('en-GB', { timeZone: 'UTC' })}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                            {record.clockIn
                              ? new Date(record.clockIn).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : '-'}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                            {record.clockOut
                              ? new Date(record.clockOut).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : '-'}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 font-mono text-sm text-gray-900">
                            {/* Office duration only (excluding breaks) */}
                            {(() => {
                              const breaks = record.breaks || []
                              const totalBreakMs = breaks.reduce((sum, b) => {
                                if (b.breakIn && b.breakOut) {
                                  return sum + (new Date(b.breakOut) - new Date(b.breakIn))
                                }
                                return sum
                              }, 0)
                              const officeMs = record.clockIn && record.clockOut
                                ? Math.max(new Date(record.clockOut) - new Date(record.clockIn) - totalBreakMs, 0)
                                : 0
                              const h = Math.floor(officeMs / 1000 / 60 / 60)
                              const m = Math.floor((officeMs / 1000 / 60) % 60)
                              return record.clockIn && record.clockOut
                                ? `${h}h ${m}m`
                                : '-'
                            })()}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm">
                            <span
                              className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold leading-5 
                                ${
                                  record.status === 'Present'
                                    ? 'border-green-200 bg-green-100 text-green-800'
                                    : record.status === 'Late'
                                      ? 'border-yellow-200 bg-yellow-100 text-yellow-800'
                                      : record.status === 'Leave'
                                        ? 'border-blue-200 bg-blue-100 text-blue-800'
                                        : 'border-red-200 bg-red-100 text-red-800'
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

                <div className="mt-4 flex items-center justify-between">
                  <button
                    className="rounded bg-gray-200 px-4 py-2 transition hover:bg-gray-300"
                    disabled={attendancePage === 1}
                    onClick={() => setAttendancePage((prev) => prev - 1)}
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {attendancePage} of{' '}
                    {Math.ceil(attendances.length / itemsPerPage)}
                  </span>
                  <button
                    className="rounded bg-gray-200 px-4 py-2 transition hover:bg-gray-300"
                    disabled={
                      attendancePage ===
                      Math.ceil(attendances.length / itemsPerPage)
                    }
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
        <div className="mt-6 flex w-full flex-col rounded-lg bg-white p-4 shadow lg:w-1/3">
          <h2 className="mb-4 text-lg font-bold text-gray-800">
            Exception Management
          </h2>
          <button
            className="mb-4 w-full rounded bg-indigo-600 py-2 font-semibold text-white shadow transition-colors hover:bg-indigo-700"
            onClick={() => setShowModal(true)}
          >
            Submit New Exception
          </button>
         
          <div className="mb-6 space-y-3">
            {exceptionLoading ? (
              <div>Loading...</div>
            ) : exceptionError ? (
              <div className="text-red-500">Error: {exceptionError.message}</div>
            ) : !exceptionData?.user ? (
              <div className="text-red-500">User not found or not loaded.</div>
            ) : paginatedExceptions.length === 0? (
              <div className="text-gray-500">
                You have not submitted any requests.
              </div>
            ) : (
              paginatedExceptions.map((ex) => (
                <div
                  key={ex.id}
                  className="flex flex-col rounded-lg border bg-gray-50 px-4 py-3"
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span className="font-semibold text-gray-800">{ex.type}</span>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold
                      ${ex.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : ''}
                      ${ex.status === 'Approved' ? 'bg-green-100 text-green-700' : ''}
                      ${ex.status === 'Rejected' ? 'bg-red-100 text-red-700' : ''}`}
                    >
                      {ex.status}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(ex.date).toLocaleDateString('en-GB', {
                      timeZone: 'UTC',
                    })}{' '}
                    - {ex.reason}
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="mt-4 flex items-center justify-between">
            <button
              className="rounded bg-gray-200 px-4 py-2 transition hover:bg-gray-300"
              disabled={exceptionPage === 1}
              onClick={() => setExceptionPage((prev) => prev - 1)}
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {exceptionPage} of{' '}
              {Math.ceil(exceptionRequests.length / itemsPerPage)}
            </span>
            <button
              className="rounded bg-gray-200 px-4 py-2 transition hover:bg-gray-300"
              disabled={
                exceptionPage ===
                Math.ceil(exceptionRequests.length / itemsPerPage)
              }
              onClick={() => setExceptionPage((prev) => prev + 1)}
            >
              Next
            </button>
          </div>
          {showModal && (
            <FormModal onClose={() => setShowModal(false)}>
              <h2 className="mb-4 text-xl font-bold">Submit Exception Request</h2>
              <ExceptionForm
                onSuccess={async () => {
                  setShowModal(false)
                  const result = await refetchExceptions()
                  if (result.data?.user?.exceptionRequests) {
                    const sorted = [...result.data.user.exceptionRequests].sort(
                      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
                    ).reverse()
                    setExceptionRequests(sorted)
                  }
                  // Notify admin panel
                  window.dispatchEvent(new Event('exceptionRequestsUpdated'))
                  window.localStorage.setItem('exceptionRequestsUpdated', Date.now())
                }}
              />
            </FormModal>
          )}
        </div>
      </div>
    </>
  )
}

export default Attendance
