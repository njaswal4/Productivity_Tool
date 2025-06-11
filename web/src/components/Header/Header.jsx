import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from 'src/auth'
import { Link, routes } from '@redwoodjs/router'

const Header = ({ isAdmin }) => {
  const { isAuthenticated, currentUser, logOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

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

  return (
    <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <img src="https://2cretiv.com/wp-content/uploads/2024/10/WhatsApp-Image-2024-10-14-at-1.54.56-PM-4.jpeg"
          className="flex h-10 w-20 rounded-full"
          alt="Logo"
          loading="lazy"
          onClick={() => window.location.href = routes.home()}
          >
          </img>
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
          href="/dashboard"
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
  )
}

export default Header
