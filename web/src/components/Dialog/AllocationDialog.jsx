import React, { useState } from 'react'

const AllocationDialog = ({ isOpen, onClose, onSubmit, project, users = [] }) => {
  const [formData, setFormData] = useState({
    userId: '',
    role: '',
    hoursAllocated: '',
    isActive: true,
  })

  const [errors, setErrors] = useState({})

  const roles = [
    'Project Manager',
    'Lead Developer',
    'Senior Developer',
    'Developer',
    'Frontend Developer',
    'Backend Developer',
    'DevOps Engineer',
    'QA Engineer',
    'Designer',
    'Business Analyst',
    'Architect',
    'Consultant',
  ]

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.userId) {
      newErrors.userId = 'Please select a team member'
    }

    if (!formData.role.trim()) {
      newErrors.role = 'Role is required'
    }

    if (!formData.hoursAllocated) {
      newErrors.hoursAllocated = 'Hours per day is required'
    } else if (isNaN(parseFloat(formData.hoursAllocated)) || parseFloat(formData.hoursAllocated) <= 0) {
      newErrors.hoursAllocated = 'Hours must be a positive number'
    } else if (parseFloat(formData.hoursAllocated) > 24) {
      newErrors.hoursAllocated = 'Hours cannot exceed 24 per day'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    const submitData = {
      projectId: project.id,
      userId: parseInt(formData.userId),
      role: formData.role.trim(),
      hoursAllocated: parseFloat(formData.hoursAllocated),
      isActive: formData.isActive,
    }

    onSubmit(submitData)
    handleReset()
  }

  const handleReset = () => {
    setFormData({
      userId: '',
      role: '',
      hoursAllocated: '',
      isActive: true,
    })
    setErrors({})
  }

  const handleClose = () => {
    handleReset()
    onClose()
  }

  // Filter out users who are already allocated to this project
  const availableUsers = users.filter(user => 
    !project?.allocations?.some(allocation => 
      allocation.user.id === user.id && allocation.isActive
    )
  )

  if (!isOpen || !project) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Allocate Team Member</h2>
            <p className="text-sm text-gray-600 mt-1">
              {project.name} ({project.code})
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Team Member Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Team Member *
            </label>
            <select
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.userId ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select a team member</option>
              {availableUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
            {errors.userId && <p className="text-red-500 text-xs mt-1">{errors.userId}</p>}
            {availableUsers.length === 0 && (
              <p className="text-yellow-600 text-xs mt-1">
                All users are already allocated to this project
              </p>
            )}
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role *
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.role ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select a role</option>
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
          </div>

          {/* Hours Allocated */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hours per Day *
            </label>
            <input
              type="number"
              name="hoursAllocated"
              value={formData.hoursAllocated}
              onChange={handleChange}
              min="0.5"
              max="24"
              step="0.5"
              className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.hoursAllocated ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., 8"
            />
            {errors.hoursAllocated && <p className="text-red-500 text-xs mt-1">{errors.hoursAllocated}</p>}
            <p className="text-xs text-gray-500 mt-1">
              Number of hours per day allocated to this project
            </p>
          </div>

          {/* Active Status */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label className="ml-2 text-sm text-gray-700">
              Active allocation (team member can log time immediately)
            </label>
          </div>

          {/* Current Allocations Info */}
          {project.allocations && project.allocations.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-3">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Current Team:</h4>
              <div className="space-y-1">
                {project.allocations.map((allocation) => (
                  <div key={allocation.id} className="flex items-center justify-between text-xs">
                    <span className="text-gray-700">
                      {allocation.user.name} - {allocation.role}
                    </span>
                    <span className={`px-2 py-1 rounded-full ${
                      allocation.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {allocation.hoursAllocated}h/day
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={availableUsers.length === 0}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Allocate Member
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AllocationDialog
