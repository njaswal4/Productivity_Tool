import React, { useState } from 'react'
import { useQuery, useMutation, gql } from '@redwoodjs/web'
import { useAuth } from 'src/auth'
import { toast } from '@redwoodjs/web/toast'
import { ReturnAssetDialog, ConfirmDialog, AssetRequestDialog, ApprovalDialog } from 'src/components/Dialog/Dialog'

const ASSETS_QUERY = gql`
  query AssetsQuery {
    assets {
      id
      assetId
      name
      model
      serialNumber
      status
      condition
      purchaseDate
      warrantyExpiry
      proofOfPurchaseUrl
      proofOfPurchaseType
      proofOfPurchaseFileName
      category {
        id
        name
      }
      assignments {
        id
        user {
          id
          name
          email
        }
        issueDate
        status
      }
    }
  }
`

const ASSET_CATEGORIES_QUERY = gql`
  query AssetCategoriesQuery {
    assetCategories {
      id
      name
      description
    }
  }
`

const ACTIVE_ASSIGNMENTS_QUERY = gql`
  query ActiveAssignmentsQuery {
    activeAssetAssignments {
      id
      issueDate
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

const MY_ASSIGNMENTS_QUERY = gql`
  query MyAssignmentsQuery {
    myAssetAssignments {
      id
      issueDate
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

const ASSET_REQUESTS_QUERY = gql`
  query AssetRequestsQuery {
    assetRequests {
      id
      reason
      urgency
      expectedDuration
      status
      approvedBy
      approvedAt
      rejectionReason
      fulfillmentNotes
      createdAt
      user {
        id
        name
        email
      }
      assetCategory {
        id
        name
      }
      specificAsset {
        id
        assetId
        name
        model
      }
    }
  }
`

const MY_ASSET_REQUESTS_QUERY = gql`
  query MyAssetRequestsQuery {
    myAssetRequests {
      id
      reason
      urgency
      expectedDuration
      status
      approvedBy
      approvedAt
      rejectionReason
      fulfillmentNotes
      createdAt
      assetCategory {
        id
        name
      }
      specificAsset {
        id
        assetId
        name
        model
      }
    }
  }
`

const CREATE_ASSET_REQUEST_MUTATION = gql`
  mutation CreateAssetRequest($input: CreateAssetRequestInput!) {
    createAssetRequest(input: $input) {
      id
      reason
      urgency
      status
      createdAt
    }
  }
`

const APPROVE_ASSET_REQUEST_MUTATION = gql`
  mutation ApproveAssetRequest($id: Int!, $input: ApproveAssetRequestInput!) {
    approveAssetRequest(id: $id, input: $input) {
      id
      status
      approvedBy
      approvedAt
    }
  }
`

const REJECT_ASSET_REQUEST_MUTATION = gql`
  mutation RejectAssetRequest($id: Int!, $input: RejectAssetRequestInput!) {
    rejectAssetRequest(id: $id, input: $input) {
      id
      status
      rejectionReason
    }
  }
`

const RETURN_ASSET_MUTATION = gql`
  mutation ReturnAsset($assignmentId: Int!, $input: ReturnAssetInput!) {
    returnAsset(assignmentId: $assignmentId, input: $input) {
      id
      returnDate
      status
    }
  }
`

const DELETE_ASSET_MUTATION = gql`
  mutation DeleteAsset($id: Int!) {
    deleteAsset(id: $id) {
      id
      assetId
      name
    }
  }
`

const AssetTracker = () => {
  const { currentUser } = useAuth()
  const [activeTab, setActiveTab] = useState('inventory')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [returnDialog, setReturnDialog] = useState({ isOpen: false, assignment: null })
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, asset: null })
  const [requestDialog, setRequestDialog] = useState({ isOpen: false })
  const [approvalDialog, setApprovalDialog] = useState({ isOpen: false, request: null })

  const { data: assetsData, loading: assetsLoading, refetch: refetchAssets } = useQuery(ASSETS_QUERY)
  const { data: categoriesData, loading: categoriesLoading } = useQuery(ASSET_CATEGORIES_QUERY)
  
  const isAdmin = currentUser?.roles?.includes('ADMIN')
  const { data: assignmentsData, loading: assignmentsLoading, refetch: refetchAssignments } = useQuery(
    isAdmin ? ACTIVE_ASSIGNMENTS_QUERY : MY_ASSIGNMENTS_QUERY
  )
  const { data: requestsData, loading: requestsLoading, refetch: refetchRequests } = useQuery(
    isAdmin ? ASSET_REQUESTS_QUERY : MY_ASSET_REQUESTS_QUERY
  )

  const [returnAsset] = useMutation(RETURN_ASSET_MUTATION, {
    onCompleted: () => {
      toast.success('Asset returned successfully')
      refetchAssets()
      refetchAssignments()
    },
    onError: (error) => {
      toast.error(`Error returning asset: ${error.message}`)
    },
  })

  const [deleteAsset] = useMutation(DELETE_ASSET_MUTATION, {
    onCompleted: (data) => {
      toast.success(`Asset ${data.deleteAsset.assetId} deleted successfully`)
      refetchAssets()
      refetchAssignments()
    },
    onError: (error) => {
      toast.error(`Error deleting asset: ${error.message}`)
    },
  })

  const [createAssetRequest] = useMutation(CREATE_ASSET_REQUEST_MUTATION, {
    onCompleted: () => {
      toast.success('Asset request submitted successfully')
      refetchRequests()
    },
    onError: (error) => {
      toast.error(`Error submitting request: ${error.message}`)
    },
  })

  const [approveAssetRequest] = useMutation(APPROVE_ASSET_REQUEST_MUTATION, {
    onCompleted: () => {
      toast.success('Asset request approved successfully')
      refetchRequests()
      refetchAssets()
      refetchAssignments()
    },
    onError: (error) => {
      toast.error(`Error approving request: ${error.message}`)
    },
  })

  const [rejectAssetRequest] = useMutation(REJECT_ASSET_REQUEST_MUTATION, {
    onCompleted: () => {
      toast.success('Asset request rejected')
      refetchRequests()
    },
    onError: (error) => {
      toast.error(`Error rejecting request: ${error.message}`)
    },
  })

  const handleReturnAsset = async (assignmentId) => {
    const assignments = isAdmin ? assignmentsData?.activeAssetAssignments : assignmentsData?.myAssetAssignments
    const assignment = assignments?.find(a => a.id === assignmentId)
    if (!assignment) return
    
    setReturnDialog({ isOpen: true, assignment })
  }

  const handleReturnConfirm = async ({ condition, returnNotes }) => {
    if (!returnDialog.assignment) return

    const returnedBy = currentUser?.name || currentUser?.email || 'Unknown'

    try {
      await returnAsset({
        variables: {
          assignmentId: returnDialog.assignment.id,
          input: {
            returnedBy,
            condition,
            returnNotes,
          },
        },
      })
      setReturnDialog({ isOpen: false, assignment: null })
    } catch (error) {
      console.error('Error returning asset:', error)
    }
  }

  const handleDeleteAsset = (asset) => {
    // Check if asset is currently assigned
    const hasActiveAssignment = asset.assignments?.some(a => a.status === 'Active')
    
    if (hasActiveAssignment) {
      toast.error('Cannot delete asset that is currently assigned to an employee. Please return the asset first.')
      return
    }

    setDeleteDialog({ isOpen: true, asset })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.asset) return
    
    try {
      await deleteAsset({
        variables: {
          id: deleteDialog.asset.id,
        },
      })
      setDeleteDialog({ isOpen: false, asset: null })
    } catch (error) {
      console.error('Error deleting asset:', error)
    }
  }

  const handleViewProofOfPurchase = (asset) => {
    if (asset.proofOfPurchaseUrl) {
      // Open the document in a new window/tab
      const newWindow = window.open('', '_blank')
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head>
              <title>Proof of Purchase - ${asset.assetId}</title>
              <style>
                body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
                .header { margin-bottom: 20px; }
                .document { text-align: center; }
                img { max-width: 100%; height: auto; }
                iframe { width: 100%; height: 80vh; border: none; }
              </style>
            </head>
            <body>
              <div class="header">
                <h2>Proof of Purchase</h2>
                <p><strong>Asset:</strong> ${asset.assetId} - ${asset.name}</p>
                <p><strong>File:</strong> ${asset.proofOfPurchaseFileName}</p>
              </div>
              <div class="document">
                ${asset.proofOfPurchaseType?.startsWith('image/') 
                  ? `<img src="${asset.proofOfPurchaseUrl}" alt="Proof of Purchase" />`
                  : `<iframe src="${asset.proofOfPurchaseUrl}"></iframe>`
                }
              </div>
            </body>
          </html>
        `)
        newWindow.document.close()
      }
    } else {
      toast.error('No proof of purchase document available for this asset')
    }
  }

  const handleCreateRequest = async (requestData) => {
    try {
      await createAssetRequest({
        variables: {
          input: requestData,
        },
      })
      setRequestDialog({ isOpen: false })
    } catch (error) {
      console.error('Error creating request:', error)
    }
  }

  const handleApproveRequest = async (requestId, assignAssetId, fulfillmentNotes) => {
    try {
      await approveAssetRequest({
        variables: {
          id: requestId,
          input: {
            assignAssetId,
            fulfillmentNotes,
          },
        },
      })
      setApprovalDialog({ isOpen: false, request: null })
    } catch (error) {
      console.error('Error approving request:', error)
    }
  }

  const handleRejectRequest = async (requestId, rejectionReason) => {
    try {
      await rejectAssetRequest({
        variables: {
          id: requestId,
          input: {
            rejectionReason,
          },
        },
      })
    } catch (error) {
      console.error('Error rejecting request:', error)
    }
  }

  // Filter assets based on selected filters
  const filteredAssets = assetsData?.assets?.filter(asset => {
    const categoryMatch = selectedCategory === 'all' || asset.category.id.toString() === selectedCategory
    const statusMatch = selectedStatus === 'all' || asset.status === selectedStatus
    return categoryMatch && statusMatch
  }) || []

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Available': return 'bg-green-100 text-green-800'
      case 'Assigned': return 'bg-blue-100 text-blue-800'
      case 'Under Repair': return 'bg-yellow-100 text-yellow-800'
      case 'Retired': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getConditionBadgeColor = (condition) => {
    switch (condition) {
      case 'Excellent': return 'bg-green-100 text-green-800'
      case 'Good': return 'bg-blue-100 text-blue-800'
      case 'Fair': return 'bg-yellow-100 text-yellow-800'
      case 'Poor': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (assetsLoading || categoriesLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading assets...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pt-32 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl p-8 mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Asset Management
              </h1>
              <p className="text-gray-600 mt-2">Track and manage company assets and assignments</p>
            </div>
            <button
              onClick={() => setRequestDialog({ isOpen: true })}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
            >
              <i className="ri-add-line text-lg"></i>
              <span>Request Asset</span>
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-6 border-b border-white/20 pb-4 mb-6">
            <button
              onClick={() => setActiveTab('inventory')}
              className={`font-medium pb-2 border-b-2 transition-colors duration-200 ${
                activeTab === 'inventory'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-600 border-transparent hover:text-blue-600 hover:border-blue-600'
              }`}
            >
              Asset Inventory
            </button>
            <button
              onClick={() => setActiveTab('assignments')}
              className={`font-medium pb-2 border-b-2 transition-colors duration-200 ${
                activeTab === 'assignments'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-600 border-transparent hover:text-blue-600 hover:border-blue-600'
              }`}
            >
              {isAdmin ? 'Active Assignments' : 'My Assets'}
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`font-medium pb-2 border-b-2 transition-colors duration-200 ${
                activeTab === 'requests'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-600 border-transparent hover:text-blue-600 hover:border-blue-600'
              }`}
            >
              {isAdmin ? 'Asset Requests' : 'My Requests'}
            </button>
          </div>
        </div>

      {/* Asset Inventory Tab */}
      {activeTab === 'inventory' && (
        <>
          {/* Filters */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="all">All Categories</option>
                  {categoriesData?.assetCategories?.map(category => (
                    <option key={category.id} value={category.id.toString()}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="all">All Statuses</option>
                  <option value="Available">Available</option>
                  <option value="Assigned">Assigned</option>
                  <option value="Under Repair">Under Repair</option>
                  <option value="Retired">Retired</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSelectedCategory('all')
                    setSelectedStatus('all')
                  }}
                  className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-all duration-200"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

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
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Condition
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Purchase Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Warranty
                  </th>
                  {currentUser?.roles?.includes('ADMIN') && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAssets.map((asset) => {
                  const activeAssignment = asset.assignments?.find(a => a.status === 'Active')
                  return (
                    <tr key={asset.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {asset.assetId}
                          </div>
                          <div className="text-sm text-gray-500">
                            {asset.name} - {asset.model}
                          </div>
                          {asset.serialNumber && (
                            <div className="text-xs text-gray-400">
                              SN: {asset.serialNumber}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                          {asset.category.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(asset.status)}`}>
                          {asset.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getConditionBadgeColor(asset.condition)}`}>
                          {asset.condition}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {activeAssignment ? (
                          <div>
                            <div>{activeAssignment.user.name || activeAssignment.user.email}</div>
                            <div className="text-xs text-gray-500">
                              Since {formatDate(activeAssignment.issueDate)}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">Not assigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(asset.purchaseDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {asset.warrantyExpiry ? (
                          <span className={new Date(asset.warrantyExpiry) < new Date() ? 'text-red-600' : 'text-gray-500'}>
                            {formatDate(asset.warrantyExpiry)}
                          </span>
                        ) : (
                          <span className="text-gray-400">No warranty</span>
                        )}
                      </td>
                      {currentUser?.roles?.includes('ADMIN') && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            {asset.proofOfPurchaseUrl && (
                              <button
                                onClick={() => handleViewProofOfPurchase(asset)}
                                className="text-blue-600 hover:text-blue-900"
                                title="View Proof of Purchase"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteAsset(asset)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete Asset"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {filteredAssets.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No assets found matching the selected filters.</p>
            </div>
          )}
        </>
      )}

      {/* Active Assignments Tab */}
      {activeTab === 'assignments' && (
        <>
          {assignmentsLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading assignments...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Asset
                    </th>
                    {isAdmin && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Assigned To
                      </th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Issue Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Expected Return
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(isAdmin ? assignmentsData?.activeAssetAssignments : assignmentsData?.myAssetAssignments)?.map((assignment) => (
                    <tr key={assignment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {assignment.asset.assetId}
                          </div>
                          <div className="text-sm text-gray-500">
                            {assignment.asset.name} - {assignment.asset.model}
                          </div>
                          <div className="text-xs text-gray-400">
                            {assignment.asset.category.name}
                          </div>
                        </div>
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {assignment.user.name || assignment.user.email}
                            </div>
                            <div className="text-sm text-gray-500">
                              {assignment.user.email}
                            </div>
                          </div>
                        </td>
                      )}
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
                        {assignment.expectedReturnDate ? (
                          <span className={new Date(assignment.expectedReturnDate) < new Date() ? 'text-red-600' : 'text-gray-500'}>
                            {formatDate(assignment.expectedReturnDate)}
                          </span>
                        ) : (
                          <span className="text-gray-400">No date set</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {isAdmin ? (
                          <button
                            onClick={() => handleReturnAsset(assignment.id)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Return Asset
                          </button>
                        ) : parseInt(assignment.user.id) === parseInt(currentUser?.id) ? (
                          <button
                            onClick={() => handleReturnAsset(assignment.id)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Return My Asset
                          </button>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {(isAdmin ? assignmentsData?.activeAssetAssignments : assignmentsData?.myAssetAssignments)?.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {isAdmin ? 'No active asset assignments found.' : 'You don\'t have any assigned assets.'}
              </p>
            </div>
          )}
        </>
      )}

      {/* Asset Requests Tab */}
      {activeTab === 'requests' && (
        <>
          {/* Request Action Button */}
          {!isAdmin && (
            <div className="mb-6">
              <button
                onClick={() => setRequestDialog({ isOpen: true })}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Request Asset
              </button>
            </div>
          )}

          {requestsLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading requests...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Request Details
                    </th>
                    {isAdmin && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Requested By
                      </th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Asset Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Urgency
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date Requested
                    </th>
                    {isAdmin && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(isAdmin ? requestsData?.assetRequests : requestsData?.myAssetRequests)?.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900 mb-1">
                            {request.reason}
                          </div>
                          {request.expectedDuration && (
                            <div className="text-xs text-gray-500">
                              Duration: {request.expectedDuration}
                            </div>
                          )}
                          {request.rejectionReason && (
                            <div className="text-xs text-red-600 mt-1">
                              Rejection: {request.rejectionReason}
                            </div>
                          )}
                          {request.fulfillmentNotes && (
                            <div className="text-xs text-green-600 mt-1">
                              Notes: {request.fulfillmentNotes}
                            </div>
                          )}
                        </div>
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {request.user.name || request.user.email}
                            </div>
                            <div className="text-sm text-gray-500">
                              {request.user.email}
                            </div>
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {request.specificAsset ? (
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {request.specificAsset.assetId}
                            </div>
                            <div className="text-sm text-gray-500">
                              {request.specificAsset.name} - {request.specificAsset.model}
                            </div>
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 mt-1">
                              Specific Asset
                            </span>
                          </div>
                        ) : request.assetCategory ? (
                          <div>
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                              {request.assetCategory.name}
                            </span>
                            <div className="text-xs text-gray-500 mt-1">Category Request</div>
                          </div>
                        ) : (
                          <span className="text-gray-400">Any available</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          request.urgency === 'Critical' ? 'bg-red-100 text-red-800' :
                          request.urgency === 'High' ? 'bg-orange-100 text-orange-800' :
                          request.urgency === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {request.urgency}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          request.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          request.status === 'Approved' ? 'bg-blue-100 text-blue-800' :
                          request.status === 'Fulfilled' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {request.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(request.createdAt)}
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {request.status === 'Pending' && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => setApprovalDialog({ isOpen: true, request })}
                                className="text-green-600 hover:text-green-900"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleRejectRequest(request.id, 'Rejected by admin')}
                                className="text-red-600 hover:text-red-900"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {(isAdmin ? requestsData?.assetRequests : requestsData?.myAssetRequests)?.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {isAdmin ? 'No asset requests found.' : 'You haven\'t made any asset requests yet.'}
              </p>
            </div>
          )}
        </>
      )}
      
      {/* Return Asset Dialog */}
      <ReturnAssetDialog
        isOpen={returnDialog.isOpen}
        onClose={() => setReturnDialog({ isOpen: false, assignment: null })}
        onConfirm={handleReturnConfirm}
        assetName={returnDialog.assignment ? `${returnDialog.assignment.asset.assetId} - ${returnDialog.assignment.asset.name}` : ''}
      />

      {/* Delete Asset Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, asset: null })}
        onConfirm={handleDeleteConfirm}
        title="Delete Asset"
        message={
          deleteDialog.asset 
            ? `Are you sure you want to delete asset "${deleteDialog.asset.assetId} - ${deleteDialog.asset.name}"? This action cannot be undone.`
            : ''
        }
        confirmText="Delete Asset"
        cancelText="Cancel"
      />

      {/* Asset Request Dialog */}
      <AssetRequestDialog
        isOpen={requestDialog.isOpen}
        onClose={() => setRequestDialog({ isOpen: false })}
        onSubmit={handleCreateRequest}
        categories={categoriesData?.assetCategories || []}
        assets={assetsData?.assets || []}
      />

      {/* Approval Dialog */}
      <ApprovalDialog
        isOpen={approvalDialog.isOpen}
        onClose={() => setApprovalDialog({ isOpen: false, request: null })}
        onApprove={handleApproveRequest}
        request={approvalDialog.request}
        availableAssets={assetsData?.assets || []}
      />
      </div>
    </div>
  )
}

export default AssetTracker
