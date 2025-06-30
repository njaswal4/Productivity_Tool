import React, { useState } from 'react'
import { Metadata, useMutation } from '@redwoodjs/web'
import { useAuth } from 'src/auth'
import { navigate, routes } from '@redwoodjs/router'

const CHANGE_PASSWORD_MUTATION = gql`
  mutation ChangePassword($currentPassword: String!, $newPassword: String!) {
    changePassword(currentPassword: $currentPassword, newPassword: $newPassword)
  }
`

const ChangePasswordPage = () => {
  const { logOut } = useAuth()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [changePassword] = useMutation(CHANGE_PASSWORD_MUTATION)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All fields are required.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.')
      return
    }

    try {
      await changePassword({ variables: { currentPassword, newPassword } })
      setSuccess('Password changed successfully! Please log in again.')
      setTimeout(() => {
        logOut()
        navigate(routes.login())
      }, 1500)
    } catch (err) {
      setError('Current password is incorrect or something went wrong.')
    }
  }

  return (
    <>
      <Metadata title="ChangePassword" description="ChangePassword page" />

      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center">Change Password</h2>
          {error && <div className="mb-4 text-red-600">{error}</div>}
          {success && <div className="mb-4 text-green-600">{success}</div>}
          <div className="mb-4">
            <label className="block mb-1 font-medium">Current Password</label>
            <input
              type="password"
              className="w-full border rounded px-3 py-2"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-medium">New Password</label>
            <input
              type="password"
              className="w-full border rounded px-3 py-2"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block mb-1 font-medium">Confirm New Password</label>
            <input
              type="password"
              className="w-full border rounded px-3 py-2"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition"
          >
            Change Password
          </button>
          <button
            type="button"
            className="w-full mt-4 text-sm text-gray-600 hover:underline"
            onClick={() => navigate(routes.login())}
          >
            Forgot your current password?
          </button>
        </form>
      </div>
    </>
  )
}

export default ChangePasswordPage
