import { db } from 'api/src/lib/db.js'

export default async () => {
  try {
    console.log('Starting to seed office supplies data...')

    // Clear existing data to prevent duplicates
    console.log('Clearing existing supply requests...')
    await db.supplyRequest.deleteMany({})
    
    console.log('Clearing existing office supplies...')
    await db.officeSupply.deleteMany({})
    
    console.log('Clearing existing office supply categories...')
    await db.officeSupplyCategory.deleteMany({})

    console.log('Creating office supply categories...')
    
    // Create office supply categories
    const categories = await Promise.all([
      db.officeSupplyCategory.create({
        data: {
          name: 'Office Furniture',
          description: 'Desks, chairs, cabinets, and other office furniture'
        }
      }),
      db.officeSupplyCategory.create({
        data: {
          name: 'Stationery',
          description: 'Pens, paper, notebooks, and writing materials'
        }
      }),
      db.officeSupplyCategory.create({
        data: {
          name: 'Technology',
          description: 'Computers, peripherals, and tech accessories'
        }
      }),
      db.officeSupplyCategory.create({
        data: {
          name: 'Break Room',
          description: 'Coffee, snacks, kitchen supplies, and break room items'
        }
      }),
      db.officeSupplyCategory.create({
        data: {
          name: 'Cleaning Supplies',
          description: 'Cleaning products, tissues, sanitizers'
        }
      })
    ])

    console.log('Created categories:', categories.map(c => c.name))

    console.log('Creating office supplies...')
    
    // Create office supplies
    const supplies = await Promise.all([
      // Stationery
      db.officeSupply.create({
        data: {
          name: 'Blue Ballpoint Pens',
          description: 'Standard blue ink ballpoint pens, pack of 12',
          categoryId: categories.find(c => c.name === 'Stationery').id,
          stockCount: 150,
          unitPrice: 8.99
        }
      }),
      db.officeSupply.create({
        data: {
          name: 'A4 Copy Paper',
          description: 'White A4 copy paper, 500 sheets per ream',
          categoryId: categories.find(c => c.name === 'Stationery').id,
          stockCount: 45,
          unitPrice: 12.50
        }
      }),
      db.officeSupply.create({
        data: {
          name: 'Sticky Notes',
          description: 'Yellow 3x3 inch sticky notes, pack of 12',
          categoryId: categories.find(c => c.name === 'Stationery').id,
          stockCount: 80,
          unitPrice: 15.99
        }
      }),
      db.officeSupply.create({
        data: {
          name: 'Notebooks',
          description: 'Spiral bound notebooks, college ruled, 70 sheets',
          categoryId: categories.find(c => c.name === 'Stationery').id,
          stockCount: 25,
          unitPrice: 3.25
        }
      }),

      // Technology
      db.officeSupply.create({
        data: {
          name: 'Wireless Mouse',
          description: 'Ergonomic wireless optical mouse with USB receiver',
          categoryId: categories.find(c => c.name === 'Technology').id,
          stockCount: 15,
          unitPrice: 29.99
        }
      }),
      db.officeSupply.create({
        data: {
          name: 'USB Cables',
          description: 'USB-A to USB-C cables, 6 feet long',
          categoryId: categories.find(c => c.name === 'Technology').id,
          stockCount: 30,
          unitPrice: 12.99
        }
      }),
      db.officeSupply.create({
        data: {
          name: 'External Keyboards',
          description: 'Wired USB keyboards, full size with number pad',
          categoryId: categories.find(c => c.name === 'Technology').id,
          stockCount: 8,
          unitPrice: 45.99
        }
      }),

      // Break Room
      db.officeSupply.create({
        data: {
          name: 'Coffee Pods',
          description: 'Medium roast coffee pods, box of 24',
          categoryId: categories.find(c => c.name === 'Break Room').id,
          stockCount: 12,
          unitPrice: 18.99
        }
      }),
      db.officeSupply.create({
        data: {
          name: 'Disposable Cups',
          description: '12oz disposable paper cups, pack of 50',
          categoryId: categories.find(c => c.name === 'Break Room').id,
          stockCount: 20,
          unitPrice: 9.99
        }
      }),

      // Cleaning Supplies
      db.officeSupply.create({
        data: {
          name: 'Hand Sanitizer',
          description: '70% alcohol hand sanitizer, 8oz bottles',
          categoryId: categories.find(c => c.name === 'Cleaning Supplies').id,
          stockCount: 25,
          unitPrice: 4.99
        }
      }),
      db.officeSupply.create({
        data: {
          name: 'Disinfectant Wipes',
          description: 'Antibacterial disinfectant wipes, 80 count container',
          categoryId: categories.find(c => c.name === 'Cleaning Supplies').id,
          stockCount: 18,
          unitPrice: 6.99
        }
      }),
      db.officeSupply.create({
        data: {
          name: 'Toilet Paper',
          description: '2-ply toilet paper, 12 rolls per pack',
          categoryId: categories.find(c => c.name === 'Cleaning Supplies').id,
          stockCount: 8,
          unitPrice: 15.99
        }
      }),

      // Office Furniture
      db.officeSupply.create({
        data: {
          name: 'Desk Lamps',
          description: 'LED desk lamps with adjustable brightness',
          categoryId: categories.find(c => c.name === 'Office Furniture').id,
          stockCount: 5,
          unitPrice: 89.99
        }
      }),
      db.officeSupply.create({
        data: {
          name: 'Storage Boxes',
          description: 'Cardboard file storage boxes with lids',
          categoryId: categories.find(c => c.name === 'Office Furniture').id,
          stockCount: 15,
          unitPrice: 12.99
        }
      })
    ])

    console.log('Created supplies:', supplies.map(s => s.name))

    // Create some sample supply requests if there are users
    const users = await db.user.findMany({ take: 3 })
    
    if (users.length > 0) {
      console.log('Creating sample supply requests...')
      
      const requests = await Promise.all([
        db.supplyRequest.create({
          data: {
            userId: users[0].id,
            supplyId: supplies.find(s => s.name === 'Blue Ballpoint Pens').id,
            quantity: 2,
            reason: 'Need pens for daily note-taking and document signing',
            status: 'Pending'
          }
        }),
        db.supplyRequest.create({
          data: {
            userId: users[0].id,
            supplyId: supplies.find(s => s.name === 'Wireless Mouse').id,
            quantity: 1,
            reason: 'Current mouse is malfunctioning, affecting productivity',
            status: 'Approved'
          }
        }),
        ...(users.length > 1 ? [db.supplyRequest.create({
          data: {
            userId: users[1].id,
            supplyId: supplies.find(s => s.name === 'Notebooks').id,
            quantity: 3,
            reason: 'Need notebooks for meeting notes and project planning',
            status: 'Pending'
          }
        })] : []),
        ...(users.length > 2 ? [db.supplyRequest.create({
          data: {
            userId: users[2].id,
            supplyId: supplies.find(s => s.name === 'Coffee Pods').id,
            quantity: 5,
            reason: 'Break room coffee supply is running low',
            status: 'Rejected'
          }
        })] : [])
      ])

      console.log('Created sample requests:', requests.length)
    }

    console.log('✅ Office supplies seed data created successfully!')

  } catch (error) {
    console.error('❌ Error seeding office supplies data:', error)
    throw error
  }
}
