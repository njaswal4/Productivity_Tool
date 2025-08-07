import React, { useState } from 'react'
import { useQuery, gql } from '@redwoodjs/web'
import { useAuth } from 'src/auth'
import ProjectManagement from './ProjectManagement'
import DailyAllocation from './DailyAllocation'
import ProjectReports from './ProjectReports'
import EmployeeManagement from './EmployeeManagement'

const DAILY_ALLOCATIONS_QUERY = gql`
  query DailyAllocationsQuery($userId: Int!, $date: DateTime!) {
    dailyAllocations(userId: $userId, date: $date) {
      id
      projectId
      role
      hoursAllocated
      project {
        id
        name
        code
        status
        priority
        manager {
          name
          email
        }
        meetings {
          id
          title
          meetingDate
          duration
          meetingType
          location
        }
      }
      dailyUpdates {
        id
        description
        hoursWorked
        blockers
        nextDayPlan
        completionPercentage
        milestoneReached
      }
    }
  }
`

const PROJECTS_OVERVIEW_QUERY = gql`
  query ProjectsOverviewQuery {
    activeProjects {
      id
      name
      code
      status
      priority
      startDate
      endDate
      manager {
        name
        email
      }
      allocations {
        id
        user {
          name
          email
        }
        role
        hoursAllocated
        isActive
      }
    }
  }
`

const ProjectTracker = () => {
  const { currentUser } = useAuth()
  const [activeTab, setActiveTab] = useState('daily')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  const isAdmin = currentUser?.roles?.includes('ADMIN')

  const { data: allocationsData, loading: allocationsLoading, refetch: refetchAllocations } = useQuery(
    DAILY_ALLOCATIONS_QUERY,
    {
      variables: {
        userId: currentUser?.id,
        date: new Date(selectedDate + 'T12:00:00').toISOString(),
      },
      skip: !currentUser?.id,
    }
  )

  const { data: projectsData, loading: projectsLoading, refetch: refetchProjects } = useQuery(
    PROJECTS_OVERVIEW_QUERY,
    {
      skip: !isAdmin,
    }
  )

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC',
    })
  }

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800'
      case 'On Hold':
        return 'bg-yellow-100 text-yellow-800'
      case 'Completed':
        return 'bg-blue-100 text-blue-800'
      case 'Cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityBadgeColor = (priority) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-100 text-red-800'
      case 'High':
        return 'bg-orange-100 text-orange-800'
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'Low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const tabs = [
    { id: 'daily', name: 'Daily Tracker', icon: '📅' },
    ...(isAdmin ? [
      { id: 'management', name: 'Project Management', icon: '⚙️' },
      { id: 'employees', name: 'Employee Management', icon: '👥' },
    ] : []),
    { id: 'reports', name: 'Reports', icon: '📊' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pt-32 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl p-8 mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Project Management
              </h1>
              <p className="text-gray-600 mt-2">Track daily allocations, project progress, and meeting schedules</p>
            </div>
            
            {/* Date Selector for Daily View */}
            {activeTab === 'daily' && (
              <div className="flex items-center space-x-4 bg-white/50 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20">
                <label className="text-sm font-semibold text-gray-700">Date:</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-white/80 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-6 border-b border-white/20 pb-4 mb-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`font-medium pb-2 border-b-2 transition-colors duration-200 flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-blue-600'
                    : 'text-gray-600 border-transparent hover:text-blue-600 hover:border-blue-600'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'daily' && (
            <DailyAllocation
              allocations={allocationsData?.dailyAllocations || []}
              loading={allocationsLoading}
              selectedDate={selectedDate}
              currentUser={currentUser}
              onRefresh={refetchAllocations}
              formatDate={formatDate}
              getStatusBadgeColor={getStatusBadgeColor}
              getPriorityBadgeColor={getPriorityBadgeColor}
            />
          )}

          {activeTab === 'management' && isAdmin && (
            <ProjectManagement
              projects={projectsData?.activeProjects || []}
              loading={projectsLoading}
              onRefresh={refetchProjects}
              getStatusBadgeColor={getStatusBadgeColor}
              getPriorityBadgeColor={getPriorityBadgeColor}
            />
          )}

          {activeTab === 'employees' && isAdmin && (
            <EmployeeManagement />
          )}

          {activeTab === 'reports' && (
            <ProjectReports
              currentUser={currentUser}
              isAdmin={isAdmin}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default ProjectTracker
