import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from 'src/auth'
import { Link, routes } from '@redwoodjs/router'
import { useMutation } from '@redwoodjs/web'

import ChangePasswordForm from 'src/components/ChangePasswordForm/ChangePasswordForm'

const UPDATE_USER_MUTATION = gql`
  mutation UpdateUser($id: Int!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      id
      name
      email
    }
  }
`

const Header = ({ isAdmin }) => {
  const { isAuthenticated, currentUser, logOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  // Modal state for updating personal info
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [profileForm, setProfileForm] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
  })
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [profileSuccess, setProfileSuccess] = useState('')

  // Modal state for changing password
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Scroll to section by id
  const handleScroll = (id) => (e) => {
    e.preventDefault()
    const section = document.getElementById(id)
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const [updateUser] = useMutation(UPDATE_USER_MUTATION)

  // Handle profile update submit
  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setProfileLoading(true)
    setProfileError('')
    setProfileSuccess('')
    try {
      await updateUser({
        variables: {
          id: currentUser.id,
          input: {
            name: profileForm.name,
            email: profileForm.email,
          },
        },
      })
      setProfileSuccess('Profile updated!')
      setTimeout(() => {
        setShowProfileModal(false)
        window.location.reload() // Refresh the page after closing the modal
      }, 1000)
    } catch (err) {
      setProfileError('Failed to update profile.')
    } finally {
      setProfileLoading(false)
    }
  }

  return (
    <>
      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <ChangePasswordForm onClose={() => setShowChangePasswordModal(false)} />
      )}

      {/* Profile Update Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md relative">
            <button
              className="absolute top-2 right-3 text-gray-400 hover:text-gray-700 text-2xl"
              onClick={() => setShowProfileModal(false)}
              aria-label="Close"
            >×</button>
            <h2 className="text-lg font-bold mb-4">Update Personal Info</h2>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full border px-3 py-2 rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={e => setProfileForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full border px-3 py-2 rounded"
                  required
                />
              </div>
              {profileError && <div className="text-red-600">{profileError}</div>}
              {profileSuccess && <div className="text-green-600">{profileSuccess}</div>}
              <button
                type="submit"
                className="w-full bg-orange-500 text-white py-2 rounded font-semibold hover:bg-orange-600 transition"
                disabled={profileLoading}
              >
                {profileLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}

      <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <img src="https://2cretiv.com/wp-content/uploads/2024/10/WhatsApp-Image-2024-10-14-at-1.54.56-PM-4.jpeg"
              className="flex h-10 w-20 rounded-full"
              alt="Logo"
              loading="lazy"
              onClick={() => window.location.href = routes.home()}
            />
            <h2 className="font-bold">Productivity Tool</h2>
          </div>

          {/* Auth/User Section */}
          <div className="flex items-center gap-4 relative">
            {isAuthenticated ? (
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen((open) => !open)}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-black hover:bg-orange-200 focus:outline-none"
                  aria-label="Account"
                >
                  <p className="text-white text-4xl">🧑‍💻</p>
                  <i className="ri-account-circle-line text-3xl text-primary"></i>
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="text-xs text-gray-500 mb-1">Logged in as:</div>
                      <div className="font-semibold text-gray-800 truncate">{currentUser.email}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false)
                        setShowProfileModal(true)
                        setProfileForm({
                          name: currentUser?.name || '',
                          email: currentUser?.email || '',
                        })
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                    >
                      Update Personal Info
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false)
                        setShowChangePasswordModal(true)
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                    >
                      Change Password
                    </button>
                    <button
                      type="button"
                      onClick={logOut}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 rounded-b-lg transition"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to={routes.login()}
                className="px-3 py-1 bg-primary text-white rounded hover:bg-primary-dark transition"
              >
                Login
              </Link>
            )}
          </div>
        </div>
        <nav className="flex border-t border-gray-200">
          <a
            href="/"
            className="flex-1 px-1 py-3 text-center text-sm font-medium text-primary border-b-2 border-primary"
          >
            <div className="w-5 h-5 mx-auto flex items-center justify-center">
              <i className="ri-dashboard-line"></i>
            </div>
            <span className="mt-1 block">Dashboard</span>
          </a>
          <a
            href="#bookings-section"
            onClick={handleScroll('bookings-section')}
            className="flex-1 px-1 py-3 text-center text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            <div className="w-5 h-5 mx-auto flex items-center justify-center">
              <i className="ri-calendar-line"></i>
            </div>
            <span className="mt-1 block">Bookings</span>
          </a>
          <a
            href="#attendance-section"
            onClick={handleScroll('attendance-section')}
            className="flex-1 px-1 py-3 text-center text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            <div className="w-5 h-5 mx-auto flex items-center justify-center">
              <i className="ri-time-line"></i>
            </div>
            <span className="mt-1 block">Attendance</span>
          </a>
          {isAdmin && (
            <a
              href="/admin"
              className="flex-1 px-1 py-3 text-center text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              <div className="w-5 h-5 mx-auto flex items-center justify-center">
                <i className="ri-admin-line"></i>
              </div>
              <span className="mt-1 block">Admin Panel</span>
            </a>
          )}
        </nav>
      </header>
    </>
  )
}

export default Header
