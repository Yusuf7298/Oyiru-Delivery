import { db } from '@/lib/db'
import { products } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

async function updateImages() {
  console.log('Updating images...')
  const imageMap = {
    'Tomatoes': '/products/tomatoes.png',
    'Potatoes': '/products/potatoes.png',
    'Onions': '/products/onions.png',
    'Carrots': '/products/carrots.png',
    'Milk (1L)': '/products/milk.png'
  }

  try {
    for (const [name, image] of Object.entries(imageMap)) {
      const res = await db.update(products).set({ image }).where(eq(products.name, name))
      console.log(`Updated ${name} to ${image}`)
    }
    console.log('Images updated successfully!')
  } catch (error) {
    console.error('Failed to update images:', error)
  }
  process.exit(0)
}

updateImages()
