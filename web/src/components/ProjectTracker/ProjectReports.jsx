import React, { useState, useMemo } from 'react'
import { useQuery, gql } from '@redwoodjs/web'

const PROJECT_REPORTS_QUERY = gql`
  query ProjectReportsQuery($startDate: DateTime!, $endDate: DateTime!) {
    projects {
      id
      name
      code
      status
      priority
      startDate
      endDate
      manager {
        name
      }
      allocations {
        id
        hoursAllocated
        isActive
        user {
          id
          name
        }
      }
    }
    dailyProjectUpdates(startDate: $startDate, endDate: $endDate) {
      id
      date
      status
      hoursWorked
      description
      blockers
      user {
        id
        name
        email
      }
      project {
        id
        name
        code
      }
    }
  }
`

const ProjectReports = () => {
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    end: new Date().toISOString().split('T')[0], // today
  })

  const { data, loading, error } = useQuery(PROJECT_REPORTS_QUERY, {
    variables: {
      startDate: new Date(dateRange.start + 'T00:00:00.000Z'),
      endDate: new Date(dateRange.end + 'T23:59:59.999Z'),
    },
  })

  const reports = useMemo(() => {
    if (!data) return null

    const projects = data.projects || []
    const updates = data.dailyProjectUpdates || []

    // Project Status Summary
    const statusSummary = projects.reduce((acc, project) => {
      acc[project.status] = (acc[project.status] || 0) + 1
      return acc
    }, {})

    // Priority Distribution
    const prioritySummary = projects.reduce((acc, project) => {
      acc[project.priority] = (acc[project.priority] || 0) + 1
      return acc
    }, {})

    // Allocation Summary
    const allocationSummary = projects.reduce((acc, project) => {
      const activeAllocations = project.allocations.filter(a => a.isActive)
      const totalHours = activeAllocations.reduce((sum, a) => sum + (a.hoursAllocated || 0), 0)
      
      acc.totalProjects += 1
      acc.totalActiveAllocations += activeAllocations.length
      acc.totalHoursPerDay += totalHours
      
      return acc
    }, { totalProjects: 0, totalActiveAllocations: 0, totalHoursPerDay: 0 })

    // Daily Updates Summary
    const updatesSummary = updates.reduce((acc, update) => {
      const status = update.status
      acc[status] = (acc[status] || 0) + 1
      acc.totalHours += update.hoursWorked || 0
      acc.totalUpdates += 1
      return acc
    }, { totalHours: 0, totalUpdates: 0 })

    // Project Progress Analysis
    const projectProgress = projects.map(project => {
      const projectUpdates = updates.filter(u => u.project.id === project.id)
      const totalHours = projectUpdates.reduce((sum, u) => sum + (u.hoursWorked || 0), 0)
      const averageHours = projectUpdates.length > 0 ? totalHours / projectUpdates.length : 0
      
      const statusDistribution = projectUpdates.reduce((acc, update) => {
        acc[update.status] = (acc[update.status] || 0) + 1
        return acc
      }, {})

      const blockers = projectUpdates.filter(u => u.blockers && u.blockers.trim()).length

      return {
        ...project,
        metrics: {
          totalUpdates: projectUpdates.length,
          totalHours,
          averageHours: Math.round(averageHours * 10) / 10,
          statusDistribution,
          blockersCount: blockers,
        }
      }
    })

    // Team Performance
    const teamPerformance = updates.reduce((acc, update) => {
      const userId = update.user.id
      if (!acc[userId]) {
        acc[userId] = {
          id: update.user.id,
          name: update.user.name,
          email: update.user.email,
          totalUpdates: 0,
          totalHours: 0,
          projects: new Set(),
          statusDistribution: {}
        }
      }
      
      acc[userId].totalUpdates += 1
      acc[userId].totalHours += update.hoursWorked || 0
      acc[userId].projects.add(update.project.name)
      acc[userId].statusDistribution[update.status] = (acc[userId].statusDistribution[update.status] || 0) + 1
      
      return acc
    }, {})

    // Convert Sets to arrays for display
    Object.values(teamPerformance).forEach(member => {
      member.projects = Array.from(member.projects)
      member.averageHours = member.totalUpdates > 0 ? Math.round((member.totalHours / member.totalUpdates) * 10) / 10 : 0
    })

    return {
      statusSummary,
      prioritySummary,
      allocationSummary,
      updatesSummary,
      projectProgress,
      teamPerformance: Object.values(teamPerformance),
    }
  }, [data])

  const handleDateChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const getStatusColor = (status) => {
    const colors = {
      ACTIVE: 'bg-green-100 text-green-800',
      ON_HOLD: 'bg-yellow-100 text-yellow-800',
      COMPLETED: 'bg-blue-100 text-blue-800',
      CANCELLED: 'bg-red-100 text-red-800',
      ON_TRACK: 'bg-green-100 text-green-800',
      DELAYED: 'bg-red-100 text-red-800',
      BLOCKED: 'bg-yellow-100 text-yellow-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getPriorityColor = (priority) => {
    const colors = {
      HIGH: 'bg-red-100 text-red-800',
      MEDIUM: 'bg-yellow-100 text-yellow-800',
      LOW: 'bg-green-100 text-green-800',
    }
    return colors[priority] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Generating reports...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        Error loading reports: {error.message}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Date Range Selector */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Period</h3>
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => handleDateChange('start', e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => handleDateChange('end', e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {reports && (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-blue-600">
                {reports.allocationSummary.totalProjects}
              </div>
              <div className="text-sm text-gray-600">Active Projects</div>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-green-600">
                {reports.allocationSummary.totalActiveAllocations}
              </div>
              <div className="text-sm text-gray-600">Team Allocations</div>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-purple-600">
                {reports.updatesSummary.totalUpdates}
              </div>
              <div className="text-sm text-gray-600">Daily Updates</div>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-orange-600">
                {Math.round(reports.updatesSummary.totalHours)}h
              </div>
              <div className="text-sm text-gray-600">Total Hours Logged</div>
            </div>
          </div>

          {/* Status & Priority Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Status Distribution</h3>
              <div className="space-y-3">
                {Object.entries(reports.statusSummary).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
                      {status}
                    </span>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Priority Distribution</h3>
              <div className="space-y-3">
                {Object.entries(reports.prioritySummary).map(([priority, count]) => (
                  <div key={priority} className="flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(priority)}`}>
                      {priority}
                    </span>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Project Progress Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Project Progress Analysis</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Project
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Updates
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Hours
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg Hours/Day
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Blockers
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reports.projectProgress.map((project) => (
                    <tr key={project.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{project.name}</div>
                          <div className="text-sm text-gray-500">{project.code}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(project.status)}`}>
                          {project.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {project.metrics.totalUpdates}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {Math.round(project.metrics.totalHours)}h
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {project.metrics.averageHours}h
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${
                          project.metrics.blockersCount > 0 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {project.metrics.blockersCount}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Team Performance */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Team Performance</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Team Member
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Updates
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Hours
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg Hours/Day
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Projects
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reports.teamPerformance.map((member, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{member.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {member.totalUpdates}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {Math.round(member.totalHours)}h
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {member.averageHours}h
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {member.projects.slice(0, 2).join(', ')}
                        {member.projects.length > 2 && ` +${member.projects.length - 2} more`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Detailed Employee Status and Updates */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Employee Status & Updates</h3>
              <p className="text-sm text-gray-600 mt-1">
                Detailed view of employee daily updates and current status
              </p>
            </div>
            <div className="space-y-6 p-6">
              {reports.teamPerformance.map((member) => {
                // Get recent updates for this member
                const memberUpdates = data.dailyProjectUpdates
                  .filter(update => update.user.id === member.id)
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .slice(0, 5) // Show last 5 updates

                return (
                  <div key={member.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-md font-semibold text-gray-900">{member.name}</h4>
                        <p className="text-sm text-gray-600">{member.email}</p>
                        <div className="flex items-center mt-2 space-x-4">
                          <span className="text-sm text-gray-500">
                            {member.totalUpdates} updates • {Math.round(member.totalHours)}h total
                          </span>
                          <span className="text-sm text-gray-500">
                            {member.projects.length} project{member.projects.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                      
                      {/* Status Distribution */}
                      <div className="flex space-x-2">
                        {Object.entries(member.statusDistribution).map(([status, count]) => (
                          <span key={status} className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                            {status}: {count}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Projects assigned */}
                    <div className="mb-4">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Assigned Projects:</h5>
                      <div className="flex flex-wrap gap-2">
                        {member.projects.map((project, idx) => (
                          <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                            {project}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Recent Updates */}
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-3">Recent Updates:</h5>
                      {memberUpdates.length > 0 ? (
                        <div className="space-y-3">
                          {memberUpdates.map((update, idx) => (
                            <div key={update.id} className="bg-gray-50 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm font-medium text-gray-900">
                                    {update.project.name}
                                  </span>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(update.status)}`}>
                                    {update.status}
                                  </span>
                                </div>
                                <div className="text-xs text-gray-500 flex items-center space-x-2">
                                  <span>{new Date(update.date).toLocaleDateString('en-US', { timeZone: 'UTC' })}</span>
                                  <span>•</span>
                                  <span>{update.hoursWorked || 0}h</span>
                                </div>
                              </div>
                              
                              {update.description && (
                                <p className="text-sm text-gray-700 mb-2">{update.description}</p>
                              )}
                              
                              {update.blockers && (
                                <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                                  <strong>Blockers:</strong> {update.blockers}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic">No recent updates found</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default ProjectReports
