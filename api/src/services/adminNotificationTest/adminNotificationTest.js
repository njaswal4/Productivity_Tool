import { 
  sendSupplyRequestNotificationToAdmins,
  sendAssetRequestNotificationToAdmins,
  sendVacationRequestNotificationToAdmins 
} from 'src/lib/emailService'
import { requireAuth } from 'src/lib/auth'

export const testAdminNotification = async ({ type, testData }) => {
  requireAuth({ roles: ['ADMIN'] })

  try {
    // Create mock data for testing
    const mockUser = {
      name: 'Test User',
      email: 'testuser@example.com',
      department: 'ENGINEERING'
    }

    const mockRequest = {
      createdAt: new Date(),
      reason: testData || 'This is a test notification'
    }

    let result

    switch (type) {
      case 'supply':
        const mockSupply = {
          name: 'Test Office Supply',
          category: { name: 'Office Supplies' }
        }
        mockRequest.quantityRequested = 5
        
        await sendSupplyRequestNotificationToAdmins(mockUser, mockRequest, mockSupply)
        result = 'Supply request admin notifications sent successfully'
        break

      case 'asset':
        const mockAssetCategory = {
          name: 'Test Asset Category'
        }
        mockRequest.expectedReturnDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
        
        await sendAssetRequestNotificationToAdmins(mockUser, mockRequest, mockAssetCategory)
        result = 'Asset request admin notifications sent successfully'
        break

      case 'vacation':
        mockRequest.startDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
        mockRequest.endDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days from now
        
        await sendVacationRequestNotificationToAdmins(mockUser, mockRequest)
        result = 'Vacation request admin notifications sent successfully'
        break

      default:
        throw new Error('Invalid notification type. Use: supply, asset, or vacation')
    }

    console.log(`✅ Admin notification test completed for type: ${type}`)
    
    return {
      success: true,
      message: result
    }
  } catch (error) {
    console.error('❌ Admin notification test failed:', error)
    return {
      success: false,
      message: `Failed to send admin notifications: ${error.message}`
    }
  }
}
