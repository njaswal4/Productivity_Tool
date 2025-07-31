import React, { useState, useEffect } from 'react'

const DailyUpdateDialog = ({
  isOpen,
  onClose,
  onSubmit,
  allocation,
  existingUpdate,
  selectedDate,
}) => {
  const [formData, setFormData] = useState({
    description: '',
    hoursWorked: '',
    blockers: '',
    nextDayPlan: '',
    completionPercentage: '',
    milestoneReached: '',
  })

  useEffect(() => {
    if (existingUpdate) {
      setFormData({
        description: existingUpdate.description || '',
        hoursWorked: existingUpdate.hoursWorked || '',
        blockers: existingUpdate.blockers || '',
        nextDayPlan: existingUpdate.nextDayPlan || '',
        completionPercentage: existingUpdate.completionPercentage || '',
        milestoneReached: existingUpdate.milestoneReached || '',
      })
    } else {
      setFormData({
        description: '',
        hoursWorked: '',
        blockers: '',
        nextDayPlan: '',
        completionPercentage: '',
        milestoneReached: '',
      })
    }
  }, [existingUpdate, isOpen])

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.description.trim()) {
      alert('Please provide a status update')
      return
    }

    const updateData = {
      description: formData.description.trim(),
      hoursWorked: formData.hoursWorked ? parseFloat(formData.hoursWorked) : null,
      blockers: formData.blockers.trim() || null,
      nextDayPlan: formData.nextDayPlan.trim() || null,
      completionPercentage: formData.completionPercentage ? parseFloat(formData.completionPercentage) : null,
      milestoneReached: formData.milestoneReached.trim() || null,
    }

    onSubmit(updateData)
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (!isOpen || !allocation) return null

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {existingUpdate ? 'Update' : 'Submit'} Daily Status
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {allocation.project.name} ({allocation.project.code}) - {new Date(selectedDate).toLocaleDateString()}
              </p>
              {/* Hours Allocation Info */}
              <div className="mt-2 p-2 bg-blue-50 rounded-md">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-blue-700">
                    <strong>Role:</strong> {allocation.role}
                  </span>
                  <span className="text-blue-700">
                    <strong>Allocated Hours:</strong> {allocation.hoursAllocated}h/day
                  </span>
                </div>
                {existingUpdate && (
                  <div className="mt-1 text-xs text-blue-600">
                    Previously logged: {existingUpdate.hoursWorked || 0}h
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Status Update */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What did you accomplish today? *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Describe what you worked on, completed, or progressed on this project today..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              required
            />
          </div>

          {/* Hours Worked */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hours Worked Today *
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="24"
                value={formData.hoursWorked}
                onChange={(e) => handleChange('hoursWorked', e.target.value)}
                placeholder={`Allocated: ${allocation.hoursAllocated}h`}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Actual hours worked on this project today
              </p>
              {formData.hoursWorked && allocation.hoursAllocated && (
                <div className={`text-xs mt-1 ${
                  parseFloat(formData.hoursWorked) > allocation.hoursAllocated 
                    ? 'text-orange-600' 
                    : parseFloat(formData.hoursWorked) === allocation.hoursAllocated
                      ? 'text-green-600'
                      : 'text-blue-600'
                }`}>
                  {parseFloat(formData.hoursWorked) > allocation.hoursAllocated && 
                    `+${(parseFloat(formData.hoursWorked) - allocation.hoursAllocated).toFixed(1)}h over allocated`}
                  {parseFloat(formData.hoursWorked) === allocation.hoursAllocated && 
                    'Matches allocated hours ✓'}
                  {parseFloat(formData.hoursWorked) < allocation.hoursAllocated && 
                    `${(allocation.hoursAllocated - parseFloat(formData.hoursWorked)).toFixed(1)}h under allocated`}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Completion %
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.completionPercentage}
                onChange={(e) => handleChange('completionPercentage', e.target.value)}
                placeholder="e.g., 75"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Blockers */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Blockers or Issues
            </label>
            <textarea
              value={formData.blockers}
              onChange={(e) => handleChange('blockers', e.target.value)}
              placeholder="Any obstacles, dependencies, or issues that are blocking your progress..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          {/* Next Day Plan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Plan for Next Day
            </label>
            <textarea
              value={formData.nextDayPlan}
              onChange={(e) => handleChange('nextDayPlan', e.target.value)}
              placeholder="What do you plan to work on next for this project..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          {/* Milestone Reached */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Milestone or Achievement
            </label>
            <input
              type="text"
              value={formData.milestoneReached}
              onChange={(e) => handleChange('milestoneReached', e.target.value)}
              placeholder="Any significant milestone, deliverable, or achievement today..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {existingUpdate ? 'Update Status' : 'Submit Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default DailyUpdateDialog
