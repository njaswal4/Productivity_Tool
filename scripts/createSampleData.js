/**
 * Script to create sample project data for testing
 * Usage: yarn rw exec createSampleData
 */

import { db } from '$api/src/lib/db'

export default async () => {
  try {
    console.log('🚀 Creating sample project data...')
    
    // Create a sample project
    const project = await db.project.create({
      data: {
        name: 'E-Commerce Platform Redesign',
        code: 'ECOMM-2025-V4',
        description: 'Complete redesign of the company e-commerce platform with modern UI/UX',
        status: 'ACTIVE',
        priority: 'HIGH',
        startDate: new Date('2025-07-01T00:00:00.000Z'),
        endDate: new Date('2025-12-31T00:00:00.000Z'),
        managerId: 1, // Your user as the manager
        budget: 150000.00,
      }
    })
    
    console.log('✅ Created project:', project.name)
    
    // Create a project allocation for yourself
    const allocation = await db.projectAllocation.create({
      data: {
        projectId: project.id,
        userId: 1, // Your user ID
        role: 'Lead Developer',
        hoursAllocated: 6.0,
        isActive: true,
        allocatedBy: 1, // Self-allocated for testing
      }
    })
    
    console.log('✅ Created project allocation for:', allocation.role)
    
    // Create a daily update for today
    const update = await db.dailyProjectUpdate.create({
      data: {
        allocationId: allocation.id,
        projectId: project.id,
        date: new Date(),
        status: 'ON_TRACK',
        description: 'Completed initial wireframes for the product catalog page. Started working on the user authentication flow design.',
        hoursWorked: 5.5,
        blockers: null,
        nextDayPlan: 'Continue with authentication flow implementation and review database schema.',
        completionPercentage: 15.0,
        milestoneReached: 'UI Wireframes Complete',
      }
    })
    
    console.log('✅ Created daily update for today')
    
    // Create a project meeting
    const meeting = await db.projectMeeting.create({
      data: {
        projectId: project.id,
        title: 'Weekly Sprint Planning',
        description: 'Planning meeting for the upcoming sprint',
        meetingDate: new Date(),
        duration: 60,
        meetingType: 'PLANNING',
        location: 'Conference Room A',
        organizerId: 1, // Fixed field name
      }
    })
    
    console.log('✅ Created project meeting:', meeting.title)
    
    console.log('\n🎉 Sample data creation completed!')
    console.log('Now you can:')
    console.log('1. See the project in Project Management tab')
    console.log('2. View your allocation in Daily Tasks tab')
    console.log('3. See yourself in Employee Management tab')
    console.log('4. View reports in Reports tab')
    
  } catch (error) {
    console.error('❌ Error creating sample data:', error)
  }
}
