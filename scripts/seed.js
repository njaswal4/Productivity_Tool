import { db } from 'api/src/lib/db'

// Manually apply seeds via the `yarn rw prisma db seed` command.
//
// Seeds automatically run the first time you run the `yarn rw prisma migrate dev`
// command and every time you run the `yarn rw prisma migrate reset` command.
//
// See https://redwoodjs.com/docs/database-seeds for more info

export default async () => {
  try {
    // Seed Asset Categories
    console.info('🏷️  Seeding Asset Categories...')
    
    const categories = [
      { name: 'Laptop', description: 'Portable computers for employees' },
      { name: 'Monitor', description: 'External displays and monitors' },
      { name: 'Phone', description: 'Mobile phones and smartphones' },
      { name: 'Tablet', description: 'Tablets and iPads' },
      { name: 'Accessories', description: 'Keyboards, mice, chargers, etc.' },
      { name: 'Network Equipment', description: 'Routers, switches, access points' },
    ]

    const createdCategories = []
    for (const category of categories) {
      const existing = await db.assetCategory.findUnique({
        where: { name: category.name }
      })
      
      if (!existing) {
        const created = await db.assetCategory.create({ data: category })
        createdCategories.push(created)
        console.info(`Created category: ${created.name}`)
      } else {
        createdCategories.push(existing)
        console.info(`Category already exists: ${existing.name}`)
      }
    }

    // Seed Sample Assets
    console.info('💻 Seeding Sample Assets...')
    
    const laptopCategory = createdCategories.find(c => c.name === 'Laptop')
    const monitorCategory = createdCategories.find(c => c.name === 'Monitor')
    const phoneCategory = createdCategories.find(c => c.name === 'Phone')

    const assets = [
      // Laptops
      {
        assetId: 'LP001',
        name: 'MacBook Pro 16-inch',
        model: 'A2338',
        serialNumber: 'C02Z91234567',
        purchaseDate: new Date('2024-01-15'),
        warrantyExpiry: new Date('2027-01-15'),
        purchasePrice: 2499.00,
        vendor: 'Apple Inc.',
        categoryId: laptopCategory.id,
        location: 'IT Storage Room',
      },
      {
        assetId: 'LP002',
        name: 'Dell XPS 15',
        model: '9520',
        serialNumber: 'DL789123456',
        purchaseDate: new Date('2024-02-20'),
        warrantyExpiry: new Date('2027-02-20'),
        purchasePrice: 1899.00,
        vendor: 'Dell Technologies',
        categoryId: laptopCategory.id,
        location: 'IT Storage Room',
      },
      {
        assetId: 'LP003',
        name: 'ThinkPad X1 Carbon',
        model: 'Gen 11',
        serialNumber: 'LN456789123',
        purchaseDate: new Date('2024-03-10'),
        warrantyExpiry: new Date('2027-03-10'),
        purchasePrice: 1699.00,
        vendor: 'Lenovo',
        categoryId: laptopCategory.id,
        location: 'IT Storage Room',
      },
      // Monitors
      {
        assetId: 'MON001',
        name: 'Dell UltraSharp 27"',
        model: 'U2723QE',
        serialNumber: 'DM123456789',
        purchaseDate: new Date('2024-01-20'),
        warrantyExpiry: new Date('2027-01-20'),
        purchasePrice: 599.00,
        vendor: 'Dell Technologies',
        categoryId: monitorCategory.id,
        location: 'IT Storage Room',
      },
      {
        assetId: 'MON002',
        name: 'LG 4K UltraWide',
        model: '34WP65C-B',
        serialNumber: 'LG987654321',
        purchaseDate: new Date('2024-02-15'),
        warrantyExpiry: new Date('2027-02-15'),
        purchasePrice: 449.00,
        vendor: 'LG Electronics',
        categoryId: monitorCategory.id,
        location: 'IT Storage Room',
      },
      // Phones
      {
        assetId: 'PH001',
        name: 'iPhone 15 Pro',
        model: 'A3108',
        serialNumber: 'IP123456789',
        purchaseDate: new Date('2024-04-01'),
        warrantyExpiry: new Date('2025-04-01'),
        purchasePrice: 999.00,
        vendor: 'Apple Inc.',
        categoryId: phoneCategory.id,
        location: 'IT Storage Room',
      },
      {
        assetId: 'PH002',
        name: 'Samsung Galaxy S24',
        model: 'SM-S921B',
        serialNumber: 'SG987654321',
        purchaseDate: new Date('2024-04-15'),
        warrantyExpiry: new Date('2025-04-15'),
        purchasePrice: 849.00,
        vendor: 'Samsung',
        categoryId: phoneCategory.id,
        location: 'IT Storage Room',
      },
    ]

    for (const asset of assets) {
      const existing = await db.asset.findUnique({
        where: { assetId: asset.assetId }
      })
      
      if (!existing) {
        const created = await db.asset.create({ data: asset })
        console.info(`Created asset: ${created.assetId} - ${created.name}`)
      } else {
        console.info(`Asset already exists: ${existing.assetId} - ${existing.name}`)
      }
    }

    console.info('\n✅ Asset tracker seeding completed successfully!\n')
  } catch (error) {
    console.error('❌ Error seeding asset data:', error)
  }
}
