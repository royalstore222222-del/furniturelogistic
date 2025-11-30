"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import toast from "react-hot-toast";
import {
  User,
  Package,
  History,
  Settings,
  Star,
  Upload,
  X,
  ShoppingBag,
  Calendar,
  DollarSign,
  MapPin,
  Truck,
  CheckCircle,
  Clock,
} from "lucide-react";

export default function AccountPage() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const [orderHistory, setOrderHistory] = useState([]);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [showPassword, setShowPassword] = useState(false);


  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "orders", label: "Current Orders", icon: Package },
    { id: "history", label: "Order History", icon: History },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [userRes, ordersRes] = await Promise.all([
          fetch("/api/user", { credentials: "include" }),
          fetch("/api/order", { credentials: "include" }),
        ]);

        const userJson = await userRes.json();
        const ordersJson = await ordersRes.json();

        if (userJson.success) setUser(userJson.data);
        if (ordersJson.success) {
          setOrders(ordersJson.ordersWithoutReview || []);
          setOrderHistory(ordersJson.ordersWithReview || []);
        }
      } catch (error) {
        console.error("Error fetching account data:", error);
        toast.error("Failed to load account data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);

    try {
      const res = await fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: user.name,
          email: user.email,
          password: user.password || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Profile updated successfully!");
        setUser(data.data);
        // Clear password field
        setUser((prev) => ({ ...prev, password: "" }));
      } else {
        toast.error(data.error || "Failed to update profile");
      }
    } catch (err) {
      console.error("Update failed", err);
      toast.error("Failed to update profile");
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleReview = async (productId, orderId, rating, comment, images) => {
    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          product: productId,
          order: orderId,
          rating,
          comment,
          images,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Review added successfully!");
        // Refresh orders to move reviewed item to history
        const ordersRes = await fetch("/api/order", { credentials: "include" });
        const ordersJson = await ordersRes.json();
        if (ordersJson.success) {
          setOrders(ordersJson.ordersWithoutReview || []);
          setOrderHistory(ordersJson.ordersWithReview || []);
        }
      } else {
        toast.error(data.error || "Failed to add review");
      }
    } catch (err) {
      console.error("Review failed", err);
      toast.error("Failed to add review");
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-[#de5422] mb-1">
            <span className="text-gray-900">Welcome back,</span>{" "}
            {user?.name || "User"}!
          </h1>
          <p className="text-black text-lg">Manage your account and orders</p>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-3 justify-center mb-5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-semibold transition-all duration-300 ${activeTab === tab.id
                  ? "bg-orange-500 text-white shadow-lg transform -translate-y-1"
                  : "bg-white text-gray-900 border-1 border-gray-900 hover:bg-amber-50 hover:shadow-md"
                  }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Sections */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-0">
          <AnimatePresence mode="wait">
            {/* Profile Section */}
            {activeTab === "profile" && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-orange-600 to-amber-400 px-6 sm:px-8 py-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      <Settings className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        Profile Settings
                      </h2>
                      <p className="text-orange-100 text-sm mt-1">
                        Manage your account information
                      </p>
                    </div>
                  </div>
                </div>

                {/* Form */}
                <div className="p-6 sm:p-8">
                  <form onSubmit={handleProfileUpdate} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Full Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={user?.name || ""}
                          onChange={(e) =>
                            setUser({ ...user, name: e.target.value })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#de5422] focus:border-[#de5422] outline-none transition-all duration-200 bg-white"
                          placeholder="Enter your full name"
                          required
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={user?.email || ""}
                          onChange={(e) =>
                            setUser({ ...user, email: e.target.value })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#de5422] focus:border-[#de5422] outline-none transition-all duration-200 bg-white"
                          placeholder="Enter your email"
                          required
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={user?.password || ""}
                          onChange={(e) =>
                            setUser({ ...user, password: e.target.value })
                          }
                          pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"
                          title="Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character"
                          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#de5422] focus:border-[#de5422] outline-none transition-all duration-200 bg-white"
                          placeholder="Enter new password (optional)"
                        />

                        {/* Eye Button */}
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900"
                        >
                          {showPassword ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A9.999 9.999 0 0 1 12 19c-5 0-9.27-3.11-11-8 1.02-2.94 3.14-5.36 5.875-6.825M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm-9.75 0C6.7 7.4 9.9 5 12 5c2.1 0 5.3 2.4 6.75 7-1.45 4.6-4.65 7-6.75 7-2.1 0-5.3-2.4-6.75-7z" />
                            </svg>
                          )}
                        </button>
                      </div>

                      <p className="text-sm text-gray-500 mt-2">
                        Leave blank to keep current password
                      </p>
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={updatingProfile}
                      className="w-full bg-gradient-to-r from-orange-600 to-amber-600 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-md hover:shadow-lg"
                    >
                      {updatingProfile ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Updating Profile...
                        </div>
                      ) : (
                        "Update Profile"
                      )}
                    </button>
                  </form>
                </div>
              </motion.div>
            )}

            {/* ---------------------- ORDERS SECTION ---------------------- */}
            {activeTab === "orders" && (
              <motion.div
                key="orders"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Header Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-orange-600 to-amber-400 px-6 sm:px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                        <Package className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">
                          Current Orders
                        </h2>
                        <p className="text-orange-100 text-sm mt-1">
                          {orders.length} active order
                          {orders.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {orders.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ShoppingBag className="w-8 h-8 text-[#de5422]" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No active orders
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Your current orders will appear here once you place an
                      order
                    </p>
                    <button
                      onClick={() => (window.location.href = "/")}
                      className="bg-[#de5422] hover:bg-orange-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors duration-200"
                    >
                      Start Shopping
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {orders.map((order) => (
                      <OrderCard
                        key={order._id}
                        order={order}
                        onReview={handleReview}
                        type="current"
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* ---------------------- HISTORY SECTION ---------------------- */}
            {activeTab === "history" && (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Header Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-orange-600 to-amber-400 px-6 sm:px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                        <History className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">
                          Order History
                        </h2>
                        <p className="text-orange-100 text-sm mt-1">
                          {orderHistory.length} completed order
                          {orderHistory.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {orderHistory.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <History className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No order history
                    </h3>
                    <p className="text-gray-600">
                      Your completed orders will appear here
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {orderHistory.map((order) => (
                      <OrderCard key={order._id} order={order} type="history" />
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// Order Card Component
function OrderCard({ order, onReview, type = "current" }) {
  const [expanded, setExpanded] = useState(false);

  const getStatusColor = (status) => {
    const statusColors = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      shipped: "bg-purple-100 text-purple-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return statusColors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusIcon = (status) => {
    const statusIcons = {
      pending: <Clock className="w-4 h-4" />,
      confirmed: <CheckCircle className="w-4 h-4" />,
      shipped: <Truck className="w-4 h-4" />,
      delivered: <CheckCircle className="w-4 h-4" />,
      cancelled: <X className="w-4 h-4" />,
    };
    return statusIcons[status] || <Clock className="w-4 h-4" />;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300">
      {/* Order Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-center gap-2">
                {getStatusIcon(order.status)}
                <span
                  className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(
                    order.status
                  )}`}
                >
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
              <span className="text-sm text-[#de5422] bg-amber-50 px-3 py-1 rounded-full">
                {order.items.length}{" "}
                {order.items.length === 1 ? "item" : "items"}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>{new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <DollarSign className="w-4 h-4" />
                <span className="font-semibold">£{order.totalPrice?.toFixed(2)}</span>
              </div>
              {order.deliveryDate && (
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>
                    Delivered{" "}
                    {new Date(order.deliveryDate).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setExpanded(!expanded)}
              className="px-4 py-2 border-2 cursor-pointer border-[#de5422] text-[#de5422] rounded-lg hover:bg-amber-50 transition-colors font-medium"
            >
              {expanded ? "Hide Details" : "View Details"}
            </button>
          </div>
        </div>
      </div>

      {/* Order Items */}
      {expanded && (
        <div className="p-6 bg-gray-50">
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <OrderItem
                key={index}
                item={item}
                orderId={order._id}
                orderStatus={order.status}
                onReview={onReview}
                type={type}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Order Item Component
function OrderItem({ item, orderId, orderStatus, onReview, type }) {
  const canReview = type === "current" && orderStatus === "delivered" && !item.isReviewed;

  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 bg-white rounded-lg border border-gray-200">
      {/* Product Image and Info */}
      <div className="flex gap-4 flex-1">
        <div className="w-16 h-16 relative rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-300">
          <Image
            src={item.product?.thumbnail || "/placeholder-product.png"}
            alt={item.product?.name || "Product"}
            fill
            className="object-cover"
            onError={(e) => {
              e.target.src = "/placeholder-product.png";
            }}
          />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 text-lg mb-1">
            {item.product?.name}
          </h4>

          {item.selectedCustomizations?.length > 0 && (
            <div className="text-sm text-gray-600 mb-2">
              {item.selectedCustomizations.map((customization, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1"
                >
                  <span className="font-medium">{customization.type}:</span>
                  <span>{customization.option}</span>
                  {customization.extraPrice > 0 && (
                    <span className="text-green-600 ml-1">
                      (+£{customization.extraPrice})
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>Qty: {item.quantity}</span>
            <span>•</span>
            <span className="font-semibold">
              £
              {(
                (item.priceAtPurchase || item.totalPrice || 0) * item.quantity
              ).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Review Section */}
      <div className="sm:w-80 flex-shrink-0">
        {type === "current" && orderId && (
          <div className="h-full flex items-center">
            {item.isReviewed ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center w-full">
                <div className="flex items-center justify-center gap-2 text-green-700 font-semibold mb-1">
                  <Star className="w-4 h-4 fill-green-600" />
                  Review Submitted
                </div>
                <p className="text-green-600 text-sm">
                  Thank you for your feedback!
                </p>
              </div>
            ) : canReview ? (
              <ReviewForm
                productId={item.product?._id}
                productName={item.product?.name}
                orderId={orderId}
                onSubmit={onReview}
              />
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center w-full">
                <div className="flex items-center justify-center gap-2 text-amber-700 font-semibold">
                  <Clock className="w-4 h-4" />
                  {orderStatus === "delivered" ? "Ready for Review" : `Order ${orderStatus}`}
                </div>
                <p className="text-amber-600 text-sm mt-1">
                  {orderStatus === "delivered"
                    ? "You can now review this product"
                    : `Review available after delivery`
                  }
                </p>
              </div>
            )}
          </div>
        )}

        {type === "history" && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center w-full">
            <div className="flex items-center justify-center gap-2 text-gray-700 font-semibold">
              <History className="w-4 h-4" />
              Order Completed
            </div>
            {item.isReviewed && (
              <p className="text-green-600 text-sm mt-1">
                Review submitted
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Enhanced Review Form Component
function ReviewForm({ productId, productName, orderId, onSubmit }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setUploading(true);
    const uploadedUrls = [];

    for (const file of files) {
      // Validate file type and size
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload only image files");
        continue;
      }

      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast.error("Image size should be less than 5MB");
        continue;
      }

      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (data.url) {
          uploadedUrls.push(data.url);
        } else {
          toast.error("Failed to upload image");
        }
      } catch (err) {
        console.error("Upload failed:", err);
        toast.error("Failed to upload image");
      }
    }

    setImages((prev) => [...prev, ...uploadedUrls]);
    setUploading(false);
  };

  const handleSubmit = async () => {
    if (!comment.trim()) {
      toast.error("Please enter a review comment");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(productId, orderId, rating, comment.trim(), images);
      setIsExpanded(false);
      setComment("");
      setImages([]);
      setRating(5);
    } catch (error) {
      console.error("Review submission error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border-2 border-[#de5422] p-4 w-full">
      <div
        className="flex justify-between items-center cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
          <span className="font-semibold text-[#de5422]">Write a Review</span>
        </div>
        <div
          className={`transform transition-transform duration-300 ${isExpanded ? "rotate-180" : ""
            }`}
        >
          <svg
            className="w-5 h-5 text-[#de5422]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 space-y-4 overflow-hidden"
          >
            {/* Rating */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                How would you rate this product?
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`text-3xl transition-all duration-200 ${star <= rating
                      ? "text-yellow-400 transform scale-110"
                      : "text-gray-300 hover:text-yellow-300"
                      }`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {rating === 5
                  ? "Excellent"
                  : rating === 4
                    ? "Good"
                    : rating === 3
                      ? "Average"
                      : rating === 2
                        ? "Poor"
                        : "Terrible"}
              </p>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Share your experience
              </label>
              <textarea
                className="w-full border border-gray-300 rounded-lg p-4 focus:ring-2 focus:ring-[#de5422] focus:border-transparent outline-none transition duration-300 bg-white resize-none"
                placeholder="What did you like about this product? Was there anything that could be improved?"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Add Photos ({images.length}/5)
              </label>
              <div className="flex items-center gap-4">
                <label className="cursor-pointer bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-100 transition duration-300 flex-1">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <span className="text-gray-600 font-medium block">
                    Upload Images
                  </span>
                  <span className="text-gray-500 text-sm">
                    PNG, JPG up to 5MB
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={images.length >= 5 || uploading}
                  />
                </label>

                {uploading && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                    <span>Uploading...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Image Previews */}
            {images.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Photo Previews
                </label>
                <div className="flex gap-3 flex-wrap">
                  {images.map((url, index) => (
                    <div key={index} className="relative group">
                      <div className="w-20 h-20 relative rounded-lg overflow-hidden border-2 border-gray-300">
                        <Image
                          src={url}
                          fill
                          alt={`Preview ${index + 1}`}
                          className="object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setImages(images.filter((_, i) => i !== index))
                        }
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={submitting || !comment.trim()}
              className="w-full bg-[#de5422] hover:bg-orange-700 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting Review...
                </div>
              ) : (
                "Submit Review"
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}