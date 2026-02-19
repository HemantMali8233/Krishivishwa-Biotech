import React, { createContext, useContext, useState } from 'react';

const NavbarContext = createContext();

export const useNavbar = () => {
  const context = useContext(NavbarContext);
  if (!context) {
    throw new Error('useNavbar must be used within a NavbarProvider');
  }
  return context;
};

export const NavbarProvider = ({ children }) => {
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const [cartItems, setCartItems] = useState([]);
  const [showCartInNavbar, setShowCartInNavbar] = useState(false);
  const [cartClickHandler, setCartClickHandler] = useState(null);

  const showNavbar = () => setIsNavbarVisible(true);
  const hideNavbar = () => setIsNavbarVisible(false);

  const updateNavbarCart = (items) => setCartItems(items);
  const enableNavbarCart = () => setShowCartInNavbar(true);
  const disableNavbarCart = () => setShowCartInNavbar(false);

  const setNavbarCartHandler = (handler) => setCartClickHandler(() => handler);
  const clearNavbarCartHandler = () => setCartClickHandler(null);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <NavbarContext.Provider value={{ 
      isNavbarVisible, 
      showNavbar, 
      hideNavbar,
      cartItems,
      cartCount,
      showCartInNavbar,
      updateNavbarCart,
      enableNavbarCart,
      disableNavbarCart,
      cartClickHandler,
      setNavbarCartHandler,
      clearNavbarCartHandler
    }}>
      {children}
    </NavbarContext.Provider>
  );
};
