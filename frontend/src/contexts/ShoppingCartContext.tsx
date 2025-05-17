import React, { createContext, useContext, useState } from 'react';

// Define basic CartItem interface
export interface CartItem {
  id: string;
  price: number;
  quantity?: number;
}

// Define cart state
interface CartState {
  items: CartItem[];
}

// Define context type with minimal required functions
interface ShoppingCartContextType {
  state: CartState;
  clearCart: () => void;
}

// Create a default context value
const defaultContextValue: ShoppingCartContextType = {
  state: { items: [] },
  clearCart: () => {}
};

// Create context
const ShoppingCartContext = createContext<ShoppingCartContextType>(defaultContextValue);

// Provider component
export function ShoppingCartProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CartState>({ items: [] });

  const clearCart = () => {
    setState({ items: [] });
  };

  return (
    <ShoppingCartContext.Provider
      value={{
        state,
        clearCart
      }}
    >
      {children}
    </ShoppingCartContext.Provider>
  );
}

// Custom hook to use the shopping cart context
export function useShoppingCart() {
  return useContext(ShoppingCartContext);
}
