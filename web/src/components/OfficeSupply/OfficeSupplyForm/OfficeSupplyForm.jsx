import { useState, useEffect } from 'react'
import { useMutation, useQuery } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'
import { Form, FormError, FieldError, Label, TextField, NumberField, SelectField, TextAreaField, Submit } from '@redwoodjs/forms'
import { gql } from 'graphql-tag'

const CREATE_OFFICE_SUPPLY = gql`
  mutation CreateOfficeSupply($input: CreateOfficeSupplyInput!) {
    createOfficeSupply(input: $input) {
      id
      name
      description
      stockCount
      unitPrice
      category {
        id
        name
      }
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
      category {
        id
        name
      }
    }
  }
`

const GET_CATEGORIES = gql`
  query GetOfficeSupplyCategories {
    officeSupplyCategories {
      id
      name
      description
    }
  }
`

const OfficeSupplyForm = ({ supply, onSave, onCancel, loading }) => {
  const [createSupply] = useMutation(CREATE_OFFICE_SUPPLY, {
    onCompleted: (data) => {
      toast.success('Office supply created successfully!')
      onSave(data.createOfficeSupply)
    },
    onError: (error) => {
      toast.error(error.message)
    }
  })

  const [updateSupply] = useMutation(UPDATE_OFFICE_SUPPLY, {
    onCompleted: (data) => {
      toast.success('Office supply updated successfully!')
      onSave(data.updateOfficeSupply)
    },
    onError: (error) => {
      toast.error(error.message)
    }
  })

  const { data: categoriesData, loading: categoriesLoading } = useQuery(GET_CATEGORIES)

  const onSubmit = (data) => {
    const input = {
      ...data,
      categoryId: parseInt(data.categoryId),
      stockCount: parseInt(data.stockCount) || 0,
      unitPrice: parseFloat(data.unitPrice) || 0,
    }

    if (supply) {
      updateSupply({ variables: { id: supply.id, input } })
    } else {
      createSupply({ variables: { input } })
    }
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
          {supply ? 'Edit Office Supply' : 'Add New Office Supply'}
        </h2>
        <p className="text-gray-600 mt-2">
          {supply ? 'Update the office supply information' : 'Create a new office supply item'}
        </p>
      </div>

      <Form onSubmit={onSubmit} className="space-y-6">
        <FormError error={null} wrapperClassName="rw-form-error-wrapper" titleClassName="rw-form-error-title" listClassName="rw-form-error-list" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Supply Name */}
          <div className="space-y-2">
            <Label name="name" className="text-sm font-semibold text-gray-700">
              Supply Name *
            </Label>
            <TextField
              name="name"
              defaultValue={supply?.name}
              className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Enter supply name"
              validation={{ required: true }}
            />
            <FieldError name="name" className="text-red-500 text-sm" />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label name="categoryId" className="text-sm font-semibold text-gray-700">
              Category *
            </Label>
            <SelectField
              name="categoryId"
              defaultValue={supply?.categoryId}
              className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              validation={{ required: true }}
            >
              <option value="">Select a category</option>
              {categoriesData?.officeSupplyCategories?.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </SelectField>
            <FieldError name="categoryId" className="text-red-500 text-sm" />
          </div>

          {/* Current Stock */}
          <div className="space-y-2">
            <Label name="stockCount" className="text-sm font-semibold text-gray-700">
              Stock Count *
            </Label>
            <NumberField
              name="stockCount"
              defaultValue={supply?.stockCount || 0}
              className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="0"
              validation={{ required: true, min: 0 }}
            />
            <FieldError name="stockCount" className="text-red-500 text-sm" />
          </div>

          {/* Unit Price */}
          <div className="space-y-2">
            <Label name="unitPrice" className="text-sm font-semibold text-gray-700">
              Unit Price
            </Label>
            <NumberField
              name="unitPrice"
              defaultValue={supply?.unitPrice}
              className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="0.00"
              step="0.01"
              validation={{ min: 0 }}
            />
            <FieldError name="unitPrice" className="text-red-500 text-sm" />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label name="description" className="text-sm font-semibold text-gray-700">
            Description
          </Label>
          <TextAreaField
            name="description"
            defaultValue={supply?.description}
            className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
            rows="3"
            placeholder="Enter supply description..."
          />
          <FieldError name="description" className="text-red-500 text-sm" />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-200 hover:shadow-lg"
            >
              Cancel
            </button>
          )}
          <Submit
            disabled={loading || categoriesLoading}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? 'Saving...' : supply ? 'Update Supply' : 'Create Supply'}
          </Submit>
        </div>
      </Form>
    </div>
  )
}

export default OfficeSupplyForm
