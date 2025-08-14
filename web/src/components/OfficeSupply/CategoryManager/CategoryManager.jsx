import { useState } from 'react'
import { useQuery, useMutation } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'
import { gql } from 'graphql-tag'
import { Form, FormError, FieldError, Label, TextField, TextAreaField, Submit } from '@redwoodjs/forms'
import { useAuth } from 'src/auth'
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  FolderIcon,
  ExclamationTriangleIcon,
  CogIcon
} from '@heroicons/react/24/outline'

const GET_CATEGORIES = gql`
  query GetOfficeSupplyCategories {
    officeSupplyCategories {
      id
      name
      description
      supplies {
        id
        name
        stockCount
      }
    }
  }
`

const CREATE_CATEGORY = gql`
  mutation CreateOfficeSupplyCategory($input: CreateOfficeSupplyCategoryInput!) {
    createOfficeSupplyCategory(input: $input) {
      id
      name
      description
    }
  }
`

const UPDATE_CATEGORY = gql`
  mutation UpdateOfficeSupplyCategory($id: Int!, $input: UpdateOfficeSupplyCategoryInput!) {
    updateOfficeSupplyCategory(id: $id, input: $input) {
      id
      name
      description
    }
  }
`

const DELETE_CATEGORY = gql`
  mutation DeleteOfficeSupplyCategory($id: Int!) {
    deleteOfficeSupplyCategory(id: $id) {
      id
    }
  }
`

const CategoryManager = () => {
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const { currentUser, hasRole } = useAuth()
  
  const isAdmin = hasRole('ADMIN')

  const { data, loading, error, refetch } = useQuery(GET_CATEGORIES)

  const [createCategory] = useMutation(CREATE_CATEGORY, {
    onCompleted: () => {
      toast.success('Category created successfully!')
      setShowForm(false)
      refetch()
    },
    onError: (error) => {
      toast.error(error.message)
    }
  })

  const [updateCategory] = useMutation(UPDATE_CATEGORY, {
    onCompleted: () => {
      toast.success('Category updated successfully!')
      setShowForm(false)
      setEditingCategory(null)
      refetch()
    },
    onError: (error) => {
      toast.error(error.message)
    }
  })

  const [deleteCategory] = useMutation(DELETE_CATEGORY, {
    onCompleted: () => {
      toast.success('Category deleted successfully!')
      refetch()
    },
    onError: (error) => {
      toast.error(error.message)
    }
  })

  const onSubmit = (data) => {
    if (editingCategory) {
      updateCategory({ variables: { id: editingCategory.id, input: data } })
    } else {
      createCategory({ variables: { input: data } })
    }
  }

  const handleDelete = async (category) => {
    if (category.supplies && category.supplies.length > 0) {
      toast.error('Cannot delete category with existing supplies. Move or delete supplies first.')
      return
    }

    if (window.confirm(`Are you sure you want to delete the category "${category.name}"?`)) {
      await deleteCategory({ variables: { id: category.id } })
    }
  }

  const handleEdit = (category) => {
    setEditingCategory(category)
    setShowForm(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading categories...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-red-800">Error Loading Categories</h3>
                <p className="text-red-600">{error.message}</p>
              </div>
            </div>
          </div>
        )}

        {/* Non-Admin Notice */}
        {!loading && !error && !isAdmin && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-yellow-800">View Only Access</h3>
                <p className="text-yellow-700">You can view supply categories, but admin privileges are required to add, edit, or delete categories. Contact your administrator for access.</p>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && (
        <>
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl p-8 mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Supply Categories
                </h1>
                {isAdmin && (
                  <div className="flex items-center px-3 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-semibold rounded-full">
                    <CogIcon className="h-4 w-4 mr-1" />
                    Admin Mode
                  </div>
                )}
              </div>
              <p className="text-gray-600">
                {isAdmin 
                  ? "Organize and manage office supply categories with full admin privileges" 
                  : "View office supply categories and organization"
                }
              </p>
            </div>
            {isAdmin && (
              <button
                onClick={() => setShowForm(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
              >
                <PlusIcon className="h-5 w-5" />
                <span>Add Category</span>
              </button>
            )}
            {!isAdmin && (
              <div className="px-6 py-3 bg-gray-100 text-gray-500 rounded-xl border border-gray-200 flex items-center space-x-2">
                <FolderIcon className="h-5 w-5" />
                <span>View Only</span>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FolderIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Categories</p>
                  <p className="text-2xl font-bold text-gray-900">{data?.officeSupplyCategories?.length || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <FolderIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Supplies</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {data?.officeSupplyCategories?.reduce((total, cat) => total + (cat.supplies?.length || 0), 0) || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <FolderIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Average per Category</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {data?.officeSupplyCategories?.length 
                      ? Math.round(data.officeSupplyCategories.reduce((total, cat) => total + (cat.supplies?.length || 0), 0) / data.officeSupplyCategories.length)
                      : 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Category Form Modal - Admin Only */}
        {showForm && isAdmin && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl p-8 max-w-2xl w-full">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>

              <Form onSubmit={onSubmit} className="space-y-6">
                <FormError error={null} wrapperClassName="rw-form-error-wrapper" titleClassName="rw-form-error-title" listClassName="rw-form-error-list" />

                {/* Category Name */}
                <div className="space-y-2">
                  <Label name="name" className="text-sm font-semibold text-gray-700">
                    Category Name *
                  </Label>
                  <TextField
                    name="name"
                    defaultValue={editingCategory?.name}
                    className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter category name"
                    validation={{ required: true }}
                  />
                  <FieldError name="name" className="text-red-500 text-sm" />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label name="description" className="text-sm font-semibold text-gray-700">
                    Description
                  </Label>
                  <TextAreaField
                    name="description"
                    defaultValue={editingCategory?.description}
                    className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                    rows="3"
                    placeholder="Enter category description..."
                  />
                  <FieldError name="description" className="text-red-500 text-sm" />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      setEditingCategory(null)
                    }}
                    className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <Submit
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  >
                    {editingCategory ? 'Update Category' : 'Create Category'}
                  </Submit>
                </div>
              </Form>
            </div>
          </div>
        )}

        {/* Categories List */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading categories...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-600">
              <ExclamationTriangleIcon className="h-12 w-12 mx-auto mb-4" />
              <p>Error loading categories: {error.message}</p>
            </div>
          ) : data?.officeSupplyCategories?.length === 0 ? (
            <div className="p-8 text-center text-gray-600">
              <FolderIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No categories found.</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                Create Your First Category
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {data?.officeSupplyCategories?.map((category) => (
                <div key={category.id} className="bg-white/50 backdrop-blur-sm rounded-xl border border-white/20 p-6 hover:shadow-lg transition-all duration-200 hover:bg-white/60">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center">
                      <div className="p-3 bg-blue-100 rounded-lg mr-3">
                        <FolderIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                        <p className="text-sm text-gray-600">{category.supplies?.length || 0} supplies</p>
                      </div>
                    </div>
                    {isAdmin && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(category)}
                          className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors duration-200"
                          title="Edit Category"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(category)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200"
                          title="Delete Category"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                    {!isAdmin && (
                      <div className="px-3 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                        View Only
                      </div>
                    )}
                  </div>

                  {category.description && (
                    <p className="text-sm text-gray-600 mb-4">{category.description}</p>
                  )}

                  {category.supplies && category.supplies.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-gray-700 uppercase">Recent Supplies:</p>
                      <div className="space-y-1">
                        {category.supplies.slice(0, 3).map((supply) => (
                          <div key={supply.id} className="flex justify-between items-center text-sm">
                            <span className="text-gray-700 truncate">{supply.name}</span>
                            <span className="text-gray-500 text-xs">{supply.stockCount} in stock</span>
                          </div>
                        ))}
                        {category.supplies.length > 3 && (
                          <p className="text-xs text-gray-500">
                            +{category.supplies.length - 3} more supplies...
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        </>
        )}
      </div>
    </div>
  )
}

export default CategoryManager
