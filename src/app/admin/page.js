"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import CategoryManager from "@/components/Category";
import ProductManager from "@/components/Product";
import TickerManager from "@/components/TickerManager";
import ManageHero from "@/components/ManageHero";
import Coupon from "@/components/Coupon";
import DeliveryRoutesManager from "@/components/DeliveryManagment";
import OrderManagment from "@/components/OrderManagment";
import BlogManager from "@/components/BlogManager";
import AdminOverview from "@/components/AdminOverview";
import AdminManagement from "@/components/AdminManagement";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/logout", { method: "POST" });
      if (!res.ok) throw new Error("Logout failed");
      toast.success("✅ Logged out successfully");
      router.push("/");
    } catch (e) {
      toast.error("❌ Logout failed");
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <AdminOverview />;
      case "products":
        return <ProductManager />;
      case "categories":
        return <CategoryManager />;
      case "ticker":
        return <TickerManager />;
      case "hero":
        return <ManageHero />;
      case "coupon":
        return <Coupon />;
      case "delivery":
        return <DeliveryRoutesManager />;
      case "orders":
        return <OrderManagment />;
      case "blogs":
        return <BlogManager />;
      case "admins":
        return <AdminManagement />;
      default:
        return (
          <div className="flex items-center justify-center h-64">
            <h2 className="text-xl text-gray-600">Select an option from the sidebar</h2>
          </div>
        );
    }
  };

  const menuItems = [
    { id: "overview", label: "Overview", icon: "🧭" },
    { id: "products", label: "Product Management", icon: "🛒" },
    { id: "categories", label: "Category Management", icon: "🗂️" },
    { id: "ticker", label: "Ticker Management", icon: "📰" },
    { id: "hero", label: "Manage Hero Section", icon: "🖼️" },
    { id: "coupon", label: "Coupon Management", icon: "🎟️" },
    { id: "delivery", label: "Delivery Routes", icon: "🚚" },
    { id: "orders", label: "Order Management", icon: "📦" },
    { id: "blogs", label: "Blog Management", icon: "✍️" },
    { id: "admins", label: "Manage User", icon: "🛡️" },
  ];

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-lg border-b border-gray-200 px-4 py-3 sm:px-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 flex items-center gap-2">
            Admin Dashboard
          </h1>
        </div>

        <button
          onClick={handleLogout}
          className="bg-gradient-to-br from-amber-400 to-orange-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg hover:from-amber-500 hover:to-orange-700 transition-all duration-300 font-semibold text-sm sm:text-base shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          Logout
        </button>
      </nav>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Content */}
      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-[85vw] max-w-sm sm:w-80 lg:w-64 bg-white shadow-xl lg:shadow-none
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          lg:translate-x-0
          h-screen lg:h-auto
          overflow-y-auto
        `}>
          <div className="p-4 lg:p-6">
            {/* Mobile Close Button */}
            <div className="flex justify-between items-center mb-6 lg:hidden">
              <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Close menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Menu Items */}
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.id}>
                  <button
                    className={`w-full text-left px-3 py-3 sm:px-4 rounded-xl flex items-center gap-3 transition-all duration-300 font-medium group ${activeTab === item.id
                      ? "bg-gradient-to-br from-amber-400 to-orange-600 text-white shadow-lg transform scale-105"
                      : "text-gray-700 hover:bg-gradient-to-br hover:from-amber-50 hover:to-orange-50 hover:text-[#de5422] border border-transparent hover:border-amber-200"
                      }`}
                    onClick={() => handleTabChange(item.id)}
                  >
                    <span className="text-lg flex-shrink-0" aria-hidden="true">{item.icon}</span>
                    <span className="flex-1 text-sm sm:text-base">{item.label}</span>
                    {activeTab === item.id && (
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse flex-shrink-0"></span>
                    )}
                  </button>
                </li>
              ))}
            </ul>

            {/* Current Section Indicator - Mobile */}
            <div className="mt-6 p-3 bg-gray-50 rounded-lg lg:hidden">
              <p className="text-xs text-gray-600">Current Section:</p>
              <p className="font-semibold text-[#de5422] text-sm">
                {menuItems.find(item => item.id === activeTab)?.label}
              </p>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-screen p-3 sm:p-4 lg:p-6 bg-gray-50 w-full">
          {/* Mobile Header */}
          <div className="lg:hidden mb-4 p-3 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                {menuItems.find(item => item.id === activeTab)?.label}
              </h2>
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors flex-shrink-0 ml-2"
                aria-label="Open menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 overflow-hidden w-full">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Mobile Navigation Bar */}
      {isMobile && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 shadow-lg z-30">
          <div className="flex justify-around items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex flex-col items-center p-2 text-gray-600 hover:text-[#de5422] transition-colors flex-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span className="text-xs mt-1">Menu</span>
            </button>

            <div className="text-center flex-1 px-2">
              <span className="text-xs text-gray-500 block">Active:</span>
              <span className="text-xs font-semibold text-[#de5422] truncate">
                {menuItems.find(item => item.id === activeTab)?.label.split(' ')[0]}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="flex flex-col items-center p-2 text-gray-600 hover:text-red-600 transition-colors flex-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="text-xs mt-1">Logout</span>
            </button>
          </div>
        </div>
      )}

      {/* Add padding for mobile bottom nav */}
      {isMobile && <div className="h-16"></div>}
    </div>
  );
}