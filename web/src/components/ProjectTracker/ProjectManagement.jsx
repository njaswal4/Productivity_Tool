import React, { useState } from 'react'
import { useMutation, useQuery, gql } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'
import ProjectDialog from '../Dialog/ProjectDialog'
import AllocationDialog from '../Dialog/AllocationDialog'
import ProjectDetailsDialog from '../Dialog/ProjectDetailsDialog'

// Confirmation Dialog Component
const ConfirmationDialog = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

const USERS_QUERY = gql`
  query UsersQuery {
    users {
      id
      name
      email
    }
  }
`

const CREATE_PROJECT_MUTATION = gql`
  mutation CreateProject($input: CreateProjectInput!) {
    createProject(input: $input) {
      id
      name
      code
      status
      priority
    }
  }
`

const CREATE_ALLOCATION_MUTATION = gql`
  mutation CreateProjectAllocation($input: CreateProjectAllocationInput!) {
    createProjectAllocation(input: $input) {
      id
      role
      hoursAllocated
      user {
        name
        email
      }
      project {
        name
        code
      }
    }
  }
`

const DELETE_PROJECT_MUTATION = gql`
  mutation DeleteProject($id: Int!) {
    deleteProject(id: $id) {
      id
      name
    }
  }
`

const ProjectManagement = ({
  projects,
  loading,
  onRefresh,
  getStatusBadgeColor,
  getPriorityBadgeColor,
}) => {
  const [projectDialog, setProjectDialog] = useState({ isOpen: false })
  const [allocationDialog, setAllocationDialog] = useState({ isOpen: false, project: null })
  const [detailsDialog, setDetailsDialog] = useState({ isOpen: false, project: null })
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, projectId: null, projectName: '' })

  const { data: usersData } = useQuery(USERS_QUERY)

  const [createProject] = useMutation(CREATE_PROJECT_MUTATION, {
    onCompleted: () => {
      toast.success('Project created successfully')
      setProjectDialog({ isOpen: false })
      onRefresh()
    },
    onError: (error) => {
      toast.error(`Error creating project: ${error.message}`)
    },
  })

  const [createAllocation] = useMutation(CREATE_ALLOCATION_MUTATION, {
    onCompleted: (data) => {
      toast.success(`${data.createProjectAllocation.user.name} allocated to ${data.createProjectAllocation.project.name}`)
      setAllocationDialog({ isOpen: false, project: null })
      onRefresh()
    },
    onError: (error) => {
      toast.error(`Error creating allocation: ${error.message}`)
    },
  })

  const [deleteProject] = useMutation(DELETE_PROJECT_MUTATION, {
    onCompleted: (data) => {
      toast.success(`Project "${data.deleteProject.name}" deleted successfully`)
      onRefresh()
    },
    onError: (error) => {
      toast.error(`Error deleting project: ${error.message}`)
    },
  })

  const handleCreateProject = async (projectData) => {
    try {
      await createProject({
        variables: { input: projectData },
      })
    } catch (error) {
      console.error('Error creating project:', error)
    }
  }

  const handleCreateAllocation = async (allocationData) => {
    try {
      await createAllocation({
        variables: { input: allocationData },
      })
    } catch (error) {
      console.error('Error creating allocation:', error)
    }
  }

  const handleDeleteProject = async (projectId, projectName) => {
    setDeleteDialog({ isOpen: true, projectId, projectName })
  }

  const confirmDeleteProject = async () => {
    try {
      await deleteProject({
        variables: { id: deleteDialog.projectId },
      })
      setDeleteDialog({ isOpen: false, projectId: null, projectName: '' })
    } catch (error) {
      console.error('Error deleting project:', error)
    }
  }

  const getTotalAllocatedHours = (allocations) => {
    return allocations.reduce((total, allocation) => {
      return total + (allocation.hoursAllocated || 0)
    }, 0)
  }

  const getActiveAllocationsCount = (allocations) => {
    return allocations.filter(allocation => allocation.isActive).length
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading projects...</span>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header Section with Action Button */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-100 rounded-2xl p-6 border border-blue-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Project Management</h2>
            <p className="text-gray-600">Create, manage, and track your team projects and allocations</p>
            <div className="flex items-center gap-4 mt-3 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">{projects.filter(p => p.status === 'Active').length} Active</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600">{projects.length} Total Projects</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setProjectDialog({ isOpen: true })}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 group"
          >
            <i className="ri-add-line text-lg group-hover:rotate-12 transition-transform duration-200"></i>
            Create New Project
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <div
            key={project.id}
            className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:border-blue-300 group"
          >
            {/* Project Header */}
            <div className="flex items-start justify-between mb-5">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {project.name}
                  </h3>
                </div>
                <p className="text-sm text-gray-500 font-medium bg-gray-100 px-3 py-1 rounded-full inline-block">
                  {project.code}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full shadow-sm ${getStatusBadgeColor(project.status)}`}>
                  {project.status}
                </span>
                <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full shadow-sm ${getPriorityBadgeColor(project.priority)}`}>
                  {project.priority}
                </span>
              </div>
            </div>

            {/* Project Details */}
            <div className="space-y-3 mb-5">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <i className="ri-calendar-line text-green-600"></i>
                </div>
                <div>
                  <span className="text-gray-500 block text-xs">Start Date</span>
                  <span className="font-semibold text-gray-900">
                    {new Date(project.startDate).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric',
                      timeZone: 'UTC' 
                    })}
                  </span>
                </div>
              </div>
              
              {project.endDate && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <i className="ri-flag-line text-red-600"></i>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-xs">End Date</span>
                    <span className="font-semibold text-gray-900">
                      {new Date(project.endDate).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric',
                        timeZone: 'UTC' 
                      })}
                    </span>
                  </div>
                </div>
              )}
              
              {project.manager && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <i className="ri-user-star-line text-purple-600"></i>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-xs">Project Manager</span>
                    <span className="font-semibold text-gray-900">{project.manager.name}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Allocation Stats */}
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 mb-5 border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center">
                    <i className="ri-team-line text-white text-sm"></i>
                  </div>
                  <span className="font-bold text-gray-900">Team</span>
                </div>
                <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                  {getActiveAllocationsCount(project.allocations)} active
                </span>
              </div>
              
              {project.allocations.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 font-medium">Total Hours/Day:</span>
                    <span className="font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded-lg">
                      {getTotalAllocatedHours(project.allocations)}h
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {project.allocations.slice(0, 3).map((allocation) => (
                      <span
                        key={allocation.id}
                        className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${
                          allocation.isActive
                            ? 'bg-green-100 text-green-800 border-green-200'
                            : 'bg-gray-100 text-gray-600 border-gray-200'
                        }`}
                      >
                        {allocation.user.name}
                      </span>
                    ))}
                    {project.allocations.length > 3 && (
                      <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                        +{project.allocations.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-2">
                  <span className="text-xs text-gray-500 italic">No team members allocated</span>
                </div>
              )}
            </div>

            {/* Enhanced Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setAllocationDialog({ isOpen: true, project })}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-3 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 group"
              >
                <i className="ri-team-line text-sm group-hover:scale-110 transition-transform"></i>
                Team
              </button>
              <button 
                onClick={() => setDetailsDialog({ isOpen: true, project })}
                className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-3 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 group"
              >
                <i className="ri-eye-line text-sm group-hover:scale-110 transition-transform"></i>
                Details
              </button>
              <button
                onClick={() => handleDeleteProject(project.id, project.name)}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-3 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center group"
                title="Delete Project"
              >
                <i className="ri-delete-bin-line text-sm group-hover:scale-110 transition-transform"></i>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Enhanced Empty State */}
      {projects.length === 0 && (
        <div className="text-center py-16 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl border border-gray-200">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="ri-folder-line text-4xl text-blue-600"></i>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Active Projects</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Create your first project to start tracking allocations and progress. Build amazing things with your team!
          </p>
          <button
            onClick={() => setProjectDialog({ isOpen: true })}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 inline-flex items-center gap-2 group"
          >
            <i className="ri-add-line group-hover:rotate-12 transition-transform duration-200"></i>
            Create Your First Project
          </button>
        </div>
      )}

      {/* Project Dialog */}
      <ProjectDialog
        isOpen={projectDialog.isOpen}
        onClose={() => setProjectDialog({ isOpen: false })}
        onSubmit={handleCreateProject}
        users={usersData?.users || []}
      />

      {/* Allocation Dialog */}
      <AllocationDialog
        isOpen={allocationDialog.isOpen}
        onClose={() => setAllocationDialog({ isOpen: false, project: null })}
        onSubmit={handleCreateAllocation}
        project={allocationDialog.project}
        users={usersData?.users || []}
      />

      {/* Project Details Dialog */}
      <ProjectDetailsDialog
        isOpen={detailsDialog.isOpen}
        onClose={() => setDetailsDialog({ isOpen: false, project: null })}
        project={detailsDialog.project}
        onRefresh={onRefresh}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, projectId: null, projectName: '' })}
        onConfirm={confirmDeleteProject}
        title="Delete Project"
        message={`Are you sure you want to delete the project "${deleteDialog.projectName}"? This action cannot be undone and will remove all associated allocations and data.`}
      />
    </div>
  )
}

export default ProjectManagement
