"use client";

import { useEffect, useState, Fragment } from "react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Truck, 
  MapPin, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  X, 
  Package,
  User,
  DollarSign,
  Calendar,
  Phone,
  Mail,
  Map,
  ShoppingCart,
  Loader,
  MoreVertical
} from "lucide-react";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [selectedCity, setSelectedCity] = useState("all");
  const [loading, setLoading] = useState(false);
  const [buttonLoading, setButtonLoading] = useState({});
  const [simpleOrderData, setSimpleOrderData] = useState({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(null);

  // ✅ Fetch orders
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/order");
      const data = await res.json();
      if (data.success) setOrders(data.orders || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    }
    setLoading(false);
  };

  // ✅ Fetch routes
  const fetchRoutes = async () => {
    try {
      const res = await fetch("/api/delivery");
      const data = await res.json();
      if (data.success) setRoutes(data.routes || []);
    } catch (error) {
      console.error("Error fetching routes:", error);
      toast.error("Failed to load routes");
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchRoutes();
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setMobileMenuOpen(null);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // ✅ Fetch simplified order data
  const fetchSimpleOrderData = async (orderId) => {
    try {
      const response = await fetch(`/api/order/${orderId}/simple`, {
        credentials: "include"
      });
      const data = await response.json();
      
      if (data.success) {
        setSimpleOrderData(prev => ({
          ...prev,
          [orderId]: data.order
        }));
      }
    } catch (error) {
      console.error("Error fetching simplified order:", error);
    }
  };

  // ✅ Add or remove route assignment
  const toggleOrderRoute = async (orderId, routeId, action) => {
    setButtonLoading(prev => ({ ...prev, [orderId]: true }));

    // 🟢 Find the selected route to include its deliveryDate
    const selected = routes.find(r => r._id === routeId);

    try {
      const res = await fetch(`/api/admin/order/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          routeId,
          orderId,
          action,
          deliveryDate: selected?.deliveryDate,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(
          `${action === "add" ? "✅ Order assigned to route" : "🗑️ Order removed from route"}`
        );
        fetchOrders();
        setMobileMenuOpen(null);
      } else {
        toast.error(data.message || "Failed to update route assignment");
      }
    } catch (error) {
      console.error("Error updating route:", error);
      toast.error("Failed to update route assignment");
    }

    setButtonLoading(prev => ({ ...prev, [orderId]: false }));
  };

  // ✅ City filter
  const cities = [...new Set(orders.map(o => o.shippingAddress?.city).filter(Boolean))];

  // ✅ Filtered orders
  const filteredOrders = orders.filter(order => {
    if (selectedCity !== "all" && order.shippingAddress?.city !== selectedCity) return false;
    if (selectedRoute) {
      if (order.deliveryRoute && order.deliveryRoute !== selectedRoute._id) return false;
    }
    return true;
  });

  // ✅ Filter out routes with status "shipped" or "delivered"
  const activeRoutes = routes.filter(
    r => r.status !== "shipped" && r.status !== "delivered"
  );

  // Mobile Order Card Component
  const OrderCard = ({ order, index }) => {
    const isAssigned = order.deliveryRoute === selectedRoute?._id;
    const isExpanded = expandedOrder === order._id;
    const isBtnLoading = buttonLoading[order._id];

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className=" rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
      >
        {/* Order Header */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start gap-3 flex-1">
              <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                  {order.user?.name || "Unknown Customer"}
                </h3>
                <p className="text-xs text-gray-500 mt-1 truncate">
                  {order.shippingAddress?.email}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <MapPin className="w-3 h-3 text-gray-600" />
                  <span className="text-xs font-medium text-gray-700">{order.shippingAddress?.city}</span>
                </div>
              </div>
            </div>
            
            {/* Mobile Menu Button */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMobileMenuOpen(mobileMenuOpen === order._id ? null : order._id);
                }}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              
              {/* Mobile Dropdown Menu */}
              {mobileMenuOpen === order._id && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-40">
                  <button
                    onClick={() => {
                      if (!isExpanded) {
                        fetchSimpleOrderData(order._id);
                      }
                      setExpandedOrder(isExpanded ? null : order._id);
                      setMobileMenuOpen(null);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    {isExpanded ? 'Hide Details' : 'View Details'}
                  </button>
                  <button
                    onClick={() => toggleOrderRoute(order._id, selectedRoute._id, isAssigned ? "remove" : "add")}
                    disabled={isBtnLoading}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isBtnLoading ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        Loading...
                      </>
                    ) : isAssigned ? (
                      <>
                        <X className="w-4 h-4 text-red-600" />
                        <span className="text-red-600">Remove from Route</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 text-green-600" />
                        <span className="text-green-600">Assign to Route</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-orange-100">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="font-bold text-green-600 text-sm">
                ${order.totalPrice.toFixed(2)}
              </span>
            </div>
            {selectedRoute && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                isAssigned 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {isAssigned ? 'Assigned' : 'Not Assigned'}
              </span>
            )}
          </div>
        </div>

        {/* Expanded Order Details */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden border-t border-orange-200"
            >
              <div className="p-4 bg-orange-50">
                {simpleOrderData[order._id] ? (
                  <div className="space-y-4">
                    {/* Order Header */}
                    <div className="grid grid-cols-2 gap-3 p-3 bg-white rounded-lg border border-orange-200">
                      <div className="flex items-center gap-2">
                        <ShoppingCart className="w-4 h-4 text-[#de5422]" />
                        <div>
                          <div className="text-xs font-medium text-gray-600">Order ID</div>
                          <div className="text-gray-800 font-mono text-xs truncate">{simpleOrderData[order._id]._id.slice(-8)}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div>
                          <div className="text-xs font-medium text-gray-600">Status</div>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                            simpleOrderData[order._id].status === 'delivered' ? 'bg-green-100 text-green-800' :
                            simpleOrderData[order._id].status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                            simpleOrderData[order._id].status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {simpleOrderData[order._id].status}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <div>
                          <div className="text-xs font-medium text-gray-600">Total</div>
                          <div className="text-green-600 font-semibold text-sm">${simpleOrderData[order._id].totalPrice}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <div>
                          <div className="text-xs font-medium text-gray-600">Date</div>
                          <div className="text-gray-800 text-xs">
                            {new Date(simpleOrderData[order._id].createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Shipping Information */}
                    <div className="bg-white rounded-lg border border-orange-200 p-4">
                      <h3 className="text-base font-semibold text-[#de5422] mb-3 flex items-center gap-2">
                        <Truck className="w-4 h-4" />
                        Shipping Information
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-2 bg-orange-50 rounded-lg">
                          <User className="w-4 h-4 text-[#de5422]" />
                          <div>
                            <div className="text-xs font-medium text-gray-600">Customer</div>
                            <div className="text-gray-800 text-sm">{simpleOrderData[order._id].shippingInfo.customerName}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-2 bg-orange-50 rounded-lg">
                          <Phone className="w-4 h-4 text-[#de5422]" />
                          <div>
                            <div className="text-xs font-medium text-gray-600">Phone</div>
                            <div className="text-gray-800 text-sm">{simpleOrderData[order._id].shippingInfo.phone}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-2 bg-orange-50 rounded-lg">
                          <Mail className="w-4 h-4 text-[#de5422]" />
                          <div>
                            <div className="text-xs font-medium text-gray-600">Email</div>
                            <div className="text-gray-800 text-sm truncate">{simpleOrderData[order._id].shippingInfo.email}</div>
                          </div>
                        </div>
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <div className="text-xs font-medium text-gray-600 mb-1">Complete Address</div>
                          <div className="text-gray-800 text-sm">
                            {simpleOrderData[order._id].shippingInfo.address.street}, {simpleOrderData[order._id].shippingInfo.address.city} {simpleOrderData[order._id].shippingInfo.address.postalCode}
                          </div>
                          {simpleOrderData[order._id].shippingInfo.address.notes && (
                            <div className="text-xs text-gray-600 mt-1 italic">
                              📝 Note: {simpleOrderData[order._id].shippingInfo.address.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Products */}
                    <div className="bg-white rounded-lg border border-orange-200 p-4">
                      <h3 className="text-base font-semibold text-[#de5422] mb-3 flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        Products ({simpleOrderData[order._id].products.length})
                      </h3>
                      <div className="space-y-3">
                        {simpleOrderData[order._id].products.map((product, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="border border-orange-200 rounded-lg p-3"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-semibold text-gray-900 text-sm">{product.productName}</h4>
                              <span className="text-green-600 font-bold text-sm">${product.total}</span>
                            </div>
                            
                            <div className="text-xs text-gray-600 mb-2">
                              {product.quantity} × ${product.price} = ${product.total}
                            </div>

                            {/* Customizations */}
                            {product.customizations.length > 0 && (
                              <div className="mt-2 pt-2 border-t border-orange-100">
                                <div className="text-xs font-medium text-gray-700 mb-1">Customizations:</div>
                                <div className="flex flex-wrap gap-1">
                                  {product.customizations.map((custom, customIdx) => (
                                    <span
                                      key={customIdx}
                                      className="bg-gradient-to-r from-orange-100 to-amber-100 px-2 py-1 rounded text-xs border border-orange-200"
                                    >
                                      {custom.type}: {custom.option}
                                      {custom.extraPrice > 0 && (
                                        <span className="text-green-600 font-medium ml-1">
                                          (+${custom.extraPrice})
                                        </span>
                                      )}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-4">
                    <div className="flex items-center gap-2">
                      <Loader className="w-5 h-5 text-[#de5422] animate-spin" />
                      <span className="text-gray-600 text-sm">Loading order details...</span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen  p-3 sm:p-4 lg:p-6">
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
          {/* Header Skeleton */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-orange-200 p-4 sm:p-6">
            <div className="h-6 sm:h-8 bg-gray-200 rounded-lg w-48 sm:w-64 mb-3 sm:mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-32 sm:w-48 animate-pulse"></div>
          </div>
          
          {/* Routes Skeleton */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-orange-200 p-4 sm:p-6">
            <div className="h-5 sm:h-6 bg-gray-200 rounded w-40 sm:w-48 mb-3 sm:mb-4 animate-pulse"></div>
            <div className="flex gap-2 sm:gap-3 flex-wrap">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-8 sm:h-10 bg-gray-200 rounded-lg w-32 sm:w-48 animate-pulse"></div>
              ))}
            </div>
          </div>

          {/* Cards Skeleton */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-orange-200 p-4 sm:p-6">
            <div className="space-y-3 sm:space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="p-3 sm:p-4 border border-gray-200 rounded-lg">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  p-3 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-orange-200 p-4 sm:p-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#de5422]">Order Management</h1>
              <p className="text-gray-600 text-sm sm:text-base">Manage orders and assign delivery routes</p>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 mt-3 sm:mt-4 text-xs sm:text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Total Orders: {orders.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Active Routes: {activeRoutes.length}</span>
            </div>
          </div>
        </motion.div>

        {/* Routes Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-orange-200 p-4 sm:p-6"
        >
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <div className="p-2 sm:p-3 bg-orange-100 rounded-lg sm:rounded-xl">
              <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-[#de5422]" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-[#de5422]">Active Delivery Routes</h2>
          </div>

          {activeRoutes.length === 0 ? (
            <div className="text-center py-6 sm:py-8 text-gray-500">
              <Truck className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 text-gray-300" />
              <p className="text-sm sm:text-base">No active routes available</p>
              <p className="text-xs sm:text-sm">Create routes in Delivery Management</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {activeRoutes.map(route => (
                <motion.button
                  key={route._id}
                  onClick={() =>
                    setSelectedRoute(selectedRoute?._id === route._id ? null : route)
                  }
                  className={`px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border-2 transition-all duration-300 flex items-center gap-2 sm:gap-3 ${
                    selectedRoute?._id === route._id
                      ? "bg-[#de5422] border-[#de5422] text-white scale-105 shadow-lg"
                      : "bg-white border-orange-200 hover:border-[#de5422] hover:shadow-md"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                  <div className="text-left">
                    <div className="font-semibold text-sm sm:text-base">{route.city}</div>
                    <div className="text-xs sm:text-sm opacity-80">
                      {new Date(route.deliveryDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium ${
                    route.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    route.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {route.status}
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Filters and Orders Section */}
        {selectedRoute && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4 sm:space-y-6"
          >
            {/* Filter Section */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-orange-200 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Filter className="w-4 h-4 text-[#de5422]" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-[#de5422]">
                    Orders for <span className="text-orange-600">{selectedRoute.city}</span>
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-gray-600" />
                  <select
                    className="border border-gray-300 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 focus:ring-2 focus:ring-[#de5422] focus:border-transparent outline-none transition duration-300 text-sm sm:text-base w-full sm:w-auto"
                    value={selectedCity}
                    onChange={e => setSelectedCity(e.target.value)}
                  >
                    <option value="all">All Cities</option>
                    {cities.map(city => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Orders - Mobile Card View */}
            <div className="block sm:hidden">
              {filteredOrders.length === 0 ? (
                <div className="text-center py-8 bg-white rounded-xl border border-orange-200">
                  <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <h3 className="text-base font-semibold text-gray-600 mb-2">No Orders Found</h3>
                  <p className="text-gray-500 text-sm">
                    {selectedCity !== "all" 
                      ? `No orders found in ${selectedCity} for this route`
                      : "No orders available for this route"}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredOrders.map((order, index) => (
                    <OrderCard key={order._id} order={order} index={index} />
                  ))}
                </div>
              )}
            </div>

            {/* Orders - Desktop Table View */}
            <div className="hidden sm:block bg-white rounded-xl sm:rounded-2xl shadow-lg border border-orange-200 overflow-hidden">
              {filteredOrders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No Orders Found</h3>
                  <p className="text-gray-500">
                    {selectedCity !== "all" 
                      ? `No orders found in ${selectedCity} for this route`
                      : "No orders available for this route"}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-orange-50 to-amber-50">
                      <tr>
                        <th className="p-4 text-left text-sm font-semibold text-[#de5422]">Customer</th>
                        <th className="p-4 text-left text-sm font-semibold text-[#de5422]">City</th>
                        <th className="p-4 text-left text-sm font-semibold text-[#de5422]">Total</th>
                        <th className="p-4 text-left text-sm font-semibold text-[#de5422]">Route Action</th>
                        <th className="p-4 text-left text-sm font-semibold text-[#de5422]">Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((order, index) => {
                        const isAssigned = order.deliveryRoute === selectedRoute._id;
                        const isExpanded = expandedOrder === order._id;
                        const isBtnLoading = buttonLoading[order._id];

                        return (
                          <Fragment key={order._id}>
                            <motion.tr 
                              className={`border-b border-orange-100 hover:bg-orange-50 transition-colors duration-200 ${
                                isExpanded ? 'bg-orange-50' : ''
                              }`}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                            >
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-blue-100 rounded-lg">
                                    <User className="w-4 h-4 text-blue-600" />
                                  </div>
                                  <div>
                                    <div className="font-semibold text-gray-900">
                                      {order.user?.name || "Unknown Customer"}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {order.shippingAddress?.email}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4 text-gray-600" />
                                  <span className="font-medium">{order.shippingAddress?.city}</span>
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-2">
                                  <DollarSign className="w-4 h-4 text-green-600" />
                                  <span className="font-bold text-green-600">
                                    ${order.totalPrice.toFixed(2)}
                                  </span>
                                </div>
                              </td>
                              <td className="p-4">
                                <motion.button
                                  disabled={isBtnLoading}
                                  onClick={() =>
                                    toggleOrderRoute(
                                      order._id,
                                      selectedRoute._id,
                                      isAssigned ? "remove" : "add"
                                    )
                                  }
                                  className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                                    isAssigned
                                      ? "bg-red-500 hover:bg-red-600 text-white"
                                      : "bg-[#de5422] hover:bg-gradient-to-br hover:from-amber-400 hover:to-orange-600 text-white"
                                  } ${isBtnLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
                                  whileHover={{ scale: isBtnLoading ? 1 : 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  {isBtnLoading ? (
                                    <Loader className="w-4 h-4 animate-spin" />
                                  ) : isAssigned ? (
                                    <X className="w-4 h-4" />
                                  ) : (
                                    <Plus className="w-4 h-4" />
                                  )}
                                  {isAssigned ? "Remove" : "Assign"}
                                </motion.button>
                              </td>
                              <td className="p-4">
                                <motion.button
                                  onClick={() => {
                                    if (!isExpanded) {
                                      fetchSimpleOrderData(order._id);
                                    }
                                    setExpandedOrder(isExpanded ? null : order._id);
                                  }}
                                  className="flex items-center gap-2 text-[#de5422] hover:text-orange-700 font-semibold transition-colors duration-200"
                                  whileHover={{ scale: 1.05 }}
                                >
                                  {isExpanded ? (
                                    <>
                                      <ChevronUp className="w-4 h-4" />
                                      Hide
                                    </>
                                  ) : (
                                    <>
                                      <ChevronDown className="w-4 h-4" />
                                      View
                                    </>
                                  )}
                                </motion.button>
                              </td>
                            </motion.tr>

                            {/* Expanded Order Details */}
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.tr
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.3 }}
                                >
                                  <td colSpan={5} className="p-0">
                                    <div className="bg-orange-50 border-l-4 border-[#de5422] p-6">
                                      {simpleOrderData[order._id] ? (
                                        <div className="space-y-6">
                                          {/* Order Header */}
                                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-white rounded-xl border border-orange-200">
                                            <div className="flex items-center gap-2">
                                              <ShoppingCart className="w-4 h-4 text-[#de5422]" />
                                              <div>
                                                <div className="text-sm font-medium text-gray-600">Order ID</div>
                                                <div className="text-gray-800 font-mono text-sm">{simpleOrderData[order._id]._id}</div>
                                              </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                              <div>
                                                <div className="text-sm font-medium text-gray-600">Status</div>
                                                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                  simpleOrderData[order._id].status === 'delivered' ? 'bg-green-100 text-green-800' :
                                                  simpleOrderData[order._id].status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                                  simpleOrderData[order._id].status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                                                  'bg-gray-100 text-gray-800'
                                                }`}>
                                                  {simpleOrderData[order._id].status}
                                                </div>
                                              </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <DollarSign className="w-4 h-4 text-green-600" />
                                              <div>
                                                <div className="text-sm font-medium text-gray-600">Total</div>
                                                <div className="text-green-600 font-semibold">${simpleOrderData[order._id].totalPrice}</div>
                                              </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <Calendar className="w-4 h-4 text-blue-600" />
                                              <div>
                                                <div className="text-sm font-medium text-gray-600">Date</div>
                                                <div className="text-gray-800 text-sm">
                                                  {new Date(simpleOrderData[order._id].createdAt).toLocaleDateString()}
                                                </div>
                                              </div>
                                            </div>
                                          </div>

                                          {/* Shipping Information */}
                                          <div className="bg-white rounded-xl border border-orange-200 p-6">
                                            <h3 className="text-lg font-semibold text-[#de5422] mb-4 flex items-center gap-2">
                                              <Truck className="w-5 h-5" />
                                              Shipping Information
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                              <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                                                <User className="w-4 h-4 text-[#de5422]" />
                                                <div>
                                                  <div className="text-sm font-medium text-gray-600">Customer</div>
                                                  <div className="text-gray-800">{simpleOrderData[order._id].shippingInfo.customerName}</div>
                                                </div>
                                              </div>
                                              <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                                                <Phone className="w-4 h-4 text-[#de5422]" />
                                                <div>
                                                  <div className="text-sm font-medium text-gray-600">Phone</div>
                                                  <div className="text-gray-800">{simpleOrderData[order._id].shippingInfo.phone}</div>
                                                </div>
                                              </div>
                                              <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                                                <Mail className="w-4 h-4 text-[#de5422]" />
                                                <div>
                                                  <div className="text-sm font-medium text-gray-600">Email</div>
                                                  <div className="text-gray-800">{simpleOrderData[order._id].shippingInfo.email}</div>
                                                </div>
                                              </div>
                                              <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                                                <Map className="w-4 h-4 text-[#de5422]" />
                                                <div>
                                                  <div className="text-sm font-medium text-gray-600">City</div>
                                                  <div className="text-gray-800">{simpleOrderData[order._id].shippingInfo.address.city}</div>
                                                </div>
                                              </div>
                                            </div>
                                            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                              <div className="text-sm font-medium text-gray-600 mb-1">Complete Address</div>
                                              <div className="text-gray-800">
                                                {simpleOrderData[order._id].shippingInfo.address.street}, {simpleOrderData[order._id].shippingInfo.address.city} {simpleOrderData[order._id].shippingInfo.address.postalCode}
                                              </div>
                                              {simpleOrderData[order._id].shippingInfo.address.notes && (
                                                <div className="text-sm text-gray-600 mt-2 italic">
                                                  📝 Note: {simpleOrderData[order._id].shippingInfo.address.notes}
                                                </div>
                                              )}
                                            </div>
                                          </div>

                                          {/* Products */}
                                          <div className="bg-white rounded-xl border border-orange-200 p-6">
                                            <h3 className="text-lg font-semibold text-[#de5422] mb-4 flex items-center gap-2">
                                              <Package className="w-5 h-5" />
                                              Products ({simpleOrderData[order._id].products.length})
                                            </h3>
                                            <div className="space-y-3">
                                              {simpleOrderData[order._id].products.map((product, idx) => (
                                                <motion.div
                                                  key={idx}
                                                  initial={{ opacity: 0, x: -20 }}
                                                  animate={{ opacity: 1, x: 0 }}
                                                  transition={{ delay: idx * 0.1 }}
                                                  className="border border-orange-200 rounded-xl p-4 hover:shadow-md transition-shadow duration-300"
                                                >
                                                  <div className="flex justify-between items-start mb-3">
                                                    <h4 className="font-semibold text-gray-900 text-lg">{product.productName}</h4>
                                                    <span className="text-green-600 font-bold text-lg">${product.total}</span>
                                                  </div>
                                                  
                                                  <div className="text-gray-600 mb-3">
                                                    <span className="font-medium">Quantity:</span> {product.quantity} × ${product.price} = ${product.total}
                                                  </div>

                                                  {/* Customizations */}
                                                  {product.customizations.length > 0 && (
                                                    <div className="mt-3 pt-3 border-t border-orange-100">
                                                      <div className="text-sm font-medium text-gray-700 mb-2">Customizations:</div>
                                                      <div className="flex flex-wrap gap-2">
                                                        {product.customizations.map((custom, customIdx) => (
                                                          <span
                                                            key={customIdx}
                                                            className="bg-gradient-to-r from-orange-100 to-amber-100 px-3 py-1 rounded-lg text-sm border border-orange-200"
                                                          >
                                                            {custom.type}: {custom.option}
                                                            {custom.extraPrice > 0 && (
                                                              <span className="text-green-600 font-medium ml-1">
                                                                (+${custom.extraPrice})
                                                              </span>
                                                            )}
                                                          </span>
                                                        ))}
                                                      </div>
                                                    </div>
                                                  )}
                                                </motion.div>
                                              ))}
                                            </div>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="flex items-center justify-center py-8">
                                          <div className="flex items-center gap-3">
                                            <Loader className="w-6 h-6 text-[#de5422] animate-spin" />
                                            <span className="text-gray-600">Loading order details...</span>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                </motion.tr>
                              )}
                            </AnimatePresence>
                          </Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}