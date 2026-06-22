'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'

export interface CartItem {
  productId: string
  name: string
  price: number
  quantity: number
  image?: string
  categoryId?: string
}

export interface Cart {
  items: CartItem[]
  totalAmount: number
}

interface CartContextType {
  cart: Cart
  addToCart: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getCartTotal: () => number
  getItemCount: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart>({
    items: [],
    totalAmount: 0,
  })

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('oyru_cart')
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart))
      } catch (error) {
        console.error('Failed to load cart from localStorage:', error)
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('oyru_cart', JSON.stringify(cart))
  }, [cart])

  const calculateTotal = useCallback((items: CartItem[]) => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }, [])

  const addToCart = useCallback((item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    setCart((prevCart) => {
      // Check if item already exists
      const existingItem = prevCart.items.find((i) => i.productId === item.productId)
      let newItems: CartItem[]

      if (existingItem) {
        newItems = prevCart.items.map((i) =>
          i.productId === item.productId
            ? { ...i, quantity: i.quantity + (item.quantity || 1) }
            : i
        )
      } else {
        newItems = [...prevCart.items, { ...item, quantity: item.quantity || 1 }]
      }

      return {
        ...prevCart,
        items: newItems,
        totalAmount: calculateTotal(newItems),
      }
    })
  }, [calculateTotal])

  const removeFromCart = useCallback((productId: string) => {
    setCart((prevCart) => {
      const newItems = prevCart.items.filter((i) => i.productId !== productId)
      return {
        ...prevCart,
        items: newItems,
        totalAmount: calculateTotal(newItems),
      }
    })
  }, [calculateTotal])

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }

    setCart((prevCart) => {
      const newItems = prevCart.items.map((i) =>
        i.productId === productId ? { ...i, quantity } : i
      )
      return {
        ...prevCart,
        items: newItems,
        totalAmount: calculateTotal(newItems),
      }
    })
  }, [calculateTotal, removeFromCart])

  const clearCart = useCallback(() => {
    setCart({
      items: [],
      totalAmount: 0,
    })
  }, [])

  const getCartTotal = useCallback(() => {
    return cart.totalAmount
  }, [cart.totalAmount])

  const getItemCount = useCallback(() => {
    return cart.items.reduce((sum, item) => sum + item.quantity, 0)
  }, [cart.items])

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
