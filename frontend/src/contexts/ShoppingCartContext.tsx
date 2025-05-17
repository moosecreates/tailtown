import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CartItem {
  id: string;
  name?: string;
  price?: number;
  quantity?: number;
  addOns?: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
}

interface ShoppingCartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  getCartTotal: () => number;
}

// Default context value
const defaultContextValue: ShoppingCartContextType = {
  cartItems: [],
  addToCart: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
  getCartTotal: () => 0,
};

// Create context
const ShoppingCartContext = createContext<ShoppingCartContextType>(defaultContextValue);

// Custom hook to use shopping cart context
export const useShoppingCart = () => useContext(ShoppingCartContext);

// Provider component
export const ShoppingCartProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  // Initialize cart items from localStorage
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    // Check if cart exists in localStorage
    const savedCart = localStorage.getItem('tailtownCart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        console.log('ShoppingCartContext: Loaded cart from localStorage:', parsedCart);
        return parsedCart;
      } catch (error) {
        console.error('ShoppingCartContext: Error parsing cart from localStorage', error);
        return [];
      }
    }
    return [];
  });

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    console.log('ShoppingCartContext: Saving cart to localStorage:', cartItems);
    localStorage.setItem('tailtownCart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (item: CartItem) => {
    console.log('ShoppingCartContext: Adding item to cart:', item);
    setCartItems(prevItems => {
      const newItems = [...prevItems, item];
      return newItems;
    });
  };

  const removeFromCart = (id: string) => {
    console.log('ShoppingCartContext: Removing item from cart:', id);
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const clearCart = () => {
    console.log('ShoppingCartContext: Clearing cart');
    // Clear the React state
    setCartItems([]);
    
    // Ensure localStorage is also cleared
    localStorage.removeItem('tailtownCart');
    
    // Double-check that localStorage is cleared by logging
    console.log('ShoppingCartContext: Cart cleared, localStorage item removed');
    
    // Force a refresh of localStorage in case of any caching issues
    try {
      localStorage.setItem('tailtownCart', JSON.stringify([]));
      localStorage.removeItem('tailtownCart');
    } catch (error) {
      console.error('ShoppingCartContext: Error clearing localStorage:', error);
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const itemPrice = item.price || 0;
      const addOnsTotal = item.addOns?.reduce(
        (addOnTotal, addOn) => addOnTotal + (addOn.price * addOn.quantity), 
        0
      ) || 0;
      return total + itemPrice + addOnsTotal;
    }, 0);
  };

  return (
    <ShoppingCartContext.Provider 
      value={{ 
        cartItems, 
        addToCart, 
        removeFromCart, 
        clearCart,
        getCartTotal 
      }}
    >
      {children}
    </ShoppingCartContext.Provider>
  );
};

export default ShoppingCartContext;
