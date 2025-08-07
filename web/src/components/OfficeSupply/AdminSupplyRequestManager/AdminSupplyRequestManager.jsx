import { useState } from 'react'
import { useQuery, useMutation } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'
import { gql } from 'graphql-tag'
import { 
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  UserIcon,
  DocumentTextIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'
import { Form, FormError, Label, TextAreaField, Submit } from '@redwoodjs/forms'

const GET_PENDING_REQUESTS = gql`
  query GetPendingSupplyRequests {
    pendingSupplyRequests {
      id
      quantityRequested
      justification
      urgency
      status
      createdAt
      totalCost
      isOverdue
      user {
        id
        name
        email
      }
      supply {
        id
        name
        stockCount
        unitPrice
        category {
          name
        }
      }
    }
  }
`

const GET_ALL_REQUESTS = gql`
  query GetAllSupplyRequests {
    supplyRequests {
      id
      quantityRequested
      justification
      urgency
      status
      createdAt
      approvedAt
      approverNotes
      totalCost
      isOverdue
      user {
        id
        name
        email
      }
      supply {
        id
        name
        stockCount
        unitPrice
        category {
          name
        }
      }
    }
  }
`

const APPROVE_REQUEST = gql`
  mutation ApproveSupplyRequest($id: Int!, $approverNotes: String) {
    approveSupplyRequest(id: $id, approverNotes: $approverNotes) {
      id
      status
      approvedAt
      approverNotes
    }
  }
`

const REJECT_REQUEST = gql`
  mutation RejectSupplyRequest($id: Int!, $approverNotes: String!) {
    rejectSupplyRequest(id: $id, approverNotes: $approverNotes) {
      id
      status
      approvedAt
      approverNotes
    }
  }
`

const AdminSupplyRequestManager = () => {
  const [activeTab, setActiveTab] = useState('pending')
  const [searchTerm, setSearchTerm] = useState('')
  const [urgencyFilter, setUrgencyFilter] = useState('')
  const [processingRequest, setProcessingRequest] = useState(null)
  const [approverNotes, setApproverNotes] = useState('')
  const [actionType, setActionType] = useState('')

  const { data: pendingData, loading: pendingLoading, refetch: refetchPending } = useQuery(GET_PENDING_REQUESTS)
  const { data: allData, loading: allLoading, refetch: refetchAll } = useQuery(GET_ALL_REQUESTS, {
    skip: activeTab === 'pending'
  })

  const [approveRequest] = useMutation(APPROVE_REQUEST, {
    onCompleted: () => {
      toast.success('Request approved successfully!')
      setProcessingRequest(null)
      setApproverNotes('')
      refetchPending()
      refetchAll()
    },
    onError: (error) => {
      toast.error(error.message)
    }
  })

  const [rejectRequest] = useMutation(REJECT_REQUEST, {
    onCompleted: () => {
      toast.success('Request rejected successfully!')
      setProcessingRequest(null)
      setApproverNotes('')
      refetchPending()
      refetchAll()
    },
    onError: (error) => {
      toast.error(error.message)
    }
  })

  const handleApprove = (request) => {
    setProcessingRequest(request)
    setActionType('approve')
  }

  const handleReject = (request) => {
    setProcessingRequest(request)
    setActionType('reject')
  }

  const submitAction = () => {
    if (actionType === 'approve') {
      approveRequest({
        variables: {
          id: processingRequest.id,
          approverNotes: approverNotes.trim() || null
        }
      })
    } else {
      if (!approverNotes.trim()) {
        toast.error('Please provide a reason for rejection')
        return
      }
      rejectRequest({
        variables: {
          id: processingRequest.id,
          approverNotes: approverNotes.trim()
        }
      })
    }
  }

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'HIGH':
        return 'bg-red-100 text-red-800'
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800'
      case 'LOW':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'APPROVED':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const currentData = activeTab === 'pending' ? pendingData?.pendingSupplyRequests : allData?.supplyRequests
  const currentLoading = activeTab === 'pending' ? pendingLoading : allLoading

  const filteredRequests = currentData?.filter(request => {
    const matchesSearch = 
      request.supply.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.justification.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesUrgency = !urgencyFilter || request.urgency === urgencyFilter
    
    return matchesSearch && matchesUrgency
  })

  const stats = {
    pending: pendingData?.pendingSupplyRequests?.length || 0,
    total: allData?.supplyRequests?.length || 0,
    approved: allData?.supplyRequests?.filter(r => r.status === 'APPROVED').length || 0,
    rejected: allData?.supplyRequests?.filter(r => r.status === 'REJECTED').length || 0,
    overdue: currentData?.filter(r => r.isOverdue && r.status === 'PENDING').length || 0,
    totalValue: currentData?.reduce((sum, request) => sum + (request.totalCost || 0), 0) || 0
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl p-8 mb-8">
          <div className="mb-6">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Supply Request Management
            </h1>
            <p className="text-gray-600 mt-2">Review and approve employee supply requests</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <ClockIcon className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircleIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center">
                <div className="p-3 bg-red-100 rounded-lg">
                  <XCircleIcon className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Rejected</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center">
                <div className="p-3 bg-red-100 rounded-lg">
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Overdue</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.overdue}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <CurrencyDollarIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Value</p>
                  <p className="text-2xl font-bold text-gray-900">${stats.totalValue.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl mb-8">
          <div className="flex">
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex-1 py-4 px-6 text-center font-semibold rounded-tl-2xl transition-all duration-200 ${
                activeTab === 'pending'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-white/10'
              }`}
            >
              Pending Requests ({stats.pending})
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-4 px-6 text-center font-semibold rounded-tr-2xl transition-all duration-200 ${
                activeTab === 'all'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-white/10'
              }`}
            >
              All Requests ({stats.total})
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* Urgency Filter */}
            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className="px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="">All Urgencies</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </select>

            {/* Clear Filters */}
            <button
              onClick={() => {
                setSearchTerm('')
                setUrgencyFilter('')
              }}
              className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-all duration-200"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Action Modal */}
        {processingRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl p-8 max-w-2xl w-full">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {actionType === 'approve' ? 'Approve Request' : 'Reject Request'}
              </h3>
              
              <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 mb-6">
                <h4 className="font-semibold text-gray-900">{processingRequest.supply.name}</h4>
                <p className="text-sm text-gray-600">
                  Requested by: {processingRequest.user.name} ({processingRequest.user.email})
                </p>
                <p className="text-sm text-gray-600">
                  Quantity: {processingRequest.quantityRequested} items
                </p>
                <p className="text-sm text-gray-600">
                  Current Stock: {processingRequest.supply.stockCount} items
                </p>
                {processingRequest.supply.unitPrice && (
                  <p className="text-sm text-gray-600">
                    Total Cost: ${processingRequest.totalCost?.toFixed(2)}
                  </p>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {actionType === 'approve' ? 'Notes (Optional)' : 'Rejection Reason *'}
                  </label>
                  <textarea
                    value={approverNotes}
                    onChange={(e) => setApproverNotes(e.target.value)}
                    className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                    rows="4"
                    placeholder={
                      actionType === 'approve'
                        ? 'Add any notes for the requester...'
                        : 'Please explain why this request is being rejected...'
                    }
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => {
                      setProcessingRequest(null)
                      setApproverNotes('')
                      setActionType('')
                    }}
                    className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitAction}
                    className={`px-8 py-3 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 ${
                      actionType === 'approve'
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                        : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700'
                    }`}
                  >
                    {actionType === 'approve' ? 'Approve Request' : 'Reject Request'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Requests List */}
        <div className="space-y-4">
          {currentLoading ? (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading requests...</p>
            </div>
          ) : filteredRequests?.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl p-8 text-center text-gray-600">
              <DocumentTextIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No requests found matching your criteria.</p>
            </div>
          ) : (
            filteredRequests?.map((request) => (
              <div key={request.id} className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl p-6 hover:shadow-2xl transition-all duration-200">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <UserIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{request.supply.name}</h3>
                      <p className="text-sm text-gray-600">{request.supply.category.name}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-sm font-medium">{request.quantityRequested} items</span>
                        <span className="text-sm text-gray-600">
                          Stock: {request.supply.stockCount} items
                        </span>
                        {request.supply.unitPrice && (
                          <span className="text-sm text-gray-600">
                            Cost: ${request.totalCost?.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm ${getUrgencyColor(request.urgency)}`}>
                      {request.urgency}
                    </span>
                    {activeTab === 'all' && (
                      <span className={`px-3 py-1 rounded-full text-sm border ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                    )}
                    {request.isOverdue && request.status === 'PENDING' && (
                      <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                        Overdue
                      </span>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Requested by:</span> {request.user.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Email:</span> {request.user.email}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Date:</span> {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Justification:</span>
                      </p>
                      <p className="text-sm text-gray-700 mt-1">{request.justification}</p>
                    </div>
                  </div>
                </div>

                {request.approverNotes && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Admin Notes:</span> {request.approverNotes}
                    </p>
                  </div>
                )}

                {request.status === 'PENDING' && (
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleReject(request)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 flex items-center space-x-2"
                    >
                      <XCircleIcon className="h-4 w-4" />
                      <span>Reject</span>
                    </button>
                    <button
                      onClick={() => handleApprove(request)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 flex items-center space-x-2"
                    >
                      <CheckCircleIcon className="h-4 w-4" />
                      <span>Approve</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminSupplyRequestManager
