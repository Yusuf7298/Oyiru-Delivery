import { db } from '@/lib/db'
import { categories_oyru, products } from '@/lib/db/schema'

async function seed() {
  try {
    console.log('Seeding database...')

    // Clear existing data
    await db.delete(products)
    await db.delete(categories_oyru)

    // Create categories
    const categoryIds = [
      'cat-1',
      'cat-2',
      'cat-3',
      'cat-4',
      'cat-5',
    ]

    const categories_data = [
      { id: categoryIds[0], name: 'Fresh Produce', image: 'https://via.placeholder.com/200?text=Fresh+Produce' },
      { id: categoryIds[1], name: 'Dairy & Eggs', image: 'https://via.placeholder.com/200?text=Dairy' },
      { id: categoryIds[2], name: 'Beverages', image: 'https://via.placeholder.com/200?text=Beverages' },
      { id: categoryIds[3], name: 'Snacks', image: 'https://via.placeholder.com/200?text=Snacks' },
      { id: categoryIds[4], name: 'Essentials', image: 'https://via.placeholder.com/200?text=Essentials' },
    ]

    for (const cat of categories_data) {
      await db.insert(categories_oyru).values(cat)
    }

    console.log('✓ Categories created')

    // Create products
    const products_data = [
      // Fresh Produce
      { id: 'prod-1', categoryId: categoryIds[0], name: 'Tomatoes', description: 'Fresh red tomatoes (1 kg)', price: 40, stockQuantity: 100, unit: 'kg' },
      { id: 'prod-2', categoryId: categoryIds[0], name: 'Potatoes', description: 'Fresh potatoes (2 kg)', price: 60, stockQuantity: 150, unit: 'kg' },
      { id: 'prod-3', categoryId: categoryIds[0], name: 'Onions', description: 'White onions (1 kg)', price: 35, stockQuantity: 120, unit: 'kg' },
      { id: 'prod-4', categoryId: categoryIds[0], name: 'Carrots', description: 'Fresh carrots (500 g)', price: 25, stockQuantity: 80, unit: 'g' },

      // Dairy & Eggs
      { id: 'prod-5', categoryId: categoryIds[1], name: 'Milk (1L)', description: 'Fresh cow milk', price: 65, stockQuantity: 200, unit: 'L' },
      { id: 'prod-6', categoryId: categoryIds[1], name: 'Eggs (12 count)', description: 'Fresh eggs', price: 85, stockQuantity: 100, unit: 'piece' },
      { id: 'prod-7', categoryId: categoryIds[1], name: 'Butter', description: 'Salted butter (200g)', price: 120, stockQuantity: 50, unit: 'g' },
      { id: 'prod-8', categoryId: categoryIds[1], name: 'Yogurt', description: 'Plain yogurt (500ml)', price: 45, stockQuantity: 75, unit: 'ml' },

      // Beverages
      { id: 'prod-9', categoryId: categoryIds[2], name: 'Orange Juice', description: 'Fresh orange juice (1L)', price: 95, stockQuantity: 50, unit: 'L' },
      { id: 'prod-10', categoryId: categoryIds[2], name: 'Coffee', description: 'Ground coffee (250g)', price: 180, stockQuantity: 40, unit: 'g' },
      { id: 'prod-11', categoryId: categoryIds[2], name: 'Tea', description: 'Black tea (100g)', price: 120, stockQuantity: 60, unit: 'g' },
      { id: 'prod-12', categoryId: categoryIds[2], name: 'Bottled Water', description: 'Pure water (1L)', price: 20, stockQuantity: 300, unit: 'L' },

      // Snacks
      { id: 'prod-13', categoryId: categoryIds[3], name: 'Chips', description: 'Crispy potato chips (150g)', price: 50, stockQuantity: 100, unit: 'g' },
      { id: 'prod-14', categoryId: categoryIds[3], name: 'Cookies', description: 'Chocolate cookies (200g)', price: 60, stockQuantity: 80, unit: 'g' },
      { id: 'prod-15', categoryId: categoryIds[3], name: 'Almonds', description: 'Raw almonds (250g)', price: 150, stockQuantity: 50, unit: 'g' },
      { id: 'prod-16', categoryId: categoryIds[3], name: 'Biscuits', description: 'Digestive biscuits (200g)', price: 40, stockQuantity: 120, unit: 'g' },

      // Essentials
      { id: 'prod-17', categoryId: categoryIds[4], name: 'Soap', description: 'Bathing soap (100g)', price: 30, stockQuantity: 200, unit: 'g' },
      { id: 'prod-18', categoryId: categoryIds[4], name: 'Detergent', description: 'Laundry detergent (500ml)', price: 80, stockQuantity: 150, unit: 'ml' },
      { id: 'prod-19', categoryId: categoryIds[4], name: 'Toothpaste', description: 'Mint toothpaste (100ml)', price: 50, stockQuantity: 100, unit: 'ml' },
      { id: 'prod-20', categoryId: categoryIds[4], name: 'Toilet Paper', description: 'Soft toilet rolls (4 pack)', price: 120, stockQuantity: 80, unit: 'piece' },
    ]

    for (const prod of products_data) {
      await db.insert(products).values({
        ...prod,
        isAvailable: true,
      })
    }

    console.log('✓ Products created')
    console.log('\nDatabase seeded successfully!')
  } catch (error) {
    console.error('Seeding failed:', error)
    process.exit(1)
  }
}

seed()
