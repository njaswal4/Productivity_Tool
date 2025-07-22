// src/components/WelcomeSection/WelcomeSection.js

import React, { useState, useEffect } from 'react'
import { useQuery, gql } from '@redwoodjs/web'
import { useAuth } from 'src/auth'

const WelcomeSection = () => {
  const [currentTime, setCurrentTime] = useState("")
  const { currentUser} = useAuth()



  useEffect(() => {
    // Updates the current time every minute
    const updateTime = () => {
      const now = new Date()
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
      const dateString = now.toLocaleDateString(undefined, options)
      const timeString = now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true })
      setCurrentTime(`${dateString} | ${timeString}`)
    }
    updateTime()
    const intervalId = setInterval(updateTime, 60000)
    return () => clearInterval(intervalId)
  }, [])

  // Get username from email
  const Name = currentUser?.name || currentUser?.email || 'User'

  return (
    <div className="relative z-30 flex flex-col md:flex-row items-start md:items-center justify-between mb-8 mt-32">
           
      <div>
       
        <h1 className="text-2xl font-bold text-gray-900">
         Welcome, {Name}!
        </h1>
        <p className="text-gray-600 mt-1">{currentTime}</p>
      </div>
      <div className="mt-4 md:mt-0"></div>
    </div>
  )
}

export default WelcomeSection
