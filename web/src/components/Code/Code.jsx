import React, { useState } from 'react'

const Code = ({ onCheckInEnabled, onUserNameChange }) => {
  const [codeInput, setCodeInput] = useState('')
  const [userName, setUserName] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Helper to track code usage in localStorage
  const getCodeUsage = () => JSON.parse(localStorage.getItem('codeUsage') || '{}')
  const setCodeUsage = (usage) => localStorage.setItem('codeUsage', JSON.stringify(usage))

  const handleCodeSubmit = () => {
    const officeCode = localStorage.getItem('officeCode')
    const usage = getCodeUsage()
    if (!userName) {
      setError('Please enter your name before checking in.')
      setSuccess(false)
      return
    }
    if (codeInput === officeCode) {
      // Check if code already used by another user
      if (usage[officeCode] && !usage[officeCode].includes(userName)) {
        // Notify admin by storing all user names who used the code
        let multiUsers = JSON.parse(localStorage.getItem('multipleCodeUsers') || '[]')
        if (!multiUsers.includes(userName)) {
          multiUsers.push(userName)
          localStorage.setItem('multipleCodeUsers', JSON.stringify(multiUsers))
        }
        localStorage.setItem('multipleCodeUse', 'true')
        setError('This code has already been used by another user. Admin has been notified.')
        setSuccess(false)
        if (onCheckInEnabled) onCheckInEnabled(false)
        return
      }
      // Mark code as used by this user
      usage[officeCode] = usage[officeCode] || []
      if (!usage[officeCode].includes(userName)) {
        usage[officeCode].push(userName)
        setCodeUsage(usage)
      }
      setSuccess(true)
      setError('')
      if (onCheckInEnabled) onCheckInEnabled(true)
      if (onUserNameChange) onUserNameChange(userName)
    } else {
      setError('Invalid or expired code.')
      setSuccess(false)
      if (onCheckInEnabled) onCheckInEnabled(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-8 bg-white p-6 rounded shadow">
      <h2 className="text-lg font-bold mb-2">Enter Check-In Code</h2>
      <div className="mb-2">
        <input
          type="text"
          value={userName}
          onChange={e => {
            setUserName(e.target.value)
            if (onUserNameChange) onUserNameChange(e.target.value)
          }}
          className="border px-3 py-2 rounded w-full mb-2"
          placeholder="Enter your name"
          disabled={success}
        />
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={codeInput}
            onChange={e => setCodeInput(e.target.value)}
            className="border px-3 py-2 rounded w-full"
            placeholder="Enter code from admin panel"
           // disabled={success}
          />
          <button
            onClick={handleCodeSubmit}
            className="bg-blue-600 text-white px-4 py-2 rounded"
           // disabled={success}
          >
            Submit
          </button>
        </div>
      </div>
      {success && (
        <div className="text-green-600 mb-2">Check-in enabled! You can now clock in.</div>
      )}
      {error && (
        <div className="text-red-600 mb-2">{error}</div>
      )}
    </div>
  )
}

export default Code
