import React, { useState, useEffect, useRef } from "react";
import {
FaArrowLeft,
FaArrowRight,
FaShoppingCart,
FaUser,
FaCreditCard,
FaCheckCircle,
FaMoneyBillWave,
FaGooglePay,
FaLock,
FaSpinner,
} from "react-icons/fa";
import "./CheckoutFlow.css";
import TruckAnimation from "./TruckAnimation";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

const backendRootURL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const CheckoutFlow = ({
product,
quantity = 1,
onClose,
onOrderComplete,
cartItems = null,
}) => {
  const { token } = useAuth();
const [currentStep, setCurrentStep] = useState(1);
const [formData, setFormData] = useState({
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  zipCode: "",
  country: "India",
  paymentMethod: "online",
  specialInstructions: "",
});


const [paymentData, setPaymentData] = useState({
    razorpayOrderId: null,
    razorpayPaymentId: null,
    razorpaySignature: null,
    isPaymentCompleted: false,
});

const [errors, setErrors] = useState({});
const [isProcessing, setIsProcessing] = useState(false);
const [isLoadingPayment, setIsLoadingPayment] = useState(false);
const [razorpayKeyId, setRazorpayKeyId] = useState(null);
const autoPlacedRef = useRef(false);

const orderItems = cartItems || [{ ...product, quantity }];
const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
const shippingFee = subtotal > 500 ? 0 : 50;
const tax = 0; // GST already included in prices
const total = subtotal + shippingFee;

const steps = [
    { number: 1, title: "Review Order", icon: <FaShoppingCart /> },
    { number: 2, title: "Shipping Info", icon: <FaUser /> },
    { number: 3, title: "Payment", icon: <FaCreditCard /> },
    { number: 4, title: "Confirmation", icon: <FaCheckCircle /> },
];

const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Basic inline sanitation for phone
    if (name === "phone") {
      const digitsOnly = value.replace(/\D/g, "").slice(0, 10);
      setFormData((prev) => ({ ...prev, [name]: digitsOnly }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
};

// Load Razorpay script
useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
        document.body.removeChild(script);
    };
}, []);

// Create Razorpay order
const createRazorpayOrder = async () => {
    try {
        setIsLoadingPayment(true);
        const response = await axios.post(
            `${backendRootURL}/api/payments/create-order`,
            {
                amount: total,
                currency: 'INR',
                receipt: `receipt_${Date.now()}`,
            },
            {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            }
        );

        if (response.data.success) {
            setRazorpayKeyId(response.data.keyId);
            return { ...response.data.order, keyId: response.data.keyId };
        } else {
            throw new Error('Failed to create payment order');
        }
    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        alert('Failed to initialize payment. Please try again.');
        setIsLoadingPayment(false);
        return null;
    }
};

// Handle Razorpay payment
const handleRazorpayPayment = async () => {
    try {
        const order = await createRazorpayOrder();
        if (!order) return;

        const options = {
            key: razorpayKeyId || order.keyId,
            amount: order.amount,
            currency: order.currency,
            name: 'Krishivishwa Biotech',
            description: `Order Payment - ${order.receipt}`,
            order_id: order.id,
            handler: async function (response) {
                const newPaymentData = {
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                  isPaymentCompleted: true,
                };

                // Payment successful
                setPaymentData(newPaymentData);
                setIsLoadingPayment(false);

                // Verify payment on backend
                try {
                    const verifyResponse = await axios.post(
                        `${backendRootURL}/api/payments/verify`,
                        {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        }
                    );

                    if (verifyResponse.data.success) {
                        // Payment verified successfully: move to confirmation and auto-place
                        if (!autoPlacedRef.current) {
                          autoPlacedRef.current = true;
                          setCurrentStep(4);
                          // Let the UI render step 4 before placing
                          setTimeout(() => {
                            handlePlaceOrder(newPaymentData);
                          }, 150);
                        }
                    } else {
                        alert('Payment verification failed. Please contact support.');
                    }
                } catch (verifyError) {
                    console.error('Payment verification error:', verifyError);
                    alert('Payment completed but verification failed. Please contact support with payment ID.');
                }
            },
            prefill: {
                name: `${formData.firstName} ${formData.lastName}`,
                email: formData.email || '',
                contact: formData.phone || '',
            },
            theme: {
                color: '#4CAF50',
            },
            modal: {
                ondismiss: function () {
                    setIsLoadingPayment(false);
                },
            },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.on('payment.failed', function (response) {
            alert(`Payment failed: ${response.error.description}`);
            setIsLoadingPayment(false);
        });
        razorpay.open();
    } catch (error) {
        console.error('Error initiating Razorpay payment:', error);
        alert('Failed to initiate payment. Please try again.');
        setIsLoadingPayment(false);
    }
};

const validateStep = (step) => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[6-9]\d{9}$/;

    if (step === 2) {
        if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
        if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";

        // Email optional but must be valid if present
        if (formData.email.trim() && !emailRegex.test(formData.email.trim())) {
          newErrors.email = "Enter a valid email (example@domain.com)";
        }

        // Phone required and must match Indian mobile pattern
        if (!formData.phone.trim()) {
          newErrors.phone = "Phone number is required";
        } else if (!phoneRegex.test(formData.phone.trim())) {
          newErrors.phone = "Phone must be 10 digits and start with 6-9";
        }

        if (!formData.address.trim()) newErrors.address = "Address is required";
        if (!formData.state.trim()) newErrors.state = "State is required";
        if (!formData.city.trim()) newErrors.city = "City is required";
        if (!formData.zipCode.trim()) newErrors.zipCode = "PIN code is required";
    }
    if (step === 3 && formData.paymentMethod === "online") {
        // Check if Razorpay payment is completed
        if (!paymentData.isPaymentCompleted) {
            newErrors.payment = "Please complete the payment to continue";
        }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
};

const nextStep = () => {
    if (validateStep(currentStep)) {
        setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
};

const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
};

const handlePlaceOrder = async (paymentOverride = null) => {
    setIsProcessing(true);

    try {
        const ANIMATION_MS = 10000; // must match TruckAnimation.js timer / CSS keyframes
        const startedAt = Date.now();
        const effectivePaymentData = paymentOverride || paymentData;

        const orderData = {
            items: orderItems,
            customerInfo: {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
                city: formData.city,
                state: formData.state,
                zipCode: formData.zipCode,
                country: formData.country,
            },
            pricing: {
                subtotal,
                shippingFee,
                tax: 0,
                total: total + (formData.paymentMethod === "cod" ? 20 : 0),
            },
            orderId: `ORD-${Date.now()}`,
            orderDate: new Date().toISOString(),
            paymentMethod: formData.paymentMethod,
            status: "pending",
            specialInstructions: formData.specialInstructions || "",
            paymentData:
                formData.paymentMethod === "online" && effectivePaymentData?.isPaymentCompleted
                    ? {
                        razorpayOrderId: effectivePaymentData.razorpayOrderId,
                        razorpayPaymentId: effectivePaymentData.razorpayPaymentId,
                        razorpaySignature: effectivePaymentData.razorpaySignature,
                        paymentMethod: "razorpay",
                    }
                    : null,
        };

        const response = await fetch(`${backendRootURL}/api/orders`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(token && { Authorization: `Bearer ${token}` }),
            },
            body: JSON.stringify(orderData),
        });

        const result = await response.json();

        if (response.ok) {
            // Wait for the truck animation to finish BEFORE notifying parent / closing modal
            const elapsed = Date.now() - startedAt;
            const remaining = Math.max(0, ANIMATION_MS - elapsed);
            await new Promise((resolve) => setTimeout(resolve, remaining));

            if (onOrderComplete) onOrderComplete(result.order || {});
            onClose();
        } else {
            alert(result.message || "Could not place order. Please try again.");
        }
    } catch (error) {
        alert("Network error when placing order: " + error.message);
    } finally {
        setIsProcessing(false);
    }
};

const allowContinue =
    currentStep !== 3 ||
    formData.paymentMethod !== "online" ||
    paymentData.isPaymentCompleted;

const renderStepContent = () => {
    switch (currentStep) {
        case 1:
            return (
                <div className="checkout-step">
                    <h3>Review Your Order</h3>
                    <div className="order-items">
                        {orderItems.map((item, index) => (
                            <div key={index} className="order-item">
                                <img
                                    src={
                                        item.image ? `${backendRootURL}${item.image}` : "/placeholder.svg"
                                    }
                                    alt={item.name || item.title}
                                    className="order-item-image"
                                />
                                <div className="order-item-details">
                                    <h4>{item.name || item.title}</h4>
                                    <p className="order-item-category">{item.category}</p>
                                    <div className="order-item-pricing">
                                        <span className="quantity">Qty: {item.quantity}</span>
                                        <span className="price">₹{item.price.toLocaleString()}</span>
                                        <span className="total">₹{(item.price * item.quantity).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="order-summary">
                        <div className="summary-row">
                            <span>Subtotal</span>
                            <span>₹{subtotal.toLocaleString()}</span>
                        </div>
                        <div className="summary-row">
                            <span>Shipping</span>
                            <span>{shippingFee === 0 ? "FREE" : `₹${shippingFee}`}</span>
                        </div>
                        <div className="summary-row total-row">
                            <span>Total</span>
                            <span>₹{total.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            );
        case 2:
            return (
                <div className="checkout-step">
                    <h3>Shipping Information</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleInputChange}
                                className={errors.firstName ? "error" : ""}
                                placeholder="First Name *"
                            />
                            {errors.firstName && <span className="error-text">{errors.firstName}</span>}
                        </div>
                        <div className="form-group">
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleInputChange}
                                className={errors.lastName ? "error" : ""}
                                placeholder="Last Name *"
                            />
                            {errors.lastName && <span className="error-text">{errors.lastName}</span>}
                        </div>
                        <div className="form-group full-width">
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className={errors.email ? "error" : ""}
                                placeholder="Email Address (optional)"
                            />
                            {errors.email && <span className="error-text">{errors.email}</span>}
                        </div>
                        <div className="form-group full-width">
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                className={errors.phone ? "error" : ""}
                                placeholder="Phone Number *"
                            />
                            {errors.phone && <span className="error-text">{errors.phone}</span>}
                        </div>
                        <div className="form-group full-width">
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                className={errors.address ? "error" : ""}
                                placeholder="Street Address *"
                            />
                            {errors.address && <span className="error-text">{errors.address}</span>}
                        </div>
                        <div className="form-group">
                            <select
                                name="country"
                                value={formData.country}
                                onChange={handleInputChange}
                            >
                                <option value="India">India</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <input
                                type="text"
                                name="state"
                                value={formData.state}
                                onChange={handleInputChange}
                                className={errors.state ? "error" : ""}
                                placeholder="State (e.g. Maharashtra) *"
                            />
                            {errors.state && <span className="error-text">{errors.state}</span>}
                        </div>
                        <div className="form-group">
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleInputChange}
                                className={errors.city ? "error" : ""}
                                placeholder="City (e.g. Pune) *"
                            />
                            {errors.city && <span className="error-text">{errors.city}</span>}
                        </div>
                        <div className="form-group">
                            <input
                                type="text"
                                name="zipCode"
                                value={formData.zipCode}
                                onChange={handleInputChange}
                                className={errors.zipCode ? "error" : ""}
                                placeholder="PIN Code *"
                            />
                            {errors.zipCode && <span className="error-text">{errors.zipCode}</span>}
                        </div>
                        <div className="form-group full-width">
                            <textarea
                                name="specialInstructions"
                                value={formData.specialInstructions}
                                onChange={handleInputChange}
                                rows="3"
                                placeholder="Any special delivery instructions(optional)..."
                            ></textarea>
                        </div>
                    </div>
                </div>
            );
        case 3:
            return (
                <div className="checkout-step">
                    <h3>Payment Method</h3>
                    <div className="payment-methods">
                        {/* <label
                            className={`payment-method ${formData.paymentMethod === "online" ? "selected" : ""
                                }`}
                        >
                            <input
                                type="radio"
                                name="paymentMethod"
                                value="online"
                                checked={formData.paymentMethod === "online"}
                                onChange={handleInputChange}
                            />
                            <div className="payment-method-content">
                                <div className="payment-method-header">
                                    <FaGooglePay className="payment-icon" />
                                    <div>
                                        <h4>Online Payment</h4>
                                        <p>UPI, Bank Transfer, Card, Net Banking, Wallets</p>
                                    </div>
                                </div>
                                <div className="payment-badges">
                                    <span className="badge secure">
                                        <FaLock /> Secure
                                    </span>
                                    <span className="badge instant">Instant</span>
                                </div>
                            </div>
                        </label> */}
                        <label
                            className={`payment-method ${formData.paymentMethod === "cod" ? "selected" : ""
                                }`}
                        >
                            <input
                                type="radio"
                                name="paymentMethod"
                                value="cod"
                                checked={formData.paymentMethod === "cod"}
                                onChange={handleInputChange}
                            />
                            <div className="payment-method-content">
                                <div className="payment-method-header">
                                    <FaMoneyBillWave className="payment-icon" />
                                    <div>
                                        <h4>Cash on Delivery</h4>
                                        <p>Pay when you receive the product</p>
                                    </div>
                                </div>
                                <div className="payment-badges">
                                    <span className="badge cod">₹20 handling fee</span>
                                </div>
                            </div>
                        </label>
                    </div>
                    {/* {formData.paymentMethod === "online" && (
                        <div className="online-payment-details">
                            <div className="payment-instructions">
                                <h4>
                                    <FaCreditCard /> Complete Your Payment
                                </h4>
                                <p>
                                    Click the button below to proceed with secure Razorpay payment. You can pay using UPI, Credit/Debit Card, Net Banking, or Wallets.
                                </p>
                                <div className="razorpay-payment-section">
                                    <div className="payment-amount-display">
                                        <h5>Total Amount to Pay</h5>
                                        <div className="amount-value">₹{total.toLocaleString()}</div>
                                    </div>
                                    {!paymentData.isPaymentCompleted ? (
                                        <button
                                            className="razorpay-pay-button"
                                            onClick={handleRazorpayPayment}
                                            disabled={isLoadingPayment}
                                        >
                                            {isLoadingPayment ? (
                                                <>
                                                    <FaSpinner className="spinner" /> Processing...
                                                </>
                                            ) : (
                                                <>
                                                    <FaCreditCard /> Pay ₹{total.toLocaleString()}
                                                </>
                                            )}
                                        </button>
                                    ) : (
                                        <div className="payment-success-message">
                                            <FaCheckCircle className="success-icon" />
                                            <div>
                                                <h5>Payment Completed Successfully!</h5>
                                                <p>Payment ID: {paymentData.razorpayPaymentId}</p>
                                                <p>You can now proceed to place your order.</p>
                                            </div>
                                        </div>
                                    )}
                                    {errors.payment && (
                                        <div className="error-text">{errors.payment}</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="payment-security">
                        <div className="security-features">
                            <div className="security-item">
                                <FaLock /> 256-bit SSL Encryption
                            </div>
                            <div className="security-item">
                                <FaCheckCircle /> PCI DSS Compliant
                            </div>
                        </div>
                    </div> */}
                </div>
            );
        case 4:
            return (
                <div className="checkout-step">
                    <h3>Order Confirmation</h3>
                    <div className="confirmation-content">
                        <div className="confirmation-header">
                            <FaCheckCircle className="success-icon" />
                            <h4>Review Your Order Details</h4>
                            <p>Please verify all information before placing your order</p>
                        </div>
                        <div className="confirmation-sections">
                            <div className="confirmation-section">
                                <h5>Shipping Address</h5>
                                <div className="address-display">
                                    <p>
                                        <strong>
                                            {formData.firstName} {formData.lastName}
                                        </strong>
                                    </p>
                                    <p>{formData.address}</p>
                                    <p>
                                        {formData.city}, {formData.state} {formData.zipCode}
                                    </p>
                                    <p>{formData.country}</p>
                                    <p>Phone: {formData.phone}</p>
                                    <p>Email: {formData.email}</p>
                                </div>
                            </div>
                            <div className="confirmation-section">
                                <h5>Payment Method</h5>
                                <div className="payment-display">
                                    {formData.paymentMethod === "online" ? (
                                        <div className="payment-info">
                                            <div>
                                                <FaCreditCard /> Razorpay Payment
                                            </div>
                                            {paymentData.isPaymentCompleted && (
                                                <>
                                                    <div className="transaction-info">
                                                        Payment ID: {paymentData.razorpayPaymentId}
                                                    </div>
                                                    <div className="transaction-info">
                                                        Order ID: {paymentData.razorpayOrderId}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="payment-info">
                                            <FaMoneyBillWave /> Cash on Delivery
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="confirmation-section">
                                <h5>Order Summary</h5>
                                <div className="final-summary">
                                    <div className="summary-row">
                                        <span>Subtotal</span>
                                        <span>₹{subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="summary-row">
                                        <span>Shipping</span>
                                        <span>{shippingFee === 0 ? "FREE" : `₹${shippingFee}`}</span>
                                    </div>
                                    {formData.paymentMethod === "cod" && (
                                        <div className="summary-row">
                                            <span>COD Handling</span>
                                            <span>₹20</span>
                                        </div>
                                    )}
                                    <div className="summary-row total-row">
                                        <span>Total Amount</span>
                                        <span>₹{(total + (formData.paymentMethod === "cod" ? 20 : 0)).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        default:
            return null;
    }
};

return (
    <div className="checkout-flow-component">
        <div className="checkout-flow-overlay">
            <div className="checkout-flow-container">
                <div className="checkout-header">
                    <button className="close-btn" onClick={onClose}>
                        ×
                    </button>
                    <h2>Secure Checkout</h2>
                    <div className="checkout-steps">
                        {steps.map((step) => (
                            <div
                                key={step.number}
                                className={`step ${currentStep >= step.number ? "active" : ""} ${currentStep === step.number ? "current" : ""
                                    }`}
                            >
                                <div className="step-icon">
                                    {currentStep > step.number ? <FaCheckCircle /> : step.icon}
                                </div>
                                <span className="step-title">{step.title}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="checkout-content">{renderStepContent()}</div>
                <div className="checkout-footer">
                    <div className="checkout-actions">
                        {currentStep > 1 && (
                            <button className="btn-secondary" onClick={prevStep}>
                                <FaArrowLeft /> Back
                            </button>
                        )}
                        {currentStep < 4 ? (
                            <button
                                className="btn-primary"
                                onClick={nextStep}
                                disabled={!allowContinue}
                            >
                                Continue <FaArrowRight />
                            </button>
                        ) : (
                            <TruckAnimation
                                onClick={handlePlaceOrder}
                                disabled={isProcessing}
                                isProcessing={isProcessing}
                            />
                        )}
                    </div>
                    <div className="checkout-security">
                        <FaLock />
                        <span>Your information is secure and encrypted</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
);
};

export default CheckoutFlow;