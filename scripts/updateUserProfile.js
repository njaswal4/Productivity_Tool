/**
 * Script to update user profile with employee management fields
 * Usage: yarn rw exec updateUserProfile
 */

import { db } from '$api/src/lib/db'

export default async () => {
  try {
    console.log('🔍 Looking for user: njaswal@2cretiv.com')
    
    const user = await db.user.findUnique({
      where: { email: 'njaswal@2cretiv.com' }
    })
    
    if (!user) {
      console.log('❌ User not found')
      return
    }
    
    console.log('👤 Found user:', user.name)
    
    // Update the user with employee management fields
    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: {
        employeeId: 'EMP001',
        department: 'ENGINEERING',
        designation: 'LEAD_DEVELOPER',
        dateOfJoining: new Date('2023-01-15T00:00:00.000Z'), // Proper UTC date
        // reportingManager: null, // You can set this if there's a manager
      }
    })
    
    console.log('✅ Successfully updated user profile:')
    console.log('   Employee ID:', updatedUser.employeeId)
    console.log('   Department:', updatedUser.department)
    console.log('   Designation:', updatedUser.designation)
    console.log('   Date of Joining:', updatedUser.dateOfJoining?.toLocaleDateString('en-US'))
    
  } catch (error) {
    console.error('❌ Error updating user profile:', error)
  }
}
