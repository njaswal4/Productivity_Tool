import { useState } from 'react'
import { useQuery, useMutation } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'
import { Link, routes } from '@redwoodjs/router'
import { useAuth } from 'src/auth'
import { gql } from 'graphql-tag'
import { 
  PlusIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'
import { Form, FormError, FieldError, Label, NumberField, SelectField, TextAreaField, Submit } from '@redwoodjs/forms'
import Header from 'src/components/Header/Header'

const GET_MY_SUPPLY_REQUESTS = gql`
  query GetMySupplyRequests {
    mySupplyRequests {
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
      supply {
        id
        name
        stockCount
        unitPrice
        category {
          id
          name
        }
      }
    }
  }
`

const GET_OFFICE_SUPPLIES = gql`
  query GetOfficeSupplies {
    officeSupplies {
      id
      name
      stockCount
      unitPrice
      category {
        id
        name
      }
    }
  }
`

const CREATE_SUPPLY_REQUEST = gql`
  mutation CreateSupplyRequest($input: CreateSupplyRequestInput!) {
    createSupplyRequest(input: $input) {
      id
      quantityRequested
      justification
      urgency
      status
      supply {
        name
      }
    }
  }
`

const UPDATE_SUPPLY_REQUEST = gql`
  mutation UpdateSupplyRequest($id: Int!, $input: UpdateSupplyRequestInput!) {
    updateSupplyRequest(id: $id, input: $input) {
      id
      quantityRequested
      justification
      urgency
      status
    }
  }
`

const DELETE_SUPPLY_REQUEST = gql`
  mutation DeleteSupplyRequest($id: Int!) {
    deleteSupplyRequest(id: $id) {
      id
    }
  }
`

const SupplyRequestManager = () => {
  const { currentUser, hasRole } = useAuth()
  const [showForm, setShowForm] = useState(false)
  const [editingRequest, setEditingRequest] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const isAdmin = hasRole && hasRole('ADMIN')

  const { data: requestsData, loading: requestsLoading, error: requestsError, refetch } = useQuery(GET_MY_SUPPLY_REQUESTS)
  const { data: suppliesData } = useQuery(GET_OFFICE_SUPPLIES)

  const [createRequest] = useMutation(CREATE_SUPPLY_REQUEST, {
    onCompleted: () => {
      toast.success('Supply request created successfully!')
      setShowForm(false)
      refetch()
    },
    onError: (error) => {
      toast.error(error.message)
    }
  })

  const [updateRequest] = useMutation(UPDATE_SUPPLY_REQUEST, {
    onCompleted: () => {
      toast.success('Supply request updated successfully!')
      setShowForm(false)
      setEditingRequest(null)
      refetch()
    },
    onError: (error) => {
      toast.error(error.message)
    }
  })

  const [deleteRequest] = useMutation(DELETE_SUPPLY_REQUEST, {
    onCompleted: () => {
      toast.success('Supply request deleted successfully!')
      refetch()
    },
    onError: (error) => {
      toast.error(error.message)
    }
  })

  const onSubmit = (data) => {
    const input = {
      supplyId: parseInt(data.supplyId),
      quantityRequested: parseInt(data.quantityRequested),
      justification: data.justification,
      urgency: data.urgency
    }

    if (editingRequest) {
      updateRequest({ variables: { id: editingRequest.id, input } })
    } else {
      createRequest({ variables: { input } })
    }
  }

  const handleDelete = async (id, supplyName) => {
    if (window.confirm(`Are you sure you want to delete the request for "${supplyName}"?`)) {
      await deleteRequest({ variables: { id } })
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />
      case 'APPROVED':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'REJECTED':
        return <XCircleIcon className="h-5 w-5 text-red-500" />
      default:
        return null
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

  const filteredRequests = requestsData?.mySupplyRequests?.filter(request => {
    const matchesSearch = request.supply.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.justification.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !statusFilter || request.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const statusCounts = requestsData?.mySupplyRequests?.reduce((acc, request) => {
    acc[request.status] = (acc[request.status] || 0) + 1
    return acc
  }, {}) || {}

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pt-32 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl p-8 mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                My Supply Requests
              </h1>
              <p className="text-gray-600 mt-2">Request and track office supplies for your work needs</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
            >
              <PlusIcon className="h-5 w-5" />
              <span>New Request</span>
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-6 border-b border-white/20 pb-4 mb-6">
            <Link
              to={routes.officeSupplies()}
              className="text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200 pb-2 border-b-2 border-transparent hover:border-blue-600"
            >
              View Inventory
            </Link>
            <span className="text-blue-600 font-medium pb-2 border-b-2 border-blue-600">
              My Requests
            </span>
            {isAdmin && (
              <Link
                to={routes.adminSupplyRequests()}
                className="text-gray-600 hover:text-purple-600 font-medium transition-colors duration-200 pb-2 border-b-2 border-transparent hover:border-purple-600"
              >
                Admin Panel
              </Link>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <DocumentTextIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Requests</p>
                  <p className="text-2xl font-bold text-gray-900">{requestsData?.mySupplyRequests?.length || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <ClockIcon className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{statusCounts.PENDING || 0}</p>
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
                  <p className="text-2xl font-bold text-gray-900">{statusCounts.APPROVED || 0}</p>
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
                  <p className="text-2xl font-bold text-gray-900">{statusCounts.REJECTED || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Request Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6">
                {editingRequest ? 'Edit Supply Request' : 'New Supply Request'}
              </h3>

              <Form onSubmit={onSubmit} className="space-y-6">
                <FormError error={null} wrapperClassName="rw-form-error-wrapper" titleClassName="rw-form-error-title" listClassName="rw-form-error-list" />

                {/* Supply Selection */}
                <div className="space-y-2">
                  <Label name="supplyId" className="text-sm font-semibold text-gray-700">
                    Select Supply *
                  </Label>
                  <SelectField
                    name="supplyId"
                    defaultValue={editingRequest?.supply?.id}
                    className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    validation={{ required: true }}
                  >
                    <option value="">Choose a supply...</option>
                    {suppliesData?.officeSupplies?.map((supply) => (
                      <option key={supply.id} value={supply.id}>
                        {supply.name} ({supply.stockCount} available)
                      </option>
                    ))}
                  </SelectField>
                  <FieldError name="supplyId" className="text-red-500 text-sm" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Quantity */}
                  <div className="space-y-2">
                    <Label name="quantityRequested" className="text-sm font-semibold text-gray-700">
                      Quantity Requested *
                    </Label>
                    <NumberField
                      name="quantityRequested"
                      defaultValue={editingRequest?.quantityRequested}
                      className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter quantity"
                      validation={{ required: true, min: 1 }}
                    />
                    <FieldError name="quantityRequested" className="text-red-500 text-sm" />
                  </div>

                  {/* Urgency */}
                  <div className="space-y-2">
                    <Label name="urgency" className="text-sm font-semibold text-gray-700">
                      Urgency Level *
                    </Label>
                    <SelectField
                      name="urgency"
                      defaultValue={editingRequest?.urgency || 'MEDIUM'}
                      className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      validation={{ required: true }}
                    >
                      <option value="LOW">Low Priority</option>
                      <option value="MEDIUM">Medium Priority</option>
                      <option value="HIGH">High Priority</option>
                    </SelectField>
                    <FieldError name="urgency" className="text-red-500 text-sm" />
                  </div>
                </div>

                {/* Justification */}
                <div className="space-y-2">
                  <Label name="justification" className="text-sm font-semibold text-gray-700">
                    Justification *
                  </Label>
                  <TextAreaField
                    name="justification"
                    defaultValue={editingRequest?.justification}
                    className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                    rows="4"
                    placeholder="Explain why you need this supply..."
                    validation={{ required: true }}
                  />
                  <FieldError name="justification" className="text-red-500 text-sm" />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      setEditingRequest(null)
                    }}
                    className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <Submit
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  >
                    {editingRequest ? 'Update Request' : 'Submit Request'}
                  </Submit>
                </div>
              </Form>
            </div>
          </div>
        )}

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

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>

            {/* Clear Filters */}
            <button
              onClick={() => {
                setSearchTerm('')
                setStatusFilter('')
              }}
              className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-all duration-200"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {requestsLoading ? (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading your requests...</p>
            </div>
          ) : requestsError ? (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl p-8 text-center text-red-600">
              <ExclamationTriangleIcon className="h-12 w-12 mx-auto mb-4" />
              <p>Error loading requests: {requestsError.message}</p>
            </div>
          ) : filteredRequests?.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl p-8 text-center text-gray-600">
              <DocumentTextIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No supply requests found.</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                Create Your First Request
              </button>
            </div>
          ) : (
            filteredRequests?.map((request) => (
              <div key={request.id} className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl p-6 hover:shadow-2xl transition-all duration-200">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      {getStatusIcon(request.status)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{request.supply.name}</h3>
                      <p className="text-sm text-gray-600">{request.supply.category.name}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-sm font-medium">{request.quantityRequested} items</span>
                        {request.supply.unitPrice && (
                          <span className="text-sm text-gray-600">
                            Total: ${request.totalCost?.toFixed(2) || (request.quantityRequested * request.supply.unitPrice).toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm ${getUrgencyColor(request.urgency)}`}>
                      {request.urgency} Priority
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm border ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Justification:</span> {request.justification}
                  </p>
                </div>

                {request.approverNotes && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Admin Notes:</span> {request.approverNotes}
                    </p>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    <span>Requested: {new Date(request.createdAt).toLocaleDateString()}</span>
                    {request.approvedAt && (
                      <span className="ml-4">
                        {request.status === 'APPROVED' ? 'Approved' : 'Rejected'}: {new Date(request.approvedAt).toLocaleDateString()}
                      </span>
                    )}
                    {request.isOverdue && request.status === 'PENDING' && (
                      <span className="ml-4 text-red-600 font-medium">Overdue</span>
                    )}
                  </div>

                  {request.status === 'PENDING' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingRequest(request)
                          setShowForm(true)
                        }}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(request.id, request.supply.name)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      </div>
    </>
  )
}

export default SupplyRequestManager
