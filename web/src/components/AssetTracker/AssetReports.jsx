import React, { useState } from 'react'
import { useQuery } from '@redwoodjs/web'
import { useAuth } from 'src/auth'

const USER_ASSET_REPORT_QUERY = gql`
  query UserAssetReport($userId: Int!) {
    user(id: $userId) {
      id
      name
      email
      assetAssignments {
        id
        issueDate
        returnDate
        expectedReturnDate
        status
        condition
        issueNotes
        returnNotes
        asset {
          id
          assetId
          name
          model
          purchasePrice
          category {
            name
          }
        }
      }
    }
  }
`

const ALL_USERS_QUERY = gql`
  query AllUsersQuery {
    users {
      id
      name
      email
    }
  }
`

const DEPARTMENT_ASSETS_QUERY = gql`
  query DepartmentAssetsQuery {
    activeAssetAssignments {
      id
      issueDate
      expectedReturnDate
      status
      asset {
        id
        assetId
        name
        model
        purchasePrice
        category {
          name
        }
      }
      user {
        id
        name
        email
      }
    }
  }
`

const AssetReports = () => {
  const { currentUser } = useAuth()
  const [selectedUserId, setSelectedUserId] = useState('')
  const [reportType, setReportType] = useState('user')

  const { data: usersData, loading: usersLoading } = useQuery(ALL_USERS_QUERY)
  
  const { data: userReportData, loading: userReportLoading } = useQuery(USER_ASSET_REPORT_QUERY, {
    variables: { userId: parseInt(selectedUserId) },
    skip: !selectedUserId || reportType !== 'user',
  })

  const { data: departmentData, loading: departmentLoading } = useQuery(DEPARTMENT_ASSETS_QUERY, {
    skip: reportType !== 'department',
  })

  const formatDate = (dateString) => {
    return dateString ? new Date(dateString).toLocaleDateString() : 'N/A'
  }

  const formatCurrency = (amount) => {
    return amount ? `$${amount.toLocaleString()}` : 'N/A'
  }

  const calculateTotalValue = (assignments) => {
    return assignments?.reduce((total, assignment) => {
      return total + (assignment.asset.purchasePrice || 0)
    }, 0) || 0
  }

  const exportToCSV = (data, filename) => {
    const headers = [
      'Asset ID',
      'Asset Name',
      'Category',
      'Employee',
      'Email',
      'Issue Date',
      'Expected Return',
      'Status',
      'Value'
    ]
    
    const csvContent = [
      headers.join(','),
      ...data.map(row => [
        row.asset.assetId,
        `"${row.asset.name}"`,
        row.asset.category.name,
        `"${row.user.name || row.user.email}"`,
        row.user.email,
        formatDate(row.issueDate),
        formatDate(row.expectedReturnDate),
        row.status,
        row.asset.purchasePrice || 0
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const groupAssetsByCategory = (assignments) => {
    const grouped = {}
    assignments?.forEach(assignment => {
      const category = assignment.asset.category.name
      if (!grouped[category]) {
        grouped[category] = []
      }
      grouped[category].push(assignment)
    })
    return grouped
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Asset Reports</h2>
          <p className="text-gray-600 mt-1">Generate ownership reports per employee and department</p>
        </div>
      </div>

      {/* Report Type Selection */}
      <div className="mb-6">
        <div className="flex space-x-4">
          <label className="inline-flex items-center">
            <input
              type="radio"
              value="user"
              checked={reportType === 'user'}
              onChange={(e) => setReportType(e.target.value)}
              className="form-radio text-blue-600"
            />
            <span className="ml-2 text-sm font-medium text-gray-700">Individual Employee Report</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              value="department"
              checked={reportType === 'department'}
              onChange={(e) => setReportType(e.target.value)}
              className="form-radio text-blue-600"
            />
            <span className="ml-2 text-sm font-medium text-gray-700">Department Overview</span>
          </label>
        </div>
      </div>

      {/* User Selection (for individual reports) */}
      {reportType === 'user' && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Employee
          </label>
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="w-full max-w-md border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Choose an employee...</option>
            {usersData?.users?.map(user => (
              <option key={user.id} value={user.id}>
                {user.name || user.email} ({user.email})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Individual Employee Report */}
      {reportType === 'user' && selectedUserId && (
        <div>
          {userReportLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading report...</span>
            </div>
          ) : userReportData?.user ? (
            <div>
              {/* Employee Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Employee: {userReportData.user.name || userReportData.user.email}
                </h3>
                <p className="text-sm text-gray-600">Email: {userReportData.user.email}</p>
                
                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div className="text-center p-3 bg-white rounded border">
                    <div className="text-xl font-bold text-blue-600">
                      {userReportData.user.assetAssignments?.filter(a => a.status === 'Active').length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Currently Assigned</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded border">
                    <div className="text-xl font-bold text-green-600">
                      {userReportData.user.assetAssignments?.filter(a => a.status === 'Returned').length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Previously Assigned</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded border">
                    <div className="text-xl font-bold text-purple-600">
                      {formatCurrency(calculateTotalValue(userReportData.user.assetAssignments?.filter(a => a.status === 'Active')))}
                    </div>
                    <div className="text-sm text-gray-600">Current Asset Value</div>
                  </div>
                </div>
              </div>

              {/* Export Button */}
              {userReportData.user.assetAssignments?.length > 0 && (
                <div className="mb-4 flex justify-end">
                  <button
                    onClick={() => exportToCSV(
                      userReportData.user.assetAssignments.map(assignment => ({
                        ...assignment,
                        user: userReportData.user
                      })),
                      `asset-report-${userReportData.user.name || userReportData.user.email}-${new Date().toISOString().split('T')[0]}.csv`
                    )}
                    className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    Export to CSV
                  </button>
                </div>
              )}

              {/* Assets Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Asset
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Issue Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Return Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Value
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {userReportData.user.assetAssignments?.map((assignment) => (
                      <tr key={assignment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {assignment.asset.assetId}
                            </div>
                            <div className="text-sm text-gray-500">
                              {assignment.asset.name} - {assignment.asset.model}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                            {assignment.asset.category.name}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(assignment.issueDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {assignment.returnDate ? formatDate(assignment.returnDate) : 
                           assignment.expectedReturnDate ? `Expected: ${formatDate(assignment.expectedReturnDate)}` : 
                           'Not set'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            assignment.status === 'Active' ? 'bg-green-100 text-green-800' : 
                            assignment.status === 'Returned' ? 'bg-blue-100 text-blue-800' : 
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {assignment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatCurrency(assignment.asset.purchasePrice)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {(!userReportData.user.assetAssignments || userReportData.user.assetAssignments.length === 0) && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No asset assignments found for this employee.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Employee not found.</p>
            </div>
          )}
        </div>
      )}

      {/* Department Overview Report */}
      {reportType === 'department' && (
        <div>
          {departmentLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading department overview...</span>
            </div>
          ) : (
            <div>
              {/* Department Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Asset Overview</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-white rounded border">
                    <div className="text-xl font-bold text-blue-600">
                      {departmentData?.activeAssetAssignments?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Total Active Assignments</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded border">
                    <div className="text-xl font-bold text-green-600">
                      {new Set(departmentData?.activeAssetAssignments?.map(a => a.user.id)).size || 0}
                    </div>
                    <div className="text-sm text-gray-600">Employees with Assets</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded border">
                    <div className="text-xl font-bold text-purple-600">
                      {formatCurrency(calculateTotalValue(departmentData?.activeAssetAssignments))}
                    </div>
                    <div className="text-sm text-gray-600">Total Asset Value</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded border">
                    <div className="text-xl font-bold text-yellow-600">
                      {new Set(departmentData?.activeAssetAssignments?.map(a => a.asset.category.name)).size || 0}
                    </div>
                    <div className="text-sm text-gray-600">Asset Categories</div>
                  </div>
                </div>
              </div>

              {/* Export Button */}
              {departmentData?.activeAssetAssignments?.length > 0 && (
                <div className="mb-4 flex justify-end">
                  <button
                    onClick={() => exportToCSV(
                      departmentData.activeAssetAssignments,
                      `department-asset-report-${new Date().toISOString().split('T')[0]}.csv`
                    )}
                    className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    Export to CSV
                  </button>
                </div>
              )}

              {/* Assets by Category */}
              {departmentData?.activeAssetAssignments && (
                <div className="space-y-6">
                  {Object.entries(groupAssetsByCategory(departmentData.activeAssetAssignments)).map(([category, assignments]) => (
                    <div key={category} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="text-md font-semibold text-gray-900 mb-3">
                        {category} ({assignments.length} assets)
                      </h4>
                      
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Asset
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Assigned To
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Issue Date
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Value
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {assignments.map((assignment) => (
                              <tr key={assignment.id} className="hover:bg-gray-50">
                                <td className="px-4 py-2 whitespace-nowrap">
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {assignment.asset.assetId}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {assignment.asset.name}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">
                                    {assignment.user.name || assignment.user.email}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {assignment.user.email}
                                  </div>
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                  {formatDate(assignment.issueDate)}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                  {formatCurrency(assignment.asset.purchasePrice)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {(!departmentData?.activeAssetAssignments || departmentData.activeAssetAssignments.length === 0) && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No active asset assignments found.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AssetReports
