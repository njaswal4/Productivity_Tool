import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from 'src/auth'
import { Link, routes } from '@redwoodjs/router'
import { useMutation, gql } from '@redwoodjs/web'

const UPDATE_USER_MUTATION = gql`
  mutation UpdateUser($id: Int!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      id
      name
      email
    }
  }
`

const Header = ({ isAdmin, showQuickAccess = false }) => {
  const { isAuthenticated, currentUser, logOut, hasRole } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [resourcesDropdownOpen, setResourcesDropdownOpen] = useState(false)
  const userMenuRef = useRef(null)
  const resourcesDropdownRef = useRef(null)

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
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false)
      }
      if (resourcesDropdownRef.current && !resourcesDropdownRef.current.contains(event.target)) {
        setResourcesDropdownOpen(false)
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

      <header className="bg-white shadow-lg fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center justify-between px-6 py-4">
          {/* Logo and Home */}
          <div className="flex items-center gap-6">
            <Link to={routes.home()} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <img src="/logo.jpg"
                className="h-10 w-40 rounded-full object-cover"
                alt="2Creative Logo"
                loading="lazy"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-800">Productivity Tool</h1>
                <p className="text-xs text-gray-500">2Creative Solutions</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to={routes.home()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 font-medium"
            >
              <i className="ri-home-4-line text-lg"></i>
              <span>Home</span>
            </Link>
            
            {/* Resources */}
            <div className="relative" ref={resourcesDropdownRef}>
              <button 
                onClick={() => setResourcesDropdownOpen(!resourcesDropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-700 hover:text-purple-600 hover:bg-purple-50 transition-all duration-200 font-medium"
              >
                <i className="ri-stack-line text-lg"></i>
                <span>Resources</span>
                <i className={`ri-arrow-down-s-line text-sm transition-transform duration-200 ${resourcesDropdownOpen ? 'rotate-180' : ''}`}></i>
              </button>
              {resourcesDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                  <Link
                    to={routes.assetTracker()}
                    onClick={() => setResourcesDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors duration-200"
                  >
                    <i className="ri-computer-line text-lg"></i>
                    <span>Assets</span>
                  </Link>
                  <Link
                    to={routes.officeSupplies()}
                    onClick={() => setResourcesDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors duration-200"
                  >
                    <i className="ri-archive-line text-lg"></i>
                    <span>Supplies</span>
                  </Link>
                  <Link
                    to={routes.supplyRequests()}
                    onClick={() => setResourcesDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors duration-200"
                  >
                    <i className="ri-shopping-cart-line text-lg"></i>
                    <span>Supply Requests</span>
                  </Link>
                </div>
              )}
            </div>

            <Link
              to={routes.projectTracker()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-700 hover:text-orange-600 hover:bg-orange-50 transition-all duration-200 font-medium"
            >
              <i className="ri-project-line text-lg"></i>
              <span>Projects</span>
            </Link>

            {hasRole && hasRole('ADMIN') && (
              <Link
                to={routes.adminPanel()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700 transition-all duration-200 font-medium shadow-md"
              >
                <i className="ri-admin-line text-lg"></i>
                <span>Admin</span>
              </Link>
            )}
          </nav>

          {/* Desktop Auth/User Section */}
          <div className="hidden md:flex items-center gap-4 relative">
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((open) => !open)}
                  className="flex items-center gap-3 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-all duration-200"
                  aria-label="Account"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : '�'}
                    </span>
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium text-gray-800">{currentUser?.name || 'User'}</div>
                    <div className="text-xs text-gray-500">{hasRole && hasRole('ADMIN') ? 'Admin' : 'Employee'}</div>
                  </div>
                  <i className="ri-arrow-down-s-line text-gray-400"></i>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="text-xs text-gray-500 mb-1">Signed in as</div>
                      <div className="font-semibold text-gray-800 truncate">{currentUser.email}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false)
                        setShowProfileModal(true)
                        setProfileForm({
                          name: currentUser?.name || '',
                          email: currentUser?.email || '',
                        })
                      }}
                      className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition flex items-center gap-2"
                    >
                      <i className="ri-user-settings-line"></i>
                      Update Profile
                    </button>
                    <button
                      type="button"
                      onClick={logOut}
                      className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-b-xl transition flex items-center gap-2"
                    >
                      <i className="ri-logout-circle-line"></i>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to={routes.login()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Button - Hamburger Style */}
          <button 
            className="md:hidden flex flex-col items-center justify-center p-3 rounded-lg hover:bg-gray-100 transition-colors z-50 group"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
            style={{ minWidth: '44px', minHeight: '44px' }}
          >
            <div className="relative w-6 h-5">
              {/* Top line */}
              <span className={`absolute block w-6 h-0.5 bg-gray-700 transform transition-all duration-300 ${
                mobileMenuOpen 
                  ? 'rotate-45 translate-y-2' 
                  : 'translate-y-0'
              }`}></span>
              
              {/* Middle line */}
              <span className={`absolute block w-6 h-0.5 bg-gray-700 transform transition-all duration-300 translate-y-2 ${
                mobileMenuOpen 
                  ? 'opacity-0' 
                  : 'opacity-100'
              }`}></span>
              
              {/* Bottom line */}
              <span className={`absolute block w-6 h-0.5 bg-gray-700 transform transition-all duration-300 ${
                mobileMenuOpen 
                  ? '-rotate-45 translate-y-2' 
                  : 'translate-y-4'
              }`}></span>
            </div>
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 shadow-xl border-t border-blue-200 z-40 backdrop-blur-md">
            <div className="px-4 py-4 space-y-2">
              <Link
                to={routes.home()}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-white/70 hover:text-blue-600 font-medium transition-all duration-200 group shadow-sm hover:shadow-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center group-hover:from-blue-500 group-hover:to-blue-700 transition-all shadow-sm">
                  <i className="ri-home-4-line text-lg text-white"></i>
                </div>
                <span>Home</span>
              </Link>
              
              <div className="space-y-2">
                <div className="flex items-center gap-3 px-4 py-2 bg-white/30 rounded-xl backdrop-blur-sm">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-400 to-purple-600 flex items-center justify-center shadow-sm">
                    <i className="ri-stack-line text-lg text-white"></i>
                  </div>
                  <span className="font-semibold text-gray-800">Resources</span>
                </div>
                <div className="ml-14 space-y-1">
                  <Link
                    to={routes.assetTracker()}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-white/60 hover:text-purple-600 transition-all duration-200 hover:shadow-sm"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <i className="ri-computer-line text-lg"></i>
                    <span>Assets</span>
                  </Link>
                  <Link
                    to={routes.officeSupplies()}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-white/60 hover:text-purple-600 transition-all duration-200 hover:shadow-sm"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <i className="ri-archive-line text-lg"></i>
                    <span>Supplies</span>
                  </Link>
                  <Link
                    to={routes.supplyRequests()}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-white/60 hover:text-purple-600 transition-all duration-200 hover:shadow-sm"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <i className="ri-shopping-cart-line text-lg"></i>
                    <span>Supply Requests</span>
                  </Link>
                </div>
              </div>
              
              <Link
                to={routes.projectTracker()}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-white/70 hover:text-orange-600 font-medium transition-all duration-200 group shadow-sm hover:shadow-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-orange-400 to-orange-600 flex items-center justify-center group-hover:from-orange-500 group-hover:to-orange-700 transition-all shadow-sm">
                  <i className="ri-project-line text-lg text-white"></i>
                </div>
                <span>Projects</span>
              </Link>
              
              {hasRole && hasRole('ADMIN') && (
                <Link
                  to={routes.adminPanel()}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-white/70 hover:text-red-600 font-medium transition-all duration-200 group shadow-sm hover:shadow-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-red-400 to-red-600 flex items-center justify-center group-hover:from-red-500 group-hover:to-red-700 transition-all shadow-sm">
                    <i className="ri-admin-line text-lg text-white"></i>
                  </div>
                  <span>Admin Panel</span>
                </Link>
              )}
              
              {/* Mobile User Profile Section */}
              {isAuthenticated ? (
                <div className="border-t border-white/30 mt-4 pt-4">
                  <div className="px-4 py-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl mb-3 backdrop-blur-sm border border-white/40 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
                        <span className="text-white text-lg font-bold">
                          {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-800">{currentUser?.name || 'User'}</div>
                        <div className="text-xs text-gray-600">{hasRole && hasRole('ADMIN') ? 'Admin' : 'Employee'}</div>
                        <div className="text-xs text-gray-500 mt-1">{currentUser?.email}</div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false)
                        setShowProfileModal(true)
                        setProfileForm({
                          name: currentUser?.name || '',
                          email: currentUser?.email || '',
                        })
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-white/60 transition-all duration-200 rounded-xl hover:shadow-sm"
                    >
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-gray-400 to-gray-600 flex items-center justify-center shadow-sm">
                        <i className="ri-user-settings-line text-lg text-white"></i>
                      </div>
                      <span>Update Profile</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false)
                        logOut()
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-white/60 transition-all duration-200 rounded-xl hover:shadow-sm"
                    >
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-red-400 to-red-600 flex items-center justify-center shadow-sm">
                        <i className="ri-logout-circle-line text-lg text-white"></i>
                      </div>
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border-t border-white/30 mt-4 pt-4">
                  <Link
                    to={routes.login()}
                    className="flex items-center justify-center gap-3 mx-4 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:scale-105"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <i className="ri-login-circle-line text-lg"></i>
                    <span>Sign In</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Access Tab Bar - Only on Dashboard */}
        {showQuickAccess && (
          <div className="border-t border-gray-200 bg-gray-50">
            <div className="flex overflow-x-auto">
              <a
                href="#bookings-section"
                onClick={handleScroll('bookings-section')}
                className="flex-shrink-0 px-6 py-3 text-center text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-white transition-all duration-200 border-b-2 border-transparent hover:border-blue-600"
              >
                <div className="flex items-center gap-2">
                  <i className="ri-calendar-line"></i>
                  <span>Bookings</span>
                </div>
              </a>
              <a
                href="#attendance-section"
                onClick={handleScroll('attendance-section')}
                className="flex-shrink-0 px-6 py-3 text-center text-sm font-medium text-gray-600 hover:text-green-600 hover:bg-white transition-all duration-200 border-b-2 border-transparent hover:border-green-600"
              >
                <div className="flex items-center gap-2">
                  <i className="ri-time-line"></i>
                  <span>Attendance</span>
                </div>
              </a>
              <a
                href="#vacation-section"
                onClick={handleScroll('vacation-section')}
                className="flex-shrink-0 px-6 py-3 text-center text-sm font-medium text-gray-600 hover:text-purple-600 hover:bg-white transition-all duration-200 border-b-2 border-transparent hover:border-purple-600"
              >
                <div className="flex items-center gap-2">
                  <i className="ri-calendar-event-line"></i>
                  <span>Vacation</span>
                </div>
              </a>
            </div>
          </div>
        )}
      </header>
    </>
  )
}

export default Header
