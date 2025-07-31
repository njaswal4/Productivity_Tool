import React, { useState } from 'react'
import { useQuery, useMutation, gql } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

const EMPLOYEES_QUERY = gql`
  query EmployeesQuery {
    users {
      id
      name
      email
      department
      designation
      employeeId
      dateOfJoining
      reportingManagerUser {
        name
        email
      }
      roles
      projectAllocations {
        id
        role
        hoursAllocated
        isActive
        project {
          name
          code
          status
        }
      }
    }
  }
`

const UPDATE_EMPLOYEE_MUTATION = gql`
  mutation UpdateEmployee($id: Int!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      id
      name
      department
      designation
      employeeId
    }
  }
`

const EmployeeManagement = () => {
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [editDialog, setEditDialog] = useState({ isOpen: false })

  const { data, loading, refetch } = useQuery(EMPLOYEES_QUERY)

  const [updateEmployee] = useMutation(UPDATE_EMPLOYEE_MUTATION, {
    onCompleted: () => {
      toast.success('Employee updated successfully')
      setEditDialog({ isOpen: false })
      refetch()
    },
    onError: (error) => {
      toast.error(`Error updating employee: ${error.message}`)
    },
  })

  const departments = [
    'ENGINEERING', 'DESIGN', 'MARKETING', 'SALES', 'HR', 'FINANCE', 'OPERATIONS'
  ]

  const designations = [
    'JUNIOR_DEVELOPER', 'SENIOR_DEVELOPER', 'LEAD_DEVELOPER', 'ARCHITECT',
    'DESIGNER', 'SENIOR_DESIGNER', 'MARKETING_SPECIALIST', 'SALES_REPRESENTATIVE',
    'HR_SPECIALIST', 'ACCOUNTANT', 'PROJECT_MANAGER', 'PRODUCT_MANAGER'
  ]

  const getDepartmentColor = (department) => {
    const colors = {
      ENGINEERING: 'bg-blue-100 text-blue-800',
      DESIGN: 'bg-purple-100 text-purple-800',
      MARKETING: 'bg-green-100 text-green-800',
      SALES: 'bg-yellow-100 text-yellow-800',
      HR: 'bg-pink-100 text-pink-800',
      FINANCE: 'bg-gray-100 text-gray-800',
      OPERATIONS: 'bg-orange-100 text-orange-800',
    }
    return colors[department] || 'bg-gray-100 text-gray-800'
  }

  const getActiveProjectsCount = (allocations) => {
    return allocations.filter(allocation => 
      allocation.isActive && allocation.project.status === 'ACTIVE'
    ).length
  }

  const getTotalHours = (allocations) => {
    return allocations
      .filter(allocation => allocation.isActive)
      .reduce((total, allocation) => total + (allocation.hoursAllocated || 0), 0)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading employees...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Employee Directory & Project Allocations</h3>
          <p className="text-sm text-gray-600 mt-1">
            Manage employee information and view their current project assignments
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Designation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Active Projects
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Hours/Day
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Manager
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data?.users?.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {employee.name?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {employee.name || 'No Name'}
                        </div>
                        <div className="text-sm text-gray-500">{employee.email}</div>
                        {employee.employeeId && (
                          <div className="text-xs text-gray-400">ID: {employee.employeeId}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {employee.department ? (
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDepartmentColor(employee.department)}`}>
                        {employee.department.replace('_', ' ')}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">Not set</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {employee.designation?.replace(/_/g, ' ') || 'Not set'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {getActiveProjectsCount(employee.projectAllocations)}
                    </div>
                    {employee.projectAllocations.length > 0 && (
                      <div className="text-xs text-gray-500">
                        {employee.projectAllocations
                          .filter(a => a.isActive)
                          .slice(0, 2)
                          .map(a => a.project.name)
                          .join(', ')}
                        {getActiveProjectsCount(employee.projectAllocations) > 2 && '...'}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {getTotalHours(employee.projectAllocations)}h
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {employee.reportingManagerUser?.name || 'Not assigned'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => {
                        setSelectedEmployee(employee)
                        setEditDialog({ isOpen: true })
                      }}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setSelectedEmployee(employee)}
                      className="text-green-600 hover:text-green-900"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Employee Details Panel */}
      {selectedEmployee && !editDialog.isOpen && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {selectedEmployee.name} - Project Assignments
            </h3>
            <button
              onClick={() => setSelectedEmployee(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Current Project Allocations</h4>
              <div className="space-y-3">
                {selectedEmployee.projectAllocations
                  .filter(allocation => allocation.isActive)
                  .map((allocation) => (
                    <div key={allocation.id} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-medium text-gray-900">
                            {allocation.project.name}
                          </h5>
                          <p className="text-sm text-gray-600">
                            Role: {allocation.role}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {allocation.hoursAllocated}h/day
                          </div>
                          <div className={`text-xs px-2 py-1 rounded-full ${
                            allocation.project.status === 'ACTIVE' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {allocation.project.status}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                {selectedEmployee.projectAllocations.filter(a => a.isActive).length === 0 && (
                  <p className="text-sm text-gray-500">No active project allocations</p>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Employee Information</h4>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Email:</span> {selectedEmployee.email}</div>
                <div><span className="font-medium">Employee ID:</span> {selectedEmployee.employeeId || 'Not set'}</div>
                <div><span className="font-medium">Department:</span> {selectedEmployee.department?.replace('_', ' ') || 'Not set'}</div>
                <div><span className="font-medium">Designation:</span> {selectedEmployee.designation?.replace(/_/g, ' ') || 'Not set'}</div>
                <div><span className="font-medium">Reporting Manager:</span> {selectedEmployee.reportingManagerUser?.name || 'Not assigned'}</div>
                {selectedEmployee.dateOfJoining && (
                  <div><span className="font-medium">Date of Joining:</span> {new Date(selectedEmployee.dateOfJoining).toLocaleDateString()}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EmployeeManagement
