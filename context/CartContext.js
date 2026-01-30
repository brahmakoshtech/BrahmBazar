'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import api from '@/services/api';

const CartContext = createContext();

export function CartProvider({ children }) {
    const [cartCount, setCartCount] = useState(0);
    const [wishlistCount, setWishlistCount] = useState(0);
    const [cartItems, setCartItems] = useState([]);

    const fetchCounts = async () => {
        try {
            const userInfo = localStorage.getItem('userInfo');

            if (!userInfo) {
                // Guest mode
                let guestCart = [];
                try {
                    guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
                } catch (e) {
                    console.error('Error parsing guest cart', e);
                    guestCart = [];
                }

                // Safety check: Filter out corrupted items where product is missing
                const validCart = guestCart.filter(item => item && item.product && item.product._id);

                // If we found corrupted items, clean up local storage
                if (validCart.length !== guestCart.length) {
                    localStorage.setItem('guestCart', JSON.stringify(validCart));
                    guestCart = validCart;
                }

                setCartItems(guestCart);
                setCartCount(guestCart.reduce((acc, item) => acc + (item.quantity || 1), 0)); // Safety default quantity
                setWishlistCount(0);
                return;
            }

            // User mode
            const { data: cartData } = await api.get('/api/cart');
            const { data: wishlistData } = await api.get('/api/users/wishlist');

            const items = Array.isArray(cartData) ? cartData : (cartData.items || []);
            setCartItems(items);
            const count = items.reduce((acc, item) => acc + item.quantity, 0);
            setCartCount(count);
            setWishlistCount(wishlistData.length || 0);
        } catch (error) {
            console.error('Failed to update counts:', error);
        }
    };

    useEffect(() => {
        fetchCounts();
    }, []);

    const refreshCounts = () => {
        fetchCounts();
    };

    const addToCart = async (product, quantity = 1) => {
        const userInfo = localStorage.getItem('userInfo');

        if (!userInfo) {
            // Guest Logic
            let guestCart = [];
            try {
                guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
            } catch (e) {
                guestCart = [];
            }

            // Clean before adding
            guestCart = guestCart.filter(item => item && item.product && item.product._id);

            const existingItemIndex = guestCart.findIndex(item => item.product._id === product._id);

            if (existingItemIndex > -1) {
                guestCart[existingItemIndex].quantity += quantity;
            } else {
                guestCart.push({ product: product, quantity: quantity });
            }

            localStorage.setItem('guestCart', JSON.stringify(guestCart));
            fetchCounts();
            return { message: 'Added to cart (Guest)' };
        } else {
            // Logged-in User Logic
            await api.post('/api/cart', { productId: product._id, quantity });
            fetchCounts();
            return { message: 'Added to cart' };
        }
    };

    return (
        <CartContext.Provider value={{ cartCount, wishlistCount, refreshCounts, addToCart, cartItems }}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => useContext(CartContext);
