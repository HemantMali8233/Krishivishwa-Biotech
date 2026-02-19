// ✅ UPDATED Footer.js
import React, { useEffect } from 'react';
import '../Components/Footer.css';
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import Logo from '../Assets/Images/Krushiwishwa .png';
import {
    FaInstagram, FaYoutube, FaFacebookF, FaWhatsapp,
    FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaHome,
    FaInfoCircle, FaShoppingCart, FaUserTie, FaImage,
    FaBookOpen, FaChartLine, FaPhone, FaLeaf
} from 'react-icons/fa';


const Footer = () => {
    const location = useLocation();

    useEffect(() => {
        const hash = location.hash;
        if (hash) {
            const section = document.querySelector(hash);
            if (section) {
                setTimeout(() => {
                    section.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
        }
    }, [location]);
    return (
        <div className="footer-section">
            <div className="footer-container">

                {/* Left Column */}
                <div className="footer-column">
                    <div className="logo-area">
                        <FaLeaf className="logo-icon" />
                        <div>
                            <img src={Logo} className='footer-Logo' alt='Krushivishwa Logo' />
                            <p className="tagline-footer">"Happy Farmer, Wealthy Farmer"</p>
                        </div>
                    </div>
                </div>

                <div className="footer-column">
                    <h3>Contact Us</h3>
                    <ul>
                        <li><a href="tel:9960492426" className="contact-link"><FaPhoneAlt className="icon" /> 9960492426</a></li>
                        <li><a href="tel:02424–261100" className="contact-link"><FaPhoneAlt className="icon" /> 02424–261100</a></li>
                        <li className="email-row">
                            <a href="mailto:krishivishwabiotech@gmail.com" className="email-link address-link">
                                <FaEnvelope className="icon" />
                                <span className="email-text">krishivishwabiotech@gmail.com</span>
                            </a>
                        </li>
                        <li className="address-row">
                            <a
                                href="https://maps.app.goo.gl/QCKxTHDgd4x39RXw9"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="address-link"
                            >
                                <FaMapMarkerAlt className="icon" />
                                <span>
                                    Gat No. 227, At. Virgaon, Tal. Akole, Dist. Ahmednagar (MH), 422605
                                </span>
                            </a>
                        </li>

                    </ul>
                </div>
                
                {/* Middle Column - Quick Links */}
                <div className="footer-column quick">
                    <h3>Quick Links</h3>
                    <div className="footer-links-row">
                        <div className="footer-links-column">
                            <h4>Navigation</h4>
                            <ul>
                                <li><Link to="/" className="footer-list-link"><FaHome className="icon" /> Home</Link></li>
                                <li><Link to="/aboutus" className="footer-list-link"><FaInfoCircle className="icon" /> About Us</Link></li>
                                <li><Link to="/shop" className="footer-list-link"><FaShoppingCart className="icon" /> Shop</Link></li>
                                <li><Link to="/consultancy" className="footer-list-link"><FaUserTie className="icon" /> Consultancy</Link></li>
                            </ul>
                        </div>
                        <div className="footer-links-column Explore">
                            <h4>Explore</h4>
                            <ul>
                                <li><Link to="/gallery" className="footer-list-link"><FaImage className="icon" /> Gallery</Link></li>
                                <li><Link to="/#our-story" className="footer-list-link"><FaBookOpen className="icon" /> Our Story</Link></li>
                                <li><Link to="/#facts" className="footer-list-link"><FaChartLine className="icon" /> Facts</Link></li>
                                <li><Link to="/contact" className="footer-list-link"><FaPhone className="icon" /> Contact Us</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Column - Products */}
                <div className="footer-column products">
                    <h3 className='Product-title'>Our Products</h3>
                    <ul>
                        <li className="product-item">Bio Fertilizers</li>
                        <li className="product-item">Bio Fungicides</li>
                        <li className="product-item">Bio Insecticides</li>
                        <li className="product-item">Bio Nematicides</li>
                    </ul>
                </div>
                <hr className="full-width-divider" />

                {/* Column - Social & Join */}
                <div className="footer-column social">

                    <h4>Follow Us On</h4>
                    <div className="social-icons-wrapper">
                        <a href="https://www.instagram.com/krishivishwa_biotech?igsh=ampldzVyZ290aWl2&utm_source=qr" className="social-hover instagram"><FaInstagram className="icons" /><span>Instagram</span></a>
                        <a href="https://youtube.com/@krishivishwabiotech3690?feature=shared " className="social-hover youtube"><FaYoutube className="icons" /><span>YouTube</span></a>
                        <a href="https://www.facebook.com/share/15d6nFohvz/?mibextid=wwXIfr" className="social-hover facebook"><FaFacebookF className="icons" /><span>Facebook</span></a>
                        <a
                            href="https://wa.me/919960492426"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="social-hover whatsapp"
                        >
                            <FaWhatsapp className="icons" /><span>WhatsApp</span>
                        </a>

                    </div>
                </div>
            </div>

            {/* Footer Bottom */}
            <div className="footer-bottom">
                <p>© 2025 Krishivishwa Biotech. All rights reserved.</p>
                <div className="footer-links">
                    <a href="#">Privacy Policy</a>
                    <a href="#">Terms of Service</a>
                    <a href="#">Sitemap</a>
                </div>
            </div>
        </div>
    );
};

export default Footer;
