import { useEffect } from 'react'
import { useAuth } from 'src/auth'
import { navigate, routes } from '@redwoodjs/router'
import { MetaTags } from '@redwoodjs/web'

const LoginPage = () => {
  const { isAuthenticated, loading, login } = useAuth()

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate(routes.home())
    }
  }, [isAuthenticated, loading])

  useEffect(() => {
  if (!loading && !isAuthenticated) {
    login()
  }
}, [isAuthenticated, loading, login])

  return (
    <>
      <MetaTags title="Login" description="Login page" />
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md space-y-8">
          <div className="text-center">
            <img
              src="https://2cretiv.com/wp-content/uploads/2024/10/WhatsApp-Image-2024-10-14-at-1.54.56-PM-4.jpeg"
              className="mx-auto h-20"
              alt="2Creative Logo"
            />
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Productivity Tool
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Sign in with your Microsoft 2Creative account
            </p>
          </div>
          <div className="mt-8">
            <button
              onClick={login}
              className="flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none"
            >
              <svg className="mr-2 h-5 w-5" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 0H0V10H10V0Z" fill="#F25022"/>
                <path d="M21 0H11V10H21V0Z" fill="#7FBA00"/>
                <path d="M10 11H0V21H10V11Z" fill="#00A4EF"/>
                <path d="M21 11H11V21H21V11Z" fill="#FFB900"/>
              </svg>
              Sign in with Microsoft
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default LoginPage