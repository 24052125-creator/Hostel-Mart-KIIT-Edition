"use client"
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useStore } from "@/hooks/use-store";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  const { store } = useStore();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("token"));
    
    const checkAuth = () => setIsLoggedIn(!!localStorage.getItem("token"));
    window.addEventListener("authChange", checkAuth);
    return () => window.removeEventListener("authChange", checkAuth);
  }, []);

  const handleCreateStore = (e: React.MouseEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (isLoggedIn && store && token && user) {
      router.push("/dasboard/my-store");
      return;
    }

    if (!token || !user) {
      toast.error("To create a store you must login first");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } else {
      router.push("/dasboard");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-8 bg-[#f8fafc] relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-100 rounded-full blur-[100px] opacity-60" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-100 rounded-full blur-[100px] opacity-60" />
      </div>

      <div className="w-full max-w-2xl relative z-10">
        <div className="bg-white/80 backdrop-blur-2xl rounded-[3rem] p-12 md:p-16 shadow-[0_20px_50px_rgba(30,58,138,0.05)] border border-white text-center">
          <div className="inline-block px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-sm font-bold mb-6 animate-in slide-in-from-top-4 duration-700">
            KIIT Edition
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight leading-tight uppercase italic">
            Hostel <span className="text-indigo-600">Mart</span>
          </h1>

          <p className="text-gray-500 text-lg md:text-xl font-medium mb-12 max-w-lg mx-auto leading-relaxed">
            Your personal campus marketplace.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {!isLoggedIn ? (
              <button
                onClick={() => router.push("/register")}
                className="group relative flex items-center justify-center px-10 py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200 hover:scale-105 active:scale-95 overflow-hidden"
              >
                <span className="relative z-10">Get Started</span>
                <div className="absolute inset-0 bg-linear-to-r from-indigo-400 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => router.push("/products")}
                  className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95 grow"
                >
                  Browse Products
                </button>
                <button
                  onClick={handleCreateStore}
                  className="px-8 py-4 bg-white text-indigo-600 border-2 border-indigo-50 rounded-2xl font-bold hover:bg-indigo-50 transition-all active:scale-95 grow"
                >
                  {(isLoggedIn && store) ? "Visit Your Store" : "Create Store"}
                </button>
              </>
            )}
          </div>

          <div className="mt-12 flex items-center justify-center gap-8 opacity-40">
            {/* Minimal footer or social indicators if needed */}
          </div>
        </div>
      </div>
    </main>
  );
}

