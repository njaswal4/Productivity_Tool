import { useState } from 'react'
import { useQuery, useMutation } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'
import { Link, routes } from '@redwoodjs/router'
import { gql } from 'graphql-tag'
import { useAuth } from 'src/auth'
import { 
  MagnifyingGlassIcon, 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  ShoppingCartIcon
} from '@heroicons/react/24/outline'
import OfficeSupplyForm from '../OfficeSupplyForm/OfficeSupplyForm'
import Header from 'src/components/Header/Header'

const GET_OFFICE_SUPPLIES = gql`
  query GetOfficeSupplies {
    officeSupplies {
      id
      name
      description
      stockCount
      unitPrice
      createdAt
      updatedAt
      category {
        id
        name
      }
    }
  }
`

const DELETE_OFFICE_SUPPLY = gql`
  mutation DeleteOfficeSupply($id: Int!) {
    deleteOfficeSupply(id: $id) {
      id
    }
  }
`

const CREATE_OFFICE_SUPPLY = gql`
  mutation CreateOfficeSupply($input: CreateOfficeSupplyInput!) {
    createOfficeSupply(input: $input) {
      id
      name
      description
      stockCount
      unitPrice
      categoryId
    }
  }
`

const UPDATE_OFFICE_SUPPLY = gql`
  mutation UpdateOfficeSupply($id: Int!, $input: UpdateOfficeSupplyInput!) {
    updateOfficeSupply(id: $id, input: $input) {
      id
      name
      description
      stockCount
      unitPrice
      categoryId
    }
  }
`

const SupplyInventory = () => {
  const { hasRole } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingSupply, setEditingSupply] = useState(null)

  const isAdmin = hasRole && hasRole('ADMIN')

  const { data, loading, error, refetch } = useQuery(GET_OFFICE_SUPPLIES)

  const [deleteSupply] = useMutation(DELETE_OFFICE_SUPPLY, {
    onCompleted: () => {
      toast.success('Supply deleted successfully!')
      refetch()
    },
    onError: (error) => {
      toast.error(error.message)
    }
  })

  const [createSupply] = useMutation(CREATE_OFFICE_SUPPLY, {
    onCompleted: () => {
      toast.success('Supply created successfully!')
      refetch()
      setShowForm(false)
    },
    onError: (error) => {
      toast.error(error.message)
    }
  })

  const [updateSupply] = useMutation(UPDATE_OFFICE_SUPPLY, {
    onCompleted: () => {
      toast.success('Supply updated successfully!')
      refetch()
      setEditingSupply(null)
      setShowForm(false)
    },
    onError: (error) => {
      toast.error(error.message)
    }
  })

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      await deleteSupply({ variables: { id } })
    }
  }

  // Replace double-mutation: the form performs create/update itself and calls onSave afterwards.
  const handleFormSave = () => {
    refetch()
    setEditingSupply(null)
    setShowForm(false)
  }

  const filteredSupplies = data?.officeSupplies?.filter(supply => {
    const matchesSearch = supply.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supply.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supply.category.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = !selectedCategory || supply.category.id.toString() === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const categories = [...new Set(data?.officeSupplies?.map(s => s.category))]

  if (showForm && isAdmin) {
    return (
      <OfficeSupplyForm
        supply={editingSupply}
        onSave={handleFormSave}
        onCancel={() => {
          setShowForm(false)
          setEditingSupply(null)
        }}
      />
    )
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pt-32 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl p-4 md:p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                {isAdmin ? 'Supply Management' : 'Office Supplies'}
              </h1>
              <p className="text-gray-600 mt-2 text-sm md:text-base">
                {isAdmin ? 'Manage inventory and track supply requests' : 'Browse available supplies and make requests'}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <Link
                to={routes.supplyRequests()}
                className="px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2 text-sm md:text-base"
              >
                <ShoppingCartIcon className="h-4 md:h-5 w-4 md:w-5" />
                <span>Request Supplies</span>
              </Link>
              {isAdmin && (
                <button
                  onClick={() => setShowForm(true)}
                  className="px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2 text-sm md:text-base"
                >
                  <PlusIcon className="h-4 md:h-5 w-4 md:w-5" />
                  <span>Add New Supply</span>
                </button>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-1 mb-6 bg-white/20 p-1 rounded-xl">
            <div className="flex-1 px-2 md:px-4 py-3 text-center text-xs md:text-sm font-medium bg-white/50 text-blue-700 rounded-lg">
              📦 Inventory
            </div>
            <Link
              to={routes.supplyRequests()}
              className="flex-1 px-2 md:px-4 py-3 text-center text-xs md:text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-white/30 rounded-lg transition-colors"
            >
              📝 My Requests
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-white/20">
              <div className="flex flex-col sm:flex-row sm:items-center">
                <div className="p-2 md:p-3 bg-blue-100 rounded-lg mb-2 sm:mb-0 self-start">
                  <ChartBarIcon className="h-4 md:h-6 w-4 md:w-6 text-blue-600" />
                </div>
                <div className="sm:ml-4">
                  <p className="text-xs md:text-sm font-medium text-gray-600">Total Supplies</p>
                  <p className="text-lg md:text-2xl font-bold text-gray-900">{data?.officeSupplies?.length || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-white/20">
              <div className="flex flex-col sm:flex-row sm:items-center">
                <div className="p-2 md:p-3 bg-red-100 rounded-lg mb-2 sm:mb-0 self-start">
                  <ExclamationTriangleIcon className="h-4 md:h-6 w-4 md:w-6 text-red-600" />
                </div>
                <div className="sm:ml-4">
                  <p className="text-xs md:text-sm font-medium text-gray-600">Low Stock Items</p>
                  <p className="text-lg md:text-2xl font-bold text-gray-900">
                    {data?.officeSupplies?.filter(supply => supply.stockCount < 10)?.length || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-white/20">
              <div className="flex flex-col sm:flex-row sm:items-center">
                <div className="p-2 md:p-3 bg-green-100 rounded-lg mb-2 sm:mb-0 self-start">
                  <ClipboardDocumentListIcon className="h-4 md:h-6 w-4 md:w-6 text-green-600" />
                </div>
                <div className="sm:ml-4">
                  <p className="text-xs md:text-sm font-medium text-gray-600">Categories</p>
                  <p className="text-lg md:text-2xl font-bold text-gray-900">{categories.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-white/20">
              <div className="flex flex-col sm:flex-row sm:items-center">
                <div className="p-2 md:p-3 bg-yellow-100 rounded-lg mb-2 sm:mb-0 self-start">
                  <ChartBarIcon className="h-4 md:h-6 w-4 md:w-6 text-yellow-600" />
                </div>
                <div className="sm:ml-4">
                  <p className="text-xs md:text-sm font-medium text-gray-600">Total Value</p>
                  <p className="text-lg md:text-2xl font-bold text-gray-900">
                    ${data?.officeSupplies?.reduce((total, supply) => 
                      total + (supply.stockCount * (supply.unitPrice || 0)), 0
                    ).toFixed(2) || '0.00'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl p-4 md:p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search supplies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm md:text-base"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm md:text-base"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            {/* Clear Filters */}
            <button
              onClick={() => {
                setSearchTerm('')
                setSelectedCategory('')
              }}
              className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-all duration-200 text-sm md:text-base"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Supply List */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading supplies...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-600">
              <ExclamationTriangleIcon className="h-12 w-12 mx-auto mb-4" />
              <p>Error loading supplies: {error.message}</p>
            </div>
          ) : filteredSupplies?.length === 0 ? (
            <div className="p-8 text-center text-gray-600">
              <ClipboardDocumentListIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No supplies found matching your criteria.</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-white/20 backdrop-blur-sm">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Supply</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Stock Count</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Unit Price</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Total Value</th>
                      {isAdmin && (
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200/20">
                    {filteredSupplies?.map((supply) => (
                      <tr key={supply.id} className="hover:bg-white/10 transition-colors duration-200">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-semibold text-gray-900">{supply.name}</div>
                            <div className="text-sm text-gray-600">{supply.description}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            {supply.category.name}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold">{supply.stockCount}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold">
                            ${supply.unitPrice?.toFixed(2) || '0.00'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold">
                            ${((supply.stockCount * (supply.unitPrice || 0)).toFixed(2))}
                          </div>
                        </td>
                        {isAdmin && (
                          <td className="px-6 py-4">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  setEditingSupply(supply)
                                  setShowForm(true)
                                }}
                                className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors duration-200"
                                title="Edit Supply"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(supply.id, supply.name)}
                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200"
                                title="Delete Supply"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden divide-y divide-gray-200/20">
                {filteredSupplies?.map((supply) => (
                  <div key={supply.id} className="p-4 hover:bg-white/10 transition-colors duration-200">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-lg">{supply.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{supply.description}</p>
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs mt-2">
                          {supply.category.name}
                        </span>
                      </div>
                      {isAdmin && (
                        <div className="flex space-x-1 ml-4">
                          <button
                            onClick={() => {
                              setEditingSupply(supply)
                              setShowForm(true)
                            }}
                            className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors duration-200"
                            title="Edit Supply"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(supply.id, supply.name)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200"
                            title="Delete Supply"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mt-3 pt-3 border-t border-gray-200/20">
                      <div className="text-center">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Stock</p>
                        <p className="text-lg font-semibold text-gray-900">{supply.stockCount}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Unit Price</p>
                        <p className="text-lg font-semibold text-gray-900">
                          ${supply.unitPrice?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Total Value</p>
                        <p className="text-lg font-semibold text-gray-900">
                          ${((supply.stockCount * (supply.unitPrice || 0)).toFixed(2))}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      </div>
    </>
  )
}

export default SupplyInventory
