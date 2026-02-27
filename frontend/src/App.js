import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { NavbarProvider } from './contexts/NavbarContext';
import TopNavbar from './Components/TopNavbar';
import Footer from './Components/Footer';
import Home from './Pages/Home';
import AboutUs from './Pages/About';
import Login from './Pages/Login';
import ContactUs from './Pages/ContactUs';
import Consultancy from './Pages/Consulatncy';
import Gallery from './Pages/Gallery';
import Shop from './Pages/ShopPage';
import Update from './Pages/LatestUpdates'
import { useEffect } from 'react';
import { AuthProvider } from "./context/AuthContext";
import MyDetails from './Pages/MyDetails';

function LayoutWrapper({ children }) {
  const location = useLocation();
  const hideLayout = location.pathname === "/login";

  useEffect(() => {
    // Reset body overflow when NOT on login page
    if (!hideLayout) {
      document.body.style.overflow = 'auto';
    } else {
      document.body.style.overflow = 'hidden';
    }
  }, [hideLayout]);

  return (
    <>
      {!hideLayout && <TopNavbar />}
      {children}
      {!hideLayout && <Footer />}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <NavbarProvider>
        <Router>
          <LayoutWrapper>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/aboutus" element={<AboutUs />} />
              <Route path="/contact" element={<ContactUs />} />
              <Route path="/login" element={<Login />} />
              {/* <Route path="/consultancy" element={<Consultancy />} />  */}
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/update" element={<Update />} />
              <Route path="/my-details" element={<MyDetails />} />
            </Routes>
          </LayoutWrapper>
        </Router>
      </NavbarProvider>
    </AuthProvider>
  );
}

export default App;
