'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const ShopViewContext = createContext();

export function ShopViewProvider({ children }) {
    const [view, setView] = useState('shop');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedView = localStorage.getItem('shopView');
            if (storedView) {
                setView(storedView);
            }
        }
    }, []);

    const updateView = (newView) => {
        setView(newView);
        if (typeof window !== 'undefined') {
            localStorage.setItem('shopView', newView);
        }
    };

    return (
        <ShopViewContext.Provider value={{ view, setView: updateView }}>
            {children}
        </ShopViewContext.Provider>
    );
}

export function useShopView() {
    return useContext(ShopViewContext);
}
