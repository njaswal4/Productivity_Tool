import { Metadata } from '@redwoodjs/web'
import { useAuth } from 'src/auth'
import { useState } from 'react'
import { useQuery } from '@redwoodjs/web'
import Header from 'src/components/Header/Header'
import AssetTracker from 'src/components/AssetTracker/AssetTracker'
import AssetManagement from 'src/components/AssetTracker/AssetManagement'
import AssetReports from 'src/components/AssetTracker/AssetReports'

const ASSET_STATS_QUERY = gql`
  query AssetStatsQuery {
    assets {
      id
      status
      warrantyExpiry
      category {
        id
        name
      }
    }
    assetCategories {
      id
      name
      description
      assets {
        id
        status
      }
    }
    activeAssetAssignments {
      id
    }
  }
`

const AssetTrackerPage = () => {
  const { currentUser, isAuthenticated } = useAuth()
  const [refreshKey, setRefreshKey] = useState(0)
  const [activeTab, setActiveTab] = useState('tracker')

  const isAdmin = currentUser?.roles?.includes('ADMIN')

  // Fetch asset statistics
  const { data: statsData, loading: statsLoading } = useQuery(ASSET_STATS_QUERY)

  const handleAssetUpdated = () => {
    setRefreshKey(prev => prev + 1)
  }

  // Calculate dynamic stats
  const totalAssets = statsData?.assets?.length || 0
  const availableAssets = statsData?.assets?.filter(asset => asset.status === 'Available').length || 0
  const assignedAssets = statsData?.activeAssetAssignments?.length || 0
  const warrantyExpiringSoon = statsData?.assets?.filter(asset => {
    if (!asset.warrantyExpiry) return false
    const expiryDate = new Date(asset.warrantyExpiry)
    const threeMonthsFromNow = new Date()
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3)
    return expiryDate <= threeMonthsFromNow && expiryDate >= new Date()
  }).length || 0

  // Category icon mapping
  const getCategoryIcon = (categoryName) => {
    const iconMap = {
      'Laptop': '💻',
      'Monitor': '🖥️',
      'Phone': '📱',
      'Tablet': '📱',
      'Accessories': '⌨️',
      'Network Equipment': '🌐',
      'Printer': '🖨️',
      'Camera': '📷',
      'Speaker': '🔊',
      'Headset': '🎧',
    }
    return iconMap[categoryName] || '📦'
  }

  // Category color mapping
  const getCategoryColor = (index) => {
    const colors = [
      'bg-blue-50 border-blue-200',
      'bg-green-50 border-green-200',
      'bg-purple-50 border-purple-200',
      'bg-yellow-50 border-yellow-200',
      'bg-red-50 border-red-200',
      'bg-indigo-50 border-indigo-200',
      'bg-pink-50 border-pink-200',
      'bg-orange-50 border-orange-200',
    ]
    return colors[index % colors.length] || 'bg-gray-50 border-gray-200'
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please log in</h1>
          <p className="text-gray-600">You need to be logged in to access the Asset Tracker.</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Metadata 
        title="Asset Tracker" 
        description="Track and manage company assets and assignments" 
      />
      
      <Header />
      
      <main className="min-h-screen bg-gray-50 pt-20 px-4 md:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto py-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Asset Tracker</h1>
            <p className="mt-2 text-gray-600">
              Track company-owned assets and their assignments to employees
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-8">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('tracker')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'tracker'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Asset Inventory
              </button>
              {isAdmin && (
                <button
                  onClick={() => setActiveTab('management')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'management'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Asset Management
                </button>
              )}
              <button
                onClick={() => setActiveTab('reports')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'reports'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Reports
              </button>
            </nav>
          </div>

          <div className="space-y-8">
            {/* Asset Tracker Tab */}
            {activeTab === 'tracker' && (
              <div key={refreshKey}>
                <AssetTracker />
              </div>
            )}

            {/* Admin Management Tab */}
            {activeTab === 'management' && isAdmin && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Asset Management</h2>
                  <p className="text-gray-600">Create new assets, categories, and assign assets to employees</p>
                </div>
                <AssetManagement onAssetCreated={handleAssetUpdated} />
              </div>
            )}

            {/* Reports Tab */}
            {activeTab === 'reports' && (
              <div key={refreshKey}>
                <AssetReports />
              </div>
            )}
          </div>

          {/* Quick Stats Section - Now Dynamic */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {statsLoading ? '...' : totalAssets}
                </div>
                <div className="text-sm font-medium text-gray-900 mt-1">Total Assets</div>
                <div className="text-xs text-gray-500">In inventory</div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {statsLoading ? '...' : availableAssets}
                </div>
                <div className="text-sm font-medium text-gray-900 mt-1">Available</div>
                <div className="text-xs text-gray-500">Ready to assign</div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {statsLoading ? '...' : assignedAssets}
                </div>
                <div className="text-sm font-medium text-gray-900 mt-1">Assigned</div>
                <div className="text-xs text-gray-500">To employees</div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {statsLoading ? '...' : warrantyExpiringSoon}
                </div>
                <div className="text-sm font-medium text-gray-900 mt-1">Warranty</div>
                <div className="text-xs text-gray-500">Expiring soon</div>
              </div>
            </div>
          </div>

          {/* Asset Categories Overview - Now Dynamic */}
          <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Asset Categories</h3>
            {statsLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading categories...</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {statsData?.assetCategories?.map((category, index) => {
                  const assetCount = category.assets?.length || 0
                  const availableCount = category.assets?.filter(asset => asset.status === 'Available').length || 0
                  const assignedCount = category.assets?.filter(asset => asset.status === 'Assigned').length || 0
                  
                  return (
                    <div 
                      key={category.id} 
                      className={`text-center p-3 rounded-lg border ${getCategoryColor(index)} hover:shadow-md transition-shadow cursor-pointer`}
                      title={`${category.description || category.name} - ${assetCount} total assets`}
                    >
                      <div className="text-2xl mb-2">{getCategoryIcon(category.name)}</div>
                      <div className="text-sm font-medium text-gray-900">{category.name}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {assetCount} total
                      </div>
                      <div className="text-xs text-gray-400 flex justify-center gap-2 mt-1">
                        <span className="text-green-600">{availableCount} free</span>
                        <span className="text-blue-600">{assignedCount} used</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            
            {!statsLoading && (!statsData?.assetCategories || statsData.assetCategories.length === 0) && (
              <div className="text-center py-8">
                <p className="text-gray-500">No asset categories found. Create some categories to get started!</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  )
}

export default AssetTrackerPage
