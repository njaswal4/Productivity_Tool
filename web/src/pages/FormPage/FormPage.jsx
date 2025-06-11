import React, { useState } from 'react'
import { Metadata } from '@redwoodjs/web'
import { navigate } from '@redwoodjs/router'
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
  'Other',
]

const FormPage = () => {
  const { currentUser } = useAuth()
  const [type, setType] = useState(FORM_TYPES[0])
  const [date, setDate] = useState('')
  const [reason, setReason] = useState('')
  const [success, setSuccess] = useState(false)
  const [createExceptionRequest] = useMutation(CREATE_EXCEPTION_REQUEST)

  const handleSubmit = async (e) => {
    e.preventDefault()
    // Use the date string directly as UTC midnight
    const utcDateString = `${date}T00:00:00Z`
    await createExceptionRequest({
      variables: {
        input: {
          userId: currentUser.id,
          type,
          date: utcDateString,
          reason,
          status: 'Pending',
        },
      },
    })
    setSuccess(true)
    setTimeout(() => {
      navigate('/')
    }, 1500)
  }

  return (
    <>
      <Metadata title="Form" description="Form page" />

      <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded shadow">
        <h2 className="text-xl font-bold mb-4">Submit Exception Request</h2>
        {success ? (
          <div className="text-green-600 font-semibold mb-2">Request submitted!</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                value={type}
                onChange={e => setType(e.target.value)}
                className="w-full border px-3 py-2 rounded"
              >
                {FORM_TYPES.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
                className="w-full border px-3 py-2 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Reason</label>
              <textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                required
                className="w-full border px-3 py-2 rounded"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded font-semibold"
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
