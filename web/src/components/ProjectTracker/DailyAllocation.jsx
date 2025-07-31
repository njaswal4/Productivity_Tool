import React, { useState } from 'react'
import { useMutation, gql } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'
import DailyUpdateDialog from '../Dialog/DailyUpdateDialog'

const CREATE_DAILY_UPDATE_MUTATION = gql`
  mutation CreateDailyProjectUpdate($input: CreateDailyProjectUpdateInput!) {
    createDailyProjectUpdate(input: $input) {
      id
      description
      hoursWorked
      blockers
      nextDayPlan
      completionPercentage
      milestoneReached
    }
  }
`

const UPDATE_DAILY_UPDATE_MUTATION = gql`
  mutation UpdateDailyProjectUpdate($id: Int!, $input: UpdateDailyProjectUpdateInput!) {
    updateDailyProjectUpdate(id: $id, input: $input) {
      id
      description
      hoursWorked
      blockers
      nextDayPlan
      completionPercentage
      milestoneReached
    }
  }
`

const DailyAllocation = ({
  allocations,
  loading,
  selectedDate,
  currentUser,
  onRefresh,
  formatDate,
  getStatusBadgeColor,
  getPriorityBadgeColor,
}) => {
  const [updateDialog, setUpdateDialog] = useState({ isOpen: false, allocation: null, existingUpdate: null })

  const [createDailyUpdate] = useMutation(CREATE_DAILY_UPDATE_MUTATION, {
    onCompleted: () => {
      toast.success('Daily update submitted successfully')
      setUpdateDialog({ isOpen: false, allocation: null, existingUpdate: null })
      onRefresh()
    },
    onError: (error) => {
      toast.error(`Error submitting update: ${error.message}`)
    },
  })

  const [updateDailyUpdate] = useMutation(UPDATE_DAILY_UPDATE_MUTATION, {
    onCompleted: () => {
      toast.success('Daily update updated successfully')
      setUpdateDialog({ isOpen: false, allocation: null, existingUpdate: null })
      onRefresh()
    },
    onError: (error) => {
      toast.error(`Error updating: ${error.message}`)
    },
  })

  const handleUpdateSubmit = async (updateData) => {
    // Create a proper UTC date for the selected date
    const selectedDateUTC = new Date(selectedDate)
    selectedDateUTC.setUTCHours(0, 0, 0, 0) // Set to start of day in UTC
    
    const input = {
      ...updateData,
      allocationId: updateDialog.allocation.id,
      projectId: updateDialog.allocation.projectId,
      date: selectedDateUTC.toISOString(),
    }

    try {
      if (updateDialog.existingUpdate) {
        await updateDailyUpdate({
          variables: {
            id: updateDialog.existingUpdate.id,
            input: updateData,
          },
        })
      } else {
        await createDailyUpdate({
          variables: { input },
        })
      }
    } catch (error) {
      console.error('Error submitting update:', error)
    }
  }

  const openUpdateDialog = (allocation) => {
    const existingUpdate = allocation.dailyUpdates?.[0] || null
    setUpdateDialog({
      isOpen: true,
      allocation,
      existingUpdate,
    })
  }

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading your daily allocations...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Date Header */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-blue-900">
          Daily Allocations for {formatDate(selectedDate)}
        </h2>
        <p className="text-sm text-blue-700 mt-1">
          {allocations.length} project{allocations.length !== 1 ? 's' : ''} assigned
        </p>
      </div>

      {/* No Allocations */}
      {allocations.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📅</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Project Allocations</h3>
          <p className="text-gray-500">
            You don't have any project allocations for this date.
          </p>
        </div>
      )}

      {/* Allocations Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {allocations.map((allocation) => {
          const existingUpdate = allocation.dailyUpdates?.[0]
          const hasUpdate = !!existingUpdate

          return (
            <div
              key={allocation.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              {/* Project Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {allocation.project.name}
                  </h3>
                  <p className="text-sm text-gray-500">{allocation.project.code}</p>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(allocation.project.status)}`}>
                    {allocation.project.status}
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityBadgeColor(allocation.project.priority)}`}>
                    {allocation.project.priority}
                  </span>
                </div>
              </div>

              {/* Role and Hours */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Role:</span>
                  <span className="font-medium">{allocation.role || 'Team Member'}</span>
                </div>
                {allocation.hoursAllocated && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Allocated Hours:</span>
                    <span className="font-medium">{allocation.hoursAllocated}h</span>
                  </div>
                )}
              </div>

              {/* Project Manager */}
              {allocation.project.manager && (
                <div className="mb-4 text-sm">
                  <span className="text-gray-600">Manager: </span>
                  <span className="font-medium">{allocation.project.manager.name}</span>
                </div>
              )}

              {/* Today's Meetings */}
              {allocation.project.meetings.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Today's Meetings</h4>
                  <div className="space-y-2">
                    {allocation.project.meetings.map((meeting) => (
                      <div key={meeting.id} className="bg-gray-50 rounded p-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{meeting.title}</span>
                          <span className="text-xs text-gray-500">
                            {formatTime(meeting.meetingDate)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{meeting.meetingType}</span>
                          <span>{meeting.duration} min</span>
                        </div>
                        {meeting.location && (
                          <div className="text-xs text-gray-500 mt-1">
                            📍 {meeting.location}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Daily Update Status */}
              <div className="mb-4">
                {hasUpdate ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center mb-2">
                      <div className="text-green-600 mr-2">✅</div>
                      <span className="text-sm font-medium text-green-800">Update Submitted</span>
                    </div>
                    <p className="text-sm text-green-700 line-clamp-2">
                      {existingUpdate.description}
                    </p>
                    {existingUpdate.hoursWorked && (
                      <p className="text-xs text-green-600 mt-1">
                        Hours worked: {existingUpdate.hoursWorked}h
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-center">
                      <div className="text-yellow-600 mr-2">⏳</div>
                      <span className="text-sm font-medium text-yellow-800">Update Pending</span>
                    </div>
                    <p className="text-sm text-yellow-700 mt-1">
                      Daily status update not submitted yet
                    </p>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <button
                onClick={() => openUpdateDialog(allocation)}
                className={`w-full px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  hasUpdate
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {hasUpdate ? 'Update Status' : 'Submit Daily Update'}
              </button>
            </div>
          )
        })}
      </div>

      {/* Daily Update Dialog */}
      <DailyUpdateDialog
        isOpen={updateDialog.isOpen}
        onClose={() => setUpdateDialog({ isOpen: false, allocation: null, existingUpdate: null })}
        onSubmit={handleUpdateSubmit}
        allocation={updateDialog.allocation}
        existingUpdate={updateDialog.existingUpdate}
        selectedDate={selectedDate}
      />
    </div>
  )
}

export default DailyAllocation
