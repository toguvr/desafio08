import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const cartList = await AsyncStorage.getItem('@MyCart');

      if (cartList) {
        setProducts(JSON.parse(cartList));
      }
    }

    loadProducts();
  }, []);

  const increment = useCallback(
    async id => {
      const newProducts = [...products];

      const indexProduct = newProducts.findIndex(
        newProduct => newProduct.id === id,
      );

      newProducts[indexProduct].quantity += 1;

      setProducts(newProducts);
      await AsyncStorage.setItem('@MyCart', JSON.stringify(newProducts));
    },
    [products],
  );

  const addToCart = useCallback(
    async product => {
      const newProducts = [...products];

      const existProduct = newProducts.findIndex(newProduct => {
        return newProduct.id === product.id;
      });

      if (existProduct === -1) {
        const currentProduct = { ...product, quantity: 1 };

        newProducts.push(currentProduct);

        setProducts(newProducts);
        await AsyncStorage.setItem('@MyCart', JSON.stringify(newProducts));
      } else {
        increment(product.id);
      }
    },
    [products, increment],
  );

  const decrement = useCallback(
    async id => {
      const newProducts = [...products];
      const indexProduct = newProducts.findIndex(
        newProduct => newProduct.id === id,
      );

      if (newProducts[indexProduct].quantity >= 1) {
        newProducts[indexProduct].quantity -= 1;
      } else {
        newProducts.splice(indexProduct, 1);
      }
      setProducts(newProducts);
      await AsyncStorage.setItem('@MyCart', JSON.stringify(newProducts));
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
