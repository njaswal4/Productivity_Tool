import React, { useEffect, useState } from 'react'

const OFFICE_LOCATION = { lat: 43.83027302678366, lng: -79.63688830742664 } // Your real office location
const OFFICE_RADIUS_METERS = 1000 // Set to 100 for production use

function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

const LocationStatus = ({ onLocationCheck }) => {
  const [isAtOffice, setIsAtOffice] = useState(null)
  const [locationError, setLocationError] = useState(null)

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        const distance = getDistanceFromLatLonInMeters(
          latitude,
          longitude,
          OFFICE_LOCATION.lat,
          OFFICE_LOCATION.lng
        )
        const atOffice = distance <= OFFICE_RADIUS_METERS
        setIsAtOffice(atOffice)
        if (onLocationCheck) onLocationCheck(atOffice)

        // Debugging logs
        console.log("User location:", latitude, longitude)
        console.log("Office location:", OFFICE_LOCATION.lat, OFFICE_LOCATION.lng)
        console.log("Distance (meters):", distance)
      },
      (error) => {
        setLocationError('Unable to get your location.')
        setIsAtOffice(false)
        if (onLocationCheck) onLocationCheck(false)
      }
    )
    // eslint-disable-next-line
  }, [])

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 m-2 mb-6 flex items-center">
      <div className="w-10 h-10 flex items-center justify-center bg-green-100 rounded-full mr-4">
        <i className="ri-map-pin-line text-green-600 ri-lg"></i>
      </div>
      <div>
        <div className="flex items-center">
          <span className="font-medium text-gray-900">Office Location Status:</span>
          <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
            On Premises
          </span>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          You are currently at the main office location
        </p>
      </div>
    </div>
  )
}

export default LocationStatus
