"use client";

import React, { useState, useEffect } from "react";
import { getAllStores, StoreData } from "@/lib/api/stores";
import { StoreCard } from "@/components/StoreCard";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/use-cart";
import { FaFilter, FaSearch, FaHistory, FaLayerGroup, FaShoppingCart, FaShoppingBag, FaBars } from "react-icons/fa";
import { BuyerSidebar } from "@/components/BuyerSidebar";

export default function ProductsPage() {
  const [stores, setStores] = useState<StoreData[]>([]);
  const [filteredStores, setFilteredStores] = useState<StoreData[]>([]);
  const [loading, setLoading] = useState(true);
  const [hostelFilter, setHostelFilter] = useState<string>("All");
  const [floorFilter, setFloorFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const { cart } = useCart();
  
  let [cartItemCount, setCartItemCount] = useState(0);
const [lastOrderPlaced, setLastOrderPlaced] = useState(false);

useEffect(() => {
  const fetchCartStatus = async () => {
    try {
      const res = await fetch("/api/cart/count", {
        credentials: "include",
      });
      
      // Check if response is OK and is JSON before parsing
      if (res.ok && res.headers.get("content-type")?.includes("application/json")) {
        const data = await res.json();
        setCartItemCount(data.count);
      } else {
        setCartItemCount(0);
      }

      // optional: fetch order status from backend
      const orderRes = await fetch("/api/orders/last");
      if (orderRes.ok && orderRes.headers.get("content-type")?.includes("application/json")) {
        const orderData = await orderRes.json();
        setLastOrderPlaced(orderData.status === "placed");
      } else {
        setLastOrderPlaced(false);
      }

    } catch (err) {
      console.error(err);
      setCartItemCount(0);
      setLastOrderPlaced(false);
    }
  };

  fetchCartStatus();
}, []);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoading(true);
        const data = await getAllStores();
        setStores(data);
        setFilteredStores(data);
      } catch (error) {
        console.error("Error loading stores:", error);
        toast.error("Failed to load stores. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchStores();
  }, []);

  useEffect(() => {
    let result = stores;
    
    if (hostelFilter !== "All") {
      result = result.filter(store => store.hostel.toLowerCase() === hostelFilter.toLowerCase());
    }

    if (floorFilter !== "All") {
      result = result.filter(store => store.floor.toLowerCase() === floorFilter.toLowerCase());
    }
    
    if (searchQuery) {
      result = result.filter(store => 
        store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.hostel.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredStores(result);
  }, [hostelFilter, floorFilter, searchQuery, stores]);

  const uniqueHostels = ["All", ...new Set(stores.map(s => s.hostel))];
  const uniqueFloors = ["All", ...new Set(stores.map(s => s.floor))].sort((a, b) => {
    if (a === "All") return -1;
    if (b === "All") return 1;
    return a.localeCompare(b, undefined, { numeric: true });
  });

  const handleStoreClick = (storeId: string) => {
    router.push(`/products/${storeId}`);
  };

  cartItemCount = cart ? cart.items.reduce((acc, item) => acc + item.quantity, 0) : 0;

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      {/* Sidebar */}
      <BuyerSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 pb-20">
        {/* Hero Section */}
        <div className="bg-indigo-600 pt-16 pb-32 px-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl" />
          </div>
          
          {/* Mobile Sidebar Toggle */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden fixed top-4 left-4 z-30 bg-white text-indigo-600 p-3 rounded-xl shadow-lg hover:bg-indigo-50 transition-all"
          >
            <FaBars className="text-xl" />
          </button>
          
          <div className="max-w-6xl mx-auto relative z-10 text-center">
            <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight">
              Find Your <span className="text-indigo-200">Fav Stores</span>
            </h1>
            <p className="text-indigo-100 text-lg md:text-xl max-w-2xl mx-auto font-medium opacity-90">
              Browse stores across all KIIT hostels and get what you need, right at your doorstep.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 -mt-16 relative z-20">
        {/* Search & Filter Bar */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/20 p-6 rounded-[2.5rem] shadow-2xl flex flex-col gap-6 mb-12 shadow-indigo-100/50">
          <div className="flex flex-col md:flex-row gap-6 items-center w-full">
            <div className="flex-1 relative w-full group">
              <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
              <input 
                type="text" 
                placeholder="Search by store name or hostel..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-gray-50 border-none rounded-3xl focus:ring-2 focus:ring-indigo-600 transition-all font-medium text-gray-700"
              />
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
              <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-2xl whitespace-nowrap font-bold text-sm">
                <FaFilter />
                <span>Hostel:</span>
              </div>
              {uniqueHostels.map(hostel => (
                <button
                  key={hostel}
                  onClick={() => setHostelFilter(hostel)}
                  className={`px-5 py-3 rounded-2xl text-sm font-bold transition-all whitespace-nowrap ${
                    hostelFilter === hostel 
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105" 
                      : "bg-white text-gray-500 hover:bg-gray-100 border border-gray-100"
                  }`}
                >
                  {hostel}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 w-full overflow-x-auto pb-2 scrollbar-hide border-t border-gray-50 pt-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-2xl whitespace-nowrap font-bold text-sm">
              <FaLayerGroup className="text-indigo-400" />
              <span>Floor:</span>
            </div>
            {uniqueFloors.map(floor => (
              <button
                key={floor}
                onClick={() => setFloorFilter(floor)}
                className={`px-5 py-3 rounded-2xl text-sm font-bold transition-all whitespace-nowrap ${
                  floorFilter === floor 
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105" 
                    : "bg-white text-gray-500 hover:bg-gray-100 border border-gray-100"
                }`}
              >
                {floor === "All" ? "All Floors" : `Floor ${floor}`}
              </button>
            ))}
          </div>
        </div>

        {/* Results Section */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
            <p className="text-gray-500 font-bold animate-pulse">Fetching stores...</p>
          </div>
        ) : filteredStores.length === 0 ? (
          <div className="bg-white rounded-[3rem] p-20 text-center shadow-sm border border-gray-100">
             <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaHistory className="text-4xl text-gray-300" />
             </div>
             <h2 className="text-2xl font-bold text-gray-900 mb-2">No Stores Found</h2>
             <p className="text-gray-500 max-w-xs mx-auto">We couldn't find any stores matching your criteria. Try adjusting your filters.</p>
              <button 
                onClick={() => {setHostelFilter("All"); setFloorFilter("All"); setSearchQuery("");}}
                className="mt-8 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
              >
                 Reset All Filters
              </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredStores.map(store => (
              <StoreCard 
                key={store._id} 
                store={store} 
                onClick={handleStoreClick}
              />
            ))}
          </div>
        )}
        </div>

        {/* Decorative floating element */}
        <div className="fixed bottom-10 left-10 w-32 h-32 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />

        {/* Floating Go to Cart / My Order Button */}
        {/* {cartItemCount > 0 ? (
          <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white/80 backdrop-blur-lg border-t border-gray-100 flex justify-center">
            <button 
              onClick={() => router.push("/cart")}
              className="w-full max-w-md bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-xl flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all active:scale-95 shadow-indigo-100"
            >
              <FaShoppingCart />
              <span>Go to Cart ({cartItemCount})</span>
            </button>
          </div>
        ) : localStorage.getItem("lastOrderId") === "placed" && (
          <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white/80 backdrop-blur-lg border-t border-gray-100 flex justify-center">
            <button 
              onClick={() => router.push("/orders")}
              className="w-full max-w-md bg-green-600 text-white py-4 rounded-2xl font-bold shadow-xl flex items-center justify-center gap-3 hover:bg-green-700 transition-all active:scale-95 shadow-green-100"
            >
              <FaShoppingBag />
              <span>Go to My Orders</span>
            </button>
          </div>
        )} */}
        {cartItemCount > 0 ? (
          <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white/80 backdrop-blur-lg border-t border-gray-100 flex justify-center">
            <button
              onClick={() => router.push("/cart")}
              className="w-full max-w-md bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-xl flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all active:scale-95 shadow-indigo-100"
            >
              <FaShoppingCart />
              <span>Go to Cart ({cartItemCount})</span>
            </button>
          </div>
        ) : lastOrderPlaced && (
          <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white/80 backdrop-blur-lg border-t border-gray-100 flex justify-center">
            <button
              onClick={() => router.push("/orders")}
              className="w-full max-w-md bg-green-600 text-white py-4 rounded-2xl font-bold shadow-xl flex items-center justify-center gap-3 hover:bg-green-700 transition-all active:scale-95 shadow-green-100"
            >
              <FaShoppingBag />
              <span>Go to My Orders</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
