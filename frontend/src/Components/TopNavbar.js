import React, { useState, useEffect, useRef } from "react";
import { NavLink, useLocation, Link, useNavigate } from "react-router-dom";
import { Navbar, Nav, Container, Dropdown } from "react-bootstrap";
import { useNavbar } from "../contexts/NavbarContext";
import Logo from "../Assets/Images/Krushiwishwa .png";
import "../Components/Navbar.css";

import { FiUserPlus } from "react-icons/fi";
import { FaUserCircle, FaUser, FaShoppingCart, FaBullhorn } from "react-icons/fa";
import {
  BsHouseDoor,
  BsInfoCircle,
  BsCart,
  BsPeople,
  BsTelephone,
  BsImages,
} from "react-icons/bs";

function TopNavbar() {
  const [expanded, setExpanded] = useState(false);
  const [clickedItem, setClickedItem] = useState(null);
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { isNavbarVisible, cartCount, showCartInNavbar, cartClickHandler } = useNavbar();
  const isHome = location.pathname === "/";
  const isShop = location.pathname === "/shop";
  const navbarRef = useRef();

  // ✅ All hooks first
  useEffect(() => {
    const handleScroll = () => {
      const nav = document.querySelector(".custom-navbar");
      if (nav) {
        if (window.scrollY > 50) nav.classList.add("navbar-scrolled");
        else nav.classList.remove("navbar-scrolled");
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navbarRef.current && !navbarRef.current.contains(event.target)) setExpanded(false);
    };
    if (expanded) document.addEventListener("mousedown", handleClickOutside);
    else document.removeEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [expanded]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
    else setUser(null);
  }, [location]);

  // ✅ Conditional rendering AFTER all hooks
  if (!isNavbarVisible || location.pathname === "/my-details") return null;

  const handleCartClick = () => {
    setExpanded(false);
    if (cartClickHandler) cartClickHandler();
  };

  return (
    <Navbar
      expanded={expanded}
      onToggle={setExpanded}
      expand="lg"
      fixed="top"
      className="custom-navbar"
      ref={navbarRef}
    >
      <Container fluid>
        <Navbar.Brand href="/">
          <img src={Logo} className="Logo" alt="Logo" />
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto" onClick={() => setExpanded(false)}>
            {[
              { path: "/", label: "Home", icon: <BsHouseDoor /> },
              { path: "/aboutus", label: "About Us", icon: <BsInfoCircle /> },
              { path: "/shop", label: "Shop", icon: <BsCart /> },
              // { path: "/consultancy", label: "Consultancy", icon: <BsPeople /> },
              { path: "/contact", label: "Contact Us", icon: <BsTelephone /> },
              { path: "/gallery", label: "Gallery", icon: <BsImages /> },
              { path: "/update", label: "Updates", icon: <FaBullhorn /> },
            ].map(({ path, label, icon }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) => (isActive ? "Menu active" : "Menu")}
              >
                <span className="hover-icon">{icon}</span>
                <span className="text-label">{label}</span>
              </NavLink>
            ))}
          </Nav>

          <div className="navbar-right-section">
            {/* Cart Button - Only show on shop page */}
            {isShop && showCartInNavbar && (
              <div className="navbar-cart-container">
                <button
                  className="navbar-cart-btn"
                  onClick={handleCartClick}
                  title="View Cart"
                >
                  <FaShoppingCart className="cart-icon" />
                  <span className="cart-text">Cart</span>
                  {cartCount > 0 && (
                    <span className="cart-badge">{cartCount}</span>
                  )}
                </button>
              </div>
            )}

            {/* User Dropdown - Only show on home page */}
            {isHome && (
              <Dropdown className="navbar-dropdown">
                <Dropdown.Toggle
                  variant="success"
                  id="dropdown-basic"
                  className="d-flex align-items-center gap-2"
                >
                  <FaUser />
                  {user ? user.name : "Account"}
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  {!user && (
                    <>
                      <Dropdown.Item
                        onClick={() => {
                          setClickedItem("signup");
                          setExpanded(false);
                          navigate("/login", { state: { showSignup: true } });
                          setTimeout(() => setClickedItem(null), 1500);
                        }}
                        className={clickedItem === "signup" ? "active-dropdown" : ""}
                      >
                        <FiUserPlus style={{ marginRight: "8px" }} />
                        Sign up
                      </Dropdown.Item>

                      <Dropdown.Item
                        as={Link}
                        to="/login"
                        className={clickedItem === "login" ? "active-dropdown" : ""}
                        onClick={() => {
                          setClickedItem("login");
                          setExpanded(false);
                          setTimeout(() => setClickedItem(null), 1500);
                        }}
                      >
                        <FaUserCircle style={{ marginRight: "8px" }} />
                        Login
                      </Dropdown.Item>
                    </>
                  )}

                  {user && (
                    <>
                      <Dropdown.Item
                        onClick={() => {
                          setExpanded(false);
                          navigate("/my-details"); // ✅ Navigate to user dashboard
                        }}
                      >
                        <FaUser style={{ marginRight: "8px" }} />
                        My Details
                      </Dropdown.Item>

                      <Dropdown.Item
                        onClick={() => {
                          localStorage.removeItem("token");
                          localStorage.removeItem("user");
                          setUser(null);
                          navigate("/"); // ✅ Redirect to home after logout
                        }}
                      >
                        <FaUserCircle style={{ marginRight: "8px" }} />
                        Logout
                      </Dropdown.Item>
                    </>
                  )}
                </Dropdown.Menu>

              </Dropdown>
            )}
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default TopNavbar;
