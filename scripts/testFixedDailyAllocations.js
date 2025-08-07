import { db } from 'api/src/lib/db'

export default async ({ args }) => {
  console.log('Testing fixed dailyAllocations...\n')

  const userId = 1
  const date = new Date()  // Today

  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)
  
  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)

  console.log('Testing with:', { userId, date: date.toISOString() })

  try {
    const allocations = await db.projectAllocation.findMany({
      where: {
        userId,
        isActive: true,
        project: {
          status: {
            in: ['ACTIVE', 'ON_HOLD'],
          },
        },
      },
      include: {
        project: {
          include: {
            manager: true,
            meetings: {
              where: {
                meetingDate: {
                  gte: startOfDay,
                  lte: endOfDay,
                },
                status: {
                  in: ['Scheduled', 'In Progress'],
                },
              },
            },
          },
        },
        dailyUpdates: {
          where: {
            date: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
        },
      },
      orderBy: { project: { name: 'asc' } },
    })

    console.log(`Found ${allocations.length} allocations for user ${userId}:`)
    
    allocations.forEach((allocation, index) => {
      console.log(`\nAllocation ${index + 1}:`)
      console.log(`  - Project: ${allocation.project.name} (Status: ${allocation.project.status})`)
      console.log(`  - Role: ${allocation.role || 'Not specified'}`)
      console.log(`  - Hours Allocated: ${allocation.hoursAllocated || 'Not specified'}`)
      console.log(`  - Allocated Date: ${allocation.allocatedDate}`)
      console.log(`  - Manager: ${allocation.project.manager?.name || 'None'}`)
      console.log(`  - Daily Updates Today: ${allocation.dailyUpdates.length}`)
      console.log(`  - Meetings Today: ${allocation.project.meetings.length}`)
    })

    // Test with other users too
    for (const testUserId of [2, 5]) {
      const userAllocations = await db.projectAllocation.findMany({
        where: {
          userId: testUserId,
          isActive: true,
          project: {
            status: {
              in: ['ACTIVE', 'ON_HOLD'],
            },
          },
        },
        include: {
          project: true,
        },
      })
      console.log(`\nUser ${testUserId} has ${userAllocations.length} active allocations`)
    }

  } catch (error) {
    console.error('Error testing fixed dailyAllocations:', error)
  }
}
