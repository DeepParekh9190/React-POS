import { createContext, useContext, useReducer, useCallback } from "react";

const CartContext = createContext(null);

const cartReducer = (state, action) => {
  switch (action.type) {
    case "ADD_ITEM": {
      const existing = state.items.find((item) => item.id === action.product.id);
      if (existing) {
        return {
          ...state,
          items: state.items.map((item) =>
            item.id === action.product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }
      return {
        ...state,
        items: [...state.items, { ...action.product, quantity: 1, discount: 0 }],
      };
    }
    case "INCREASE": {
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.id ? { ...item, quantity: item.quantity + 1 } : item
        ),
      };
    }
    case "DECREASE": {
      const existing = state.items.find((item) => item.id === action.id);
      if (existing && existing.quantity <= 1) {
        return {
          ...state,
          items: state.items.filter((item) => item.id !== action.id),
        };
      }
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.id ? { ...item, quantity: item.quantity - 1 } : item
        ),
      };
    }
    case "REMOVE": {
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.id),
      };
    }
    case "SET_DISCOUNT": {
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.id ? { ...item, discount: Math.max(0, action.discount || 0) } : item
        ),
      };
    }
    case "CLEAR": {
      return { ...state, items: [] };
    }
    default:
      return state;
  }
};

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  const addItem = useCallback((product) => {
    dispatch({ type: "ADD_ITEM", product });
  }, []);

  const increase = useCallback((id) => {
    dispatch({ type: "INCREASE", id });
  }, []);

  const decrease = useCallback((id) => {
    dispatch({ type: "DECREASE", id });
  }, []);

  const removeItem = useCallback((id) => {
    dispatch({ type: "REMOVE", id });
  }, []);

  const setDiscount = useCallback((id, discount) => {
    dispatch({ type: "SET_DISCOUNT", id, discount });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: "CLEAR" });
  }, []);

  const subtotal = state.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const totalDiscount = state.items.reduce(
    (sum, item) => sum + (item.discount || 0) * item.quantity,
    0
  );
  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        addItem,
        increase,
        decrease,
        removeItem,
        setDiscount,
        clearCart,
        subtotal,
        totalDiscount,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
