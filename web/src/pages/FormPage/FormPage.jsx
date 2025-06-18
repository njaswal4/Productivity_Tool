import React, { useState } from 'react'

import { navigate } from '@redwoodjs/router'
import { Metadata } from '@redwoodjs/web'
import { useMutation } from '@redwoodjs/web'

import { useAuth } from 'src/auth'

const CREATE_EXCEPTION_REQUEST = gql`
  mutation CreateExceptionRequest($input: CreateExceptionRequestInput!) {
    createExceptionRequest(input: $input) {
      id
    }
  }
`

const FORM_TYPES = [
  'Late Arrival',
  'Early Departure',
  'Remote Work',
  'Missed Clock In/Out',
  'Sick Day',
  'Leave',
  'Vacation',
  'Other',
  'Training',
]

const FORM_COLORS = {
  'Late Arrival': 'bg-blue-50',
  'Early Departure': 'bg-yellow-50',
  'Remote Work': 'bg-teal-50',
  'Missed Clock In/Out': 'bg-purple-50',
  Other: 'bg-gray-50',
  'Sick Day': 'bg-red-50',
  Leave: 'bg-indigo-50',
  Vacation: 'bg-green-50',
  Training: 'bg-orange-50',
}

const COLOR_DOTS = {
  'Late Arrival': 'bg-blue-400',
  'Early Departure': 'bg-yellow-400',
  'Remote Work': 'bg-teal-400',
  'Missed Clock In/Out': 'bg-purple-400',
  Other: 'bg-gray-400',
  'Sick Day': 'bg-red-400',
  Leave: 'bg-indigo-400',
  Vacation: 'bg-green-400',
  Training: 'bg-orange-400',
}

const getTodayDateString = () => new Date().toISOString().split('T')[0]

const FormPage = () => {
  const { currentUser } = useAuth()
  const [type, setType] = useState(FORM_TYPES[0])
  const [date, setDate] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [reason, setReason] = useState('')
  const [success, setSuccess] = useState(false)
  const [createExceptionRequest] = useMutation(CREATE_EXCEPTION_REQUEST)

  const handleSubmit = async (e) => {
    e.preventDefault()

    let finalDate = ''

    if (
      type === 'Late Arrival' ||
      type === 'Early Departure' ||
      type === 'Sick Day'
    ) {
      finalDate = `${getTodayDateString()}T00:00:00Z`
    } else if (
      type === 'Remote Work' ||
      type === 'Leave' ||
      type === 'Vacation' ||
      type === 'Training'
    ) {
      finalDate = `${fromDate}T00:00:00Z`
    } else {
      finalDate = `${date}T00:00:00Z`
    }

    const finalReason =
      ['Remote Work', 'Leave', 'Vacation', 'Training'].includes(type) && toDate
        ? `${reason} (To: ${toDate})`
        : reason

    try {
      await createExceptionRequest({
        variables: {
          input: {
            userId: currentUser.id,
            type,
            date: finalDate,
            reason: finalReason,
            status: 'Pending',
          },
        },
      })
      setSuccess(true)
      setTimeout(() => navigate('/'), 1500)
    window.dispatchEvent(new Event('exceptionRequestsChanged'))
    window.localStorage.setItem('exceptionRequestsChanged', Date.now())

    } catch (error) {
      console.error('Submission failed:', error)
   
    }
  }

  return (
    <>
      <Metadata title="Form" description="Form page" />
      <div
        className={`mx-auto mt-10 max-w-md rounded p-6 shadow transition ${
          FORM_COLORS[type] || 'bg-white'
        }`}
      >
        <h2 className="mb-4 text-xl font-bold">Submit Exception Request</h2>
        {success ? (
          <div className="mb-2 font-semibold text-green-600">
            Request submitted!
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Type dropdown */}
            <div>
              <label className="mb-1 block text-sm font-medium">Type</label>
              <div className="flex items-center gap-2">
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full rounded border px-3 py-2"
                >
                  {FORM_TYPES.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <span
                  className={`h-4 w-4 rounded-full ${COLOR_DOTS[type] || 'bg-gray-400'}`}
                  title={type}
                ></span>
              </div>
            </div>

            {/* Conditional date fields */}
            {(type === 'Late Arrival' ||
              type === 'Early Departure' ||
              type === 'Sick Day') && (
              <div>
                <label className="mb-1 block text-sm font-medium">Date</label>
                <input
                  type="date"
                  value={getTodayDateString()}
                  readOnly
                  className="w-full rounded border bg-gray-100 px-3 py-2 text-gray-600"
                />
              </div>
            )}

            {['Remote Work', 'Leave', 'Vacation', 'Training'].includes(type) && (
              <>
                <div>
                  <label className="mb-1 block text-sm font-medium">From</label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    required
                    className="w-full rounded border px-3 py-2"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">To</label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    required
                    className="w-full rounded border px-3 py-2"
                  />
                </div>
              </>
            )}

            {(type === 'Missed Clock In/Out' || type === 'Other') && (
              <div>
                <label className="mb-1 block text-sm font-medium">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full rounded border px-3 py-2"
                />
              </div>
            )}

            {/* Reason */}
            <div>
              <label className="mb-1 block text-sm font-medium">Reason</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                className="w-full rounded border px-3 py-2"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full rounded bg-blue-600 py-2 font-semibold text-white hover:bg-blue-700"
            >
              Submit Request
            </button>
          </form>
        )}
      </div>
    </>
  )
}

export default FormPage
