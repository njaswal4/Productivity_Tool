import React, { useState } from 'react'
import { useQuery, gql } from '@redwoodjs/web'
import { useAuth } from 'src/auth'

const USER_ASSET_REPORT_QUERY = gql`
  query UserAssetReport($startDate: DateTime, $endDate: DateTime) {
    myAssetAssignmentReport(startDate: $startDate, endDate: $endDate) {
      totalAssignments
      activeAssignments
      returnedAssignments
      overdueAssignments
      assignments {
        id
        issueDate
        returnDate
        expectedReturnDate
        status
        department
        asset {
          id
          assetId
          name
          model
          category {
            name
          }
        }
      }
      assetsByCategory {
        categoryName
        count
        activeCount
        returnedCount
      }
      monthlyStats {
        month
        year
        assignedCount
        returnedCount
      }
    }
  }
`

const ADMIN_ASSET_REPORT_QUERY = gql`
  query AdminAssetReport($startDate: DateTime, $endDate: DateTime) {
    allUsersAssetReport(startDate: $startDate, endDate: $endDate) {
      totalAssignments
      activeAssignments
      returnedAssignments
      overdueAssignments
      assignments {
        id
        issueDate
        returnDate
        expectedReturnDate
        status
        department
        asset {
          id
          assetId
          name
          model
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
      assetsByCategory {
        categoryName
        count
        activeCount
        returnedCount
      }
      monthlyStats {
        month
        year
        assignedCount
        returnedCount
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
      assetAssignments {
        id
        status
        asset {
          id
          assetId
          name
        }
      }
    }
  }
`

const USER_ASSET_DETAIL_QUERY = gql`
  query UserAssetDetailQuery($userId: Int!) {
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

const DEPARTMENT_ASSETS_QUERY = gql`
  query DepartmentAssetsQuery($department: String!) {
    assetAssignments {
      id
      issueDate
      returnDate
      expectedReturnDate
      status
      department
      asset {
        id
        assetId
        name
        model
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
  const [reportDateRange, setReportDateRange] = useState({
    startDate: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  })
  const [activeReportTab, setActiveReportTab] = useState('overview')
  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedDepartment, setSelectedDepartment] = useState('')

  const isAdmin = currentUser?.roles?.includes('ADMIN')

  // Load different data based on admin features
  const { data: allUsersData, loading: usersLoading } = useQuery(ALL_USERS_QUERY, {
    skip: !isAdmin
  })

  const { data: selectedUserData, loading: selectedUserLoading } = useQuery(USER_ASSET_DETAIL_QUERY, {
    variables: { userId: selectedUser?.id },
    skip: !isAdmin || !selectedUser
  })

  const { data: departmentData, loading: departmentLoading } = useQuery(DEPARTMENT_ASSETS_QUERY, {
    variables: { department: selectedDepartment },
    skip: !isAdmin || !selectedDepartment
  })

  // Use different queries based on user role and admin view
  const { data: reportData, loading: reportLoading, refetch: refetchReport } = useQuery(
    isAdmin ? ADMIN_ASSET_REPORT_QUERY : USER_ASSET_REPORT_QUERY,
    {
      variables: {
        startDate: reportDateRange.startDate + 'T00:00:00.000Z',
        endDate: reportDateRange.endDate + 'T23:59:59.999Z'
      },
      skip: isAdmin && activeReportTab !== 'overview'
    }
  )

  // Extract the report data based on user role
  const report = isAdmin ? reportData?.allUsersAssetReport : reportData?.myAssetAssignmentReport

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

  const handleReportDateChange = (field, value) => {
    setReportDateRange(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleGenerateReport = () => {
    refetchReport({
      startDate: reportDateRange.startDate + 'T00:00:00.000Z',
      endDate: reportDateRange.endDate + 'T23:59:59.999Z'
    })
  }

  const handleUserSelect = (user) => {
    setSelectedUser(user)
    setActiveReportTab('employee')
  }

  const handleDepartmentSelect = (department) => {
    setSelectedDepartment(department)
    setActiveReportTab('department')
  }

  const getDepartmentAssets = () => {
    if (!departmentData?.assetAssignments || !selectedDepartment) return []
    return departmentData.assetAssignments.filter(assignment => 
      assignment.department === selectedDepartment
    )
  }

  const getUniqueDepartments = () => {
    if (!reportData?.allUsersAssetReport?.assignments) return []
    const departments = new Set()
    reportData.allUsersAssetReport.assignments.forEach(assignment => {
      if (assignment.department) {
        departments.add(assignment.department)
      }
    })
    return Array.from(departments).sort()
  }

  const exportToCSV = (data, filename) => {
    if (!data?.length) return

    const headers = [
      'Asset ID',
      'Asset Name',
      'Category',
      isAdmin ? 'Employee' : '',
      isAdmin ? 'Email' : '',
      'Department',
      'Issue Date',
      'Expected Return',
      'Return Date',
      'Status',
      'Value'
    ].filter(Boolean)
    
    const csvContent = [
      headers.join(','),
      ...data.map(assignment => [
        assignment.asset.assetId,
        `"${assignment.asset.name}"`,
        assignment.asset.category.name,
        isAdmin ? `"${assignment.user?.name || assignment.user?.email || 'N/A'}"` : '',
        isAdmin ? (assignment.user?.email || 'N/A') : '',
        assignment.department || 'N/A',
        formatDate(assignment.issueDate),
        formatDate(assignment.expectedReturnDate),
        formatDate(assignment.returnDate),
        assignment.status,
        assignment.asset.purchasePrice || 0
      ].filter((_, index) => isAdmin || ![3, 4].includes(index)).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (reportLoading || (isAdmin && usersLoading)) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading report...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pt-32 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl p-8 mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Asset Reports
            </h1>
            <p className="text-gray-600 mt-2">
              {isAdmin ? 'Comprehensive asset assignment reports and analytics' : 'Your personal asset assignment report'}
            </p>
          </div>
        </div>

        {/* Admin Tab Navigation */}
        {isAdmin && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl p-6 mb-8">
            <div className="flex space-x-6 border-b border-white/20 pb-4 mb-6">
              <button
                onClick={() => setActiveReportTab('overview')}
                className={`font-medium pb-2 border-b-2 transition-colors duration-200 ${
                  activeReportTab === 'overview'
                    ? 'text-blue-600 border-blue-600'
                    : 'text-gray-600 border-transparent hover:text-blue-600 hover:border-blue-600'
                }`}
              >
                All Users Overview
              </button>
              <button
                onClick={() => setActiveReportTab('employees')}
                className={`font-medium pb-2 border-b-2 transition-colors duration-200 ${
                  activeReportTab === 'employees'
                    ? 'text-blue-600 border-blue-600'
                    : 'text-gray-600 border-transparent hover:text-blue-600 hover:border-blue-600'
                }`}
              >
                Employee List
              </button>
              <button
                onClick={() => setActiveReportTab('departments')}
                className={`font-medium pb-2 border-b-2 transition-colors duration-200 ${
                  activeReportTab === 'departments'
                    ? 'text-blue-600 border-blue-600'
                    : 'text-gray-600 border-transparent hover:text-blue-600 hover:border-blue-600'
                }`}
              >
                Department Reports
              </button>
            </div>
          </div>
        )}

        {/* Regular User Report */}
        {!isAdmin && (
          <>
            {/* Date Range Filters */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Filters</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={reportDateRange.startDate}
                    onChange={(e) => handleReportDateChange('startDate', e.target.value)}
                    className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={reportDateRange.endDate}
                    onChange={(e) => handleReportDateChange('endDate', e.target.value)}
                    className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleGenerateReport}
                    className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all duration-200"
                  >
                    Generate Report
                  </button>
                  {report?.assignments?.length > 0 && (
                    <button
                      onClick={() => exportToCSV(
                        report.assignments.map(assignment => ({
                          ...assignment,
                          user: currentUser
                        })),
                        `my-asset-report-${reportDateRange.startDate}-to-${reportDateRange.endDate}.csv`
                      )}
                      className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-all duration-200"
                    >
                      Export CSV
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* User Report Content */}
            {report && (
              <>
                {/* Summary Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl p-6">
                    <div className="text-2xl font-bold text-blue-600">{report.totalAssignments}</div>
                    <div className="text-sm text-gray-600">Total Assignments</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl p-6">
                    <div className="text-2xl font-bold text-green-600">{report.activeAssignments}</div>
                    <div className="text-sm text-gray-600">Currently Active</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl p-6">
                    <div className="text-2xl font-bold text-gray-600">{report.returnedAssignments}</div>
                    <div className="text-sm text-gray-600">Returned Assets</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl p-6">
                    <div className="text-2xl font-bold text-red-600">{report.overdueAssignments}</div>
                    <div className="text-sm text-gray-600">Overdue Returns</div>
                  </div>
                </div>

                {/* Assignment History */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">My Assignment History</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Return Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {report.assignments.map((assignment) => (
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
                              {assignment.returnDate ? formatDate(assignment.returnDate) : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                assignment.status === 'Active' ? 'bg-green-100 text-green-800' :
                                assignment.status === 'Returned' ? 'bg-gray-100 text-gray-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {assignment.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* Admin Views */}
        {isAdmin && (
          <>
            {/* All Users Overview Tab */}
            {activeReportTab === 'overview' && (
              <>
                {/* Date Range Filters */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl p-6 mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Filters</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
                      <input
                        type="date"
                        value={reportDateRange.startDate}
                        onChange={(e) => handleReportDateChange('startDate', e.target.value)}
                        className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
                      <input
                        type="date"
                        value={reportDateRange.endDate}
                        onChange={(e) => handleReportDateChange('endDate', e.target.value)}
                        className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={handleGenerateReport}
                        className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all duration-200"
                      >
                        Generate Report
                      </button>
                      {report?.assignments?.length > 0 && (
                        <button
                          onClick={() => exportToCSV(
                            report.assignments,
                            `all-users-report-${reportDateRange.startDate}-to-${reportDateRange.endDate}.csv`
                          )}
                          className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-all duration-200"
                        >
                          Export CSV
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {report && (
                  <>
                    {/* Summary Statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl p-6">
                        <div className="text-2xl font-bold text-blue-600">{report.totalAssignments}</div>
                        <div className="text-sm text-gray-600">Total Assignments</div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl p-6">
                        <div className="text-2xl font-bold text-green-600">{report.activeAssignments}</div>
                        <div className="text-sm text-gray-600">Currently Active</div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl p-6">
                        <div className="text-2xl font-bold text-gray-600">{report.returnedAssignments}</div>
                        <div className="text-sm text-gray-600">Returned Assets</div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl p-6">
                        <div className="text-2xl font-bold text-red-600">{report.overdueAssignments}</div>
                        <div className="text-sm text-gray-600">Overdue Returns</div>
                      </div>
                    </div>

                    {/* Assets by Category */}
                    {report.assetsByCategory.length > 0 && (
                      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl p-6 mb-8">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Assets by Category</h4>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Returned</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {report.assetsByCategory.map((category) => (
                                <tr key={category.categoryName} className="hover:bg-gray-50">
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {category.categoryName}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {category.count}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                                    {category.activeCount}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {category.returnedCount}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Assignment History */}
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl p-6 mb-8">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">All User Assignment History</h4>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue Date</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Return Date</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {report.assignments.map((assignment) => (
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
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {assignment.user?.name || assignment.user?.email || 'N/A'}
                                    </div>
                                    {assignment.user?.email && assignment.user?.name && (
                                      <div className="text-sm text-gray-500">
                                        {assignment.user.email}
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {assignment.department ? (
                                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                      {assignment.department}
                                    </span>
                                  ) : (
                                    <span className="text-gray-400 text-sm">Not specified</span>
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {formatDate(assignment.issueDate)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {assignment.returnDate ? formatDate(assignment.returnDate) : '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    assignment.status === 'Active' ? 'bg-green-100 text-green-800' :
                                    assignment.status === 'Returned' ? 'bg-gray-100 text-gray-800' :
                                    'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {assignment.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            {/* Employee List Tab */}
            {activeReportTab === 'employees' && (
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl p-6 mb-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Employee List</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allUsersData?.users?.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => handleUserSelect(user)}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md cursor-pointer transition-all duration-200"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="text-sm font-medium text-gray-900">
                            {user.name || user.email}
                          </h5>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-blue-600">
                            {user.assetAssignments?.filter(a => a.status === 'Active').length || 0}
                          </div>
                          <div className="text-xs text-gray-500">Active Assets</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Individual Employee Report */}
            {activeReportTab === 'employee' && selectedUser && (
              <div>
                <div className="mb-4">
                  <button
                    onClick={() => setActiveReportTab('employees')}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    ← Back to Employee List
                  </button>
                </div>

                {selectedUserLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">Loading user report...</span>
                  </div>
                ) : selectedUserData?.user ? (
                  <div>
                    {/* Employee Info */}
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl p-6 mb-8">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Employee Report: {selectedUserData.user.name || selectedUserData.user.email}
                      </h3>
                      <p className="text-sm text-gray-600">Email: {selectedUserData.user.email}</p>
                      
                      {/* Summary Stats */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div className="text-center p-3 bg-white/20 rounded border">
                          <div className="text-xl font-bold text-blue-600">
                            {selectedUserData.user.assetAssignments?.filter(a => a.status === 'Active').length || 0}
                          </div>
                          <div className="text-sm text-gray-600">Currently Assigned</div>
                        </div>
                        <div className="text-center p-3 bg-white/20 rounded border">
                          <div className="text-xl font-bold text-green-600">
                            {selectedUserData.user.assetAssignments?.filter(a => a.status === 'Returned').length || 0}
                          </div>
                          <div className="text-sm text-gray-600">Previously Assigned</div>
                        </div>
                        <div className="text-center p-3 bg-white/20 rounded border">
                          <div className="text-xl font-bold text-purple-600">
                            {formatCurrency(calculateTotalValue(selectedUserData.user.assetAssignments?.filter(a => a.status === 'Active')))}
                          </div>
                          <div className="text-sm text-gray-600">Current Asset Value</div>
                        </div>
                      </div>
                    </div>

                    {/* Export Button */}
                    {selectedUserData.user.assetAssignments?.length > 0 && (
                      <div className="mb-4 flex justify-end">
                        <button
                          onClick={() => exportToCSV(
                            selectedUserData.user.assetAssignments.map(assignment => ({
                              ...assignment,
                              user: selectedUserData.user
                            })),
                            `${selectedUserData.user.name || 'user'}-asset-report-${new Date().toISOString().split('T')[0]}.csv`
                          )}
                          className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          Export Employee Assets to CSV
                        </button>
                      </div>
                    )}

                    {/* Assets Table */}
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Asset Assignment History</h4>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue Date</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Return Date</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {selectedUserData.user.assetAssignments?.map((assignment) => (
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

                      {(!selectedUserData.user.assetAssignments || selectedUserData.user.assetAssignments.length === 0) && (
                        <div className="text-center py-8">
                          <p className="text-gray-500">This employee has no asset assignments.</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Unable to load employee asset data.</p>
                  </div>
                )}
              </div>
            )}

            {/* Department Reports Tab */}
            {activeReportTab === 'departments' && (
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl p-6 mb-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Select Department</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getUniqueDepartments().map((department) => (
                    <div
                      key={department}
                      onClick={() => handleDepartmentSelect(department)}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md cursor-pointer transition-all duration-200"
                    >
                      <div className="text-center">
                        <h5 className="text-sm font-medium text-gray-900">{department}</h5>
                        <div className="text-sm text-blue-600 mt-1">
                          {report?.assignments?.filter(a => a.department === department).length || 0} assignments
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {getUniqueDepartments().length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No departments found with asset assignments.</p>
                  </div>
                )}
              </div>
            )}

            {/* Department Report Detail */}
            {activeReportTab === 'department' && selectedDepartment && (
              <div>
                <div className="mb-4">
                  <button
                    onClick={() => setActiveReportTab('departments')}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    ← Back to Department List
                  </button>
                </div>

                {departmentLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">Loading department report...</span>
                  </div>
                ) : (
                  <div>
                    {/* Department Info */}
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl p-6 mb-8">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Department Report: {selectedDepartment}
                      </h3>
                      
                      {/* Department Summary */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div className="text-center p-3 bg-white/20 rounded border">
                          <div className="text-xl font-bold text-blue-600">
                            {getDepartmentAssets().length}
                          </div>
                          <div className="text-sm text-gray-600">Total Assignments</div>
                        </div>
                        <div className="text-center p-3 bg-white/20 rounded border">
                          <div className="text-xl font-bold text-green-600">
                            {getDepartmentAssets().filter(a => a.status === 'Active').length}
                          </div>
                          <div className="text-sm text-gray-600">Currently Active</div>
                        </div>
                        <div className="text-center p-3 bg-white/20 rounded border">
                          <div className="text-xl font-bold text-gray-600">
                            {getDepartmentAssets().filter(a => a.status === 'Returned').length}
                          </div>
                          <div className="text-sm text-gray-600">Returned Assets</div>
                        </div>
                      </div>
                    </div>

                    {/* Export Button */}
                    {getDepartmentAssets().length > 0 && (
                      <div className="mb-4 flex justify-end">
                        <button
                          onClick={() => exportToCSV(
                            getDepartmentAssets(),
                            `${selectedDepartment}-department-report-${new Date().toISOString().split('T')[0]}.csv`
                          )}
                          className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          Export Department Assets to CSV
                        </button>
                      </div>
                    )}

                    {/* Department Assets Table */}
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Department Asset Assignments</h4>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue Date</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Return Date</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {getDepartmentAssets().map((assignment) => (
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
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {assignment.user?.name || assignment.user?.email || 'N/A'}
                                    </div>
                                    {assignment.user?.email && assignment.user?.name && (
                                      <div className="text-sm text-gray-500">
                                        {assignment.user.email}
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {formatDate(assignment.issueDate)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {assignment.returnDate ? formatDate(assignment.returnDate) : '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    assignment.status === 'Active' ? 'bg-green-100 text-green-800' :
                                    assignment.status === 'Returned' ? 'bg-gray-100 text-gray-800' :
                                    'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {assignment.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {getDepartmentAssets().length === 0 && (
                        <div className="text-center py-8">
                          <p className="text-gray-500">No assets found for this department.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default AssetReports
