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
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setProjectDialog({ isOpen: true })}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Create New Project
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <div
            key={project.id}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            {/* Project Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {project.name}
                </h3>
                <p className="text-sm text-gray-500">{project.code}</p>
              </div>
              <div className="flex flex-col space-y-1">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(project.status)}`}>
                  {project.status}
                </span>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityBadgeColor(project.priority)}`}>
                  {project.priority}
                </span>
              </div>
            </div>

            {/* Project Details */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Start Date:</span>
                <span className="font-medium">
                  {new Date(project.startDate).toLocaleDateString()}
                </span>
              </div>
              {project.endDate && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">End Date:</span>
                  <span className="font-medium">
                    {new Date(project.endDate).toLocaleDateString()}
                  </span>
                </div>
              )}
              {project.manager && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Manager:</span>
                  <span className="font-medium">{project.manager.name}</span>
                </div>
              )}
            </div>

            {/* Allocation Stats */}
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-medium text-gray-900">Team Allocations</span>
                <span className="text-blue-600 font-medium">
                  {getActiveAllocationsCount(project.allocations)} active
                </span>
              </div>
              
              {project.allocations.length > 0 ? (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Total Hours/Day:</span>
                    <span className="font-medium">
                      {getTotalAllocatedHours(project.allocations)}h
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {project.allocations.slice(0, 3).map((allocation) => (
                      <span
                        key={allocation.id}
                        className={`inline-flex px-2 py-1 text-xs rounded-full ${
                          allocation.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {allocation.user.name}
                      </span>
                    ))}
                    {project.allocations.length > 3 && (
                      <span className="inline-flex px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                        +{project.allocations.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-500">No team members allocated</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
              <button
                onClick={() => setAllocationDialog({ isOpen: true, project })}
                className="flex-1 bg-green-600 text-white px-3 py-2 text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Allocate Team
              </button>
              <button 
                onClick={() => setDetailsDialog({ isOpen: true, project })}
                className="flex-1 bg-gray-600 text-white px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                View Details
              </button>
              <button
                onClick={() => handleDeleteProject(project.id, project.name)}
                className="bg-red-600 text-white px-3 py-2 text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                title="Delete Project"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {projects.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📁</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Projects</h3>
          <p className="text-gray-500 mb-4">
            Create your first project to start tracking allocations and progress.
          </p>
          <button
            onClick={() => setProjectDialog({ isOpen: true })}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
          >
            Create Project
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
