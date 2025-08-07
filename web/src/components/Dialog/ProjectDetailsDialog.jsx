import React, { useState } from 'react'
import { useMutation, gql } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

const DELETE_ALLOCATION_MUTATION = gql`
  mutation DeleteProjectAllocation($id: Int!) {
    deleteProjectAllocation(id: $id) {
      id
      user {
        name
      }
      project {
        name
      }
    }
  }
`

// Confirmation Dialog Component
const ConfirmationDialog = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-6">{message}</p>
        <div className="flex space-x-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  )
}

const ProjectDetailsDialog = ({ isOpen, onClose, project, onRefresh }) => {
  const [removeDialog, setRemoveDialog] = useState({ isOpen: false, allocationId: null, userName: '' })

  const [deleteAllocation] = useMutation(DELETE_ALLOCATION_MUTATION, {
    onCompleted: (data) => {
      toast.success(`${data.deleteProjectAllocation.user.name} removed from ${data.deleteProjectAllocation.project.name}`)
      if (onRefresh) onRefresh()
      setRemoveDialog({ isOpen: false, allocationId: null, userName: '' })
    },
    onError: (error) => {
      toast.error(`Error removing team member: ${error.message}`)
    },
  })
  const handleRemoveAllocation = (allocationId, userName) => {
    setRemoveDialog({ isOpen: true, allocationId, userName })
  }

  const confirmRemoveAllocation = async () => {
    try {
      await deleteAllocation({
        variables: { id: removeDialog.allocationId },
      })
    } catch (error) {
      console.error('Error removing allocation:', error)
    }
  }

  if (!isOpen || !project) return null

  const getStatusBadgeColor = (status) => {
    const colors = {
      ACTIVE: 'bg-green-100 text-green-800',
      COMPLETED: 'bg-blue-100 text-blue-800',
      ON_HOLD: 'bg-yellow-100 text-yellow-800',
      CANCELLED: 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getPriorityBadgeColor = (priority) => {
    const colors = {
      LOW: 'bg-green-100 text-green-800',
      MEDIUM: 'bg-yellow-100 text-yellow-800',
      HIGH: 'bg-orange-100 text-orange-800',
      CRITICAL: 'bg-red-100 text-red-800',
    }
    return colors[priority] || 'bg-gray-100 text-gray-800'
  }

  const getTotalAllocatedHours = () => {
    return project.allocations?.reduce((total, allocation) => 
      total + (allocation.hoursAllocated || 0), 0) || 0
  }

  const getActiveAllocationsCount = () => {
    return project.allocations?.filter(allocation => allocation.isActive).length || 0
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{project.name}</h3>
              <p className="text-sm text-gray-500 mt-1">Project Code: {project.code}</p>
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

        <div className="p-6">
          {/* Project Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900">Project Information</h4>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Status:</span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(project.status)}`}>
                    {project.status}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Priority:</span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityBadgeColor(project.priority)}`}>
                    {project.priority}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Start Date:</span>
                  <span className="text-sm text-gray-900">
                    {new Date(project.startDate).toLocaleDateString('en-GB', { timeZone: 'UTC' })}
                  </span>
                </div>
                
                {project.endDate && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">End Date:</span>
                    <span className="text-sm text-gray-900">
                      {new Date(project.endDate).toLocaleDateString('en-GB', { timeZone: 'UTC' })}
                    </span>
                  </div>
                )}
                
                {project.manager && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Manager:</span>
                    <span className="text-sm text-gray-900">{project.manager.name}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900">Allocation Summary</h4>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Active Team Members:</span>
                  <span className="text-sm font-semibold text-blue-600">
                    {getActiveAllocationsCount()}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Total Hours/Day:</span>
                  <span className="text-sm font-semibold text-blue-600">
                    {getTotalAllocatedHours()}h
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Total Allocations:</span>
                  <span className="text-sm text-gray-900">
                    {project.allocations?.length || 0}
                  </span>
                </div>
                
                {project.budget && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Budget:</span>
                    <span className="text-sm text-gray-900">
                      ${project.budget.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Project Description */}
          {project.description && (
            <div className="mb-8">
              <h4 className="text-lg font-medium text-gray-900 mb-3">Description</h4>
              <p className="text-sm text-gray-600 leading-relaxed">{project.description}</p>
            </div>
          )}

          {/* Team Allocations */}
          <div className="mb-8">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Team Allocations</h4>
            
            {project.allocations && project.allocations.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Team Member
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hours/Day
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Allocated Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {project.allocations.map((allocation) => (
                      <tr key={allocation.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                              {allocation.user.name.charAt(0)}
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {allocation.user.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {allocation.user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {allocation.role || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {allocation.hoursAllocated || 0}h
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {allocation.allocatedDate ? new Date(allocation.allocatedDate).toLocaleDateString('en-GB', { timeZone: 'UTC' }) : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            allocation.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {allocation.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleRemoveAllocation(allocation.id, allocation.user.name)}
                            className="text-red-600 hover:text-red-900"
                            title="Remove from project"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-2">👥</div>
                <p className="text-gray-500">No team members allocated to this project yet.</p>
              </div>
            )}
          </div>

          {/* Recent Updates Summary */}
          {project.dailyUpdates && project.dailyUpdates.length > 0 && (
            <div className="mb-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Recent Updates</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">
                  Total daily updates: {project.dailyUpdates.length}
                </p>
                <p className="text-sm text-gray-600">
                  Last update: {new Date(project.dailyUpdates[0]?.updateDate).toLocaleDateString('en-US', { timeZone: 'UTC' })}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Close
          </button>
        </div>
      </div>

      {/* Remove Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={removeDialog.isOpen}
        onClose={() => setRemoveDialog({ isOpen: false, allocationId: null, userName: '' })}
        onConfirm={confirmRemoveAllocation}
        title="Remove Team Member"
        message={`Are you sure you want to remove ${removeDialog.userName} from this project? This action cannot be undone.`}
      />
    </div>
  )
}

export default ProjectDetailsDialog
