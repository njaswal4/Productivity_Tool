import React, { useState } from 'react'
import { useQuery, useMutation, gql } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'
import { useAuth } from 'src/auth'
import { getDepartmentOptions } from 'src/lib/departments'

const AVAILABLE_ASSETS_QUERY = gql`
  query AvailableAssetsQuery {
    availableAssets {
      id
      assetId
      name
      model
      category {
        name
      }
    }
  }
`

const USERS_QUERY = gql`
  query UsersQuery {
    users {
      id
      name
      email
    }
  }
`

const CREATE_ASSET_ASSIGNMENT_MUTATION = gql`
  mutation CreateAssetAssignment($input: CreateAssetAssignmentInput!) {
    createAssetAssignment(input: $input) {
      id
      issueDate
      asset {
        assetId
        name
      }
      user {
        name
        email
      }
    }
  }
`

const AssetAssignmentForm = ({ onSuccess }) => {
  const { currentUser } = useAuth()
  const [selectedAsset, setSelectedAsset] = useState('')
  const [selectedUser, setSelectedUser] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('')
  const [expectedReturnDate, setExpectedReturnDate] = useState('')
  const [issueNotes, setIssueNotes] = useState('')
  const [condition, setCondition] = useState('Good')

  const { data: assetsData, loading: assetsLoading } = useQuery(AVAILABLE_ASSETS_QUERY)
  const { data: usersData, loading: usersLoading } = useQuery(USERS_QUERY)

  const [createAssignment, { loading: creating }] = useMutation(CREATE_ASSET_ASSIGNMENT_MUTATION, {
    onCompleted: (data) => {
      toast.success(`Asset ${data.createAssetAssignment.asset.assetId} assigned to ${data.createAssetAssignment.user.name || data.createAssetAssignment.user.email}`)
      // Reset form
      setSelectedAsset('')
      setSelectedUser('')
      setSelectedDepartment('')
      setExpectedReturnDate('')
      setIssueNotes('')
      setCondition('Good')
      onSuccess?.()
    },
    onError: (error) => {
      toast.error(`Error assigning asset: ${error.message}`)
    },
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!selectedAsset || !selectedUser) {
      toast.error('Please select both an asset and a user')
      return
    }

    const input = {
      assetId: parseInt(selectedAsset),
      userId: parseInt(selectedUser),
      issuedBy: currentUser?.name || currentUser?.email || 'Admin',
      condition,
      issueNotes: issueNotes.trim() || null,
      department: selectedDepartment || null,
    }

    if (expectedReturnDate) {
      input.expectedReturnDate = new Date(expectedReturnDate).toISOString()
    }

    try {
      await createAssignment({ variables: { input } })
    } catch (error) {
      console.error('Error creating assignment:', error)
    }
  }

  if (assetsLoading || usersLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading...</span>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Asset
          </label>
          <select
            value={selectedAsset}
            onChange={(e) => setSelectedAsset(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Choose an asset...</option>
            {assetsData?.availableAssets?.map(asset => (
              <option key={asset.id} value={asset.id}>
                {asset.assetId} - {asset.name} ({asset.category.name})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Assign to User
          </label>
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Choose a user...</option>
            {usersData?.users?.map(user => (
              <option key={user.id} value={user.id}>
                {user.name || user.email} ({user.email})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Department
          </label>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select department...</option>
            {getDepartmentOptions().map(dept => (
              <option key={dept.value} value={dept.value}>
                {dept.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Expected Return Date (Optional)
          </label>
          <input
            type="date"
            value={expectedReturnDate}
            onChange={(e) => setExpectedReturnDate(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Asset Condition
          </label>
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Excellent">Excellent</option>
            <option value="Good">Good</option>
            <option value="Fair">Fair</option>
            <option value="Poor">Poor</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Issue Notes (Optional)
        </label>
        <textarea
          value={issueNotes}
          onChange={(e) => setIssueNotes(e.target.value)}
          placeholder="Any notes about this asset assignment..."
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={creating || !selectedAsset || !selectedUser}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {creating ? 'Assigning...' : 'Assign Asset'}
        </button>
      </div>
    </form>
  )
}

export default AssetAssignmentForm
