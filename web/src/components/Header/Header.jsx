import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from 'src/auth'
import { Link, routes } from '@redwoodjs/router'
import { useMutation } from '@redwoodjs/web'



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
  const { isAuthenticated, currentUser, logOut, hasRole } = useAuth()
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
              className="flex h-10 w-40 rounded-full"
              alt="Logo"
              loading="lazy"
              onClick={() => window.location.href = routes.home()}
            />
            <h2 className="font-bold"> 
             Productivity Tool
          </h2>
          </div>

          {/* Auth/User Section */}
          <div className="flex items-center gap-4 relative">
  {isAuthenticated ? (
    <>
      <span className="text-sm font-medium">{currentUser?.email}</span>
      <button
        onClick={logOut}
        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
      >
        Logout
      </button>
    </>
  ) : (
    <Link
      to={routes.login()}
      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
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
          <a
            href="#vacation-section"
            onClick={handleScroll('vacation-section')}
            className="flex-1 px-1 py-3 text-center text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            <div className="w-5 h-5 mx-auto flex items-center justify-center">
              <i className="ri-calendar-event-line"></i>
            </div>
            <span className="mt-1 block">Vacation</span>
          </a>
          {hasRole && hasRole('ADMIN') && (
            <Link
              to={routes.adminPanel()}
              className="flex-1 px-1 py-3 text-center text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              <div className="w-5 h-5 mx-auto flex items-center justify-center">
                <i className="ri-admin-line"></i>
              </div>
              <span className="mt-1 block">Admin Panel</span>
            </Link>
          )}
        </nav>
      </header>
    </>
  )
}

export default Header
