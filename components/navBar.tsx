"use client"

import Link from "next/link";
import { useCallback, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/hooks/use-store";
import { useAuth } from "@/hooks/use-auth";
import { getStoreByUserId } from "@/lib/api/stores";

export default function NavBar() {
  const router = useRouter();
  const { store } = useStore();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [role, setRole] = useState<"buyer" | "seller">("buyer");
  const isSeller = role === "seller";
  const profileRef = useRef<HTMLDivElement>(null);
  const { setStore } = useStore();
  
  // Enable auto-logout monitoring
  useAuth();

  const refreshAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      setIsLoggedIn(Boolean(token));
      const raw = localStorage.getItem("user");
      
      if (raw && token) {
        try {
          const u = JSON.parse(raw);
          setUserData(u);
          setUserName(u?.userName || u?.name || null);

          // Proactively fetch store if missing
          if (u._id && !localStorage.getItem("store")) {
            const backendStore = await getStoreByUserId(u._id, token);
            if (backendStore) {
              setStore(backendStore);
            }
          }
        } catch (e) {
          setUserData(null);
          setUserName(null);
        }
      } else {
        setUserData(null);
        setUserName(null);
      }
      const storedRole = localStorage.getItem("role");
      setRole(storedRole === "seller" ? "seller" : "buyer");
    } catch (e) {
      setIsLoggedIn(false);
      setUserName(null);
      setRole("buyer");
    }
  }, [setStore]);

  useEffect(() => {
    refreshAuth();
    const onAuthChange = () => refreshAuth();
    const onStorage = (e: StorageEvent) => {
      if (e.key === "token" || e.key === "user" || e.key === "role" || e.key === "store") refreshAuth();
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    window.addEventListener("authChange", onAuthChange as EventListener);
    window.addEventListener("storage", onStorage as EventListener);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("authChange", onAuthChange as EventListener);
      window.removeEventListener("storage", onStorage as EventListener);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [refreshAuth]);

  const handleLogout = () => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("store");
      localStorage.removeItem("role");
      setIsProfileOpen(false);
      setUserData(null);
      window.dispatchEvent(new Event("authChange"));
    } catch (e) {}
    router.push("/");
  };

  const toggleRole = () => {
    const newRole = role === "buyer" ? "seller" : "buyer";
    setRole(newRole);
    try {
      localStorage.setItem("role", newRole);
    } catch (e) {}
    window.dispatchEvent(new Event("authChange"));
    
    // Redirect based on the new role
    if (newRole === "buyer") {
      router.push("/products");
    } else {
      if (store) {
        router.push("/dasboard/my-store");
      } else {
        router.push("/dasboard");
      }
    }
  };

  return (
    <header style={{
      position: "sticky",
      top: 0,
      zIndex: 50,
      backdropFilter: "saturate(180%) blur(6px)",
      WebkitBackdropFilter: "saturate(180%) blur(6px)",
      background: "rgba(220,210,255,0.75)",
      borderBottom: "1px solid rgba(2,6,23,0.06)"
    }}>
      <nav style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: "0.6rem 1rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none", color: '#000' }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            background: "#2563eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontWeight: 800
          }}>HM</div>

          <div style={{ fontWeight: 700 }}>
            Hostel Mart ~ KIIT Edition
          </div>
        </Link>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {!isLoggedIn ? (
            <>
              <Link href="/login" style={{
                padding: "8px 14px",
                borderRadius: 8,
                color: "#2563eb",
                textDecoration: "none",
                border: "1px solid rgba(37,99,235,0.12)",
                background: "transparent",
                fontWeight: 600
              }}>Login</Link>
              <Link href="/register" style={{
                padding: "8px 14px",
                borderRadius: 8,
                color: "#fff",
                textDecoration: "none",
                background: "#2563eb",
                fontWeight: 600
              }}>Register</Link>
            </>
          ) : (
            <>
              <div style={{ position: 'relative' }} ref={profileRef}>
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  style={{
                    padding: "6px 12px", 
                    borderRadius: 8, 
                    background: "#f3f4f6", 
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    color: '#374151',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <div style={{width: 8, height: 8, borderRadius: '50%', background: '#10b981'}} />
                  {userName ?? 'Account'}
                </button>

                {isProfileOpen && (
                  <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: 240,
                    background: '#ffffff',
                    borderRadius: 12,
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                    border: '1px solid rgba(0,0,0,0.05)',
                    padding: '12px',
                    zIndex: 100,
                    textAlign: 'left'
                  }}>
                    <div style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #f3f4f6' }}>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>User Details</p>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280' }}>Username</p>
                        <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: '#111827' }}>{userData?.userName || userData?.name || 'N/A'}</p>
                      </div>
                      
                      <div>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280' }}>KIIT Mail ID</p>
                        <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: '#111827' }}>{userData?.kiitMailId || 'N/A'}</p>
                      </div>
                      
                      <div>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280' }}>Store Name</p>
                        <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: '#111827' }}>{store?.name || 'None'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <label onClick={toggleRole} style={{display:'inline-flex', alignItems:'center', gap:8, cursor:'pointer', userSelect:'none'}}>
                <div style={{
                  width: 52,
                  height: 28,
                  borderRadius: 999,
                  background: isSeller ? '#10b981' : '#e5e7eb',
                  padding: 4,
                  display: 'flex',
                  alignItems: 'center',
                  boxSizing: 'border-box',
                  transition: 'background 150ms'
                }}>
                  <div style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: '#fff',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                    transform: isSeller ? 'translateX(24px)' : 'translateX(0px)',
                    transition: 'transform 150ms'
                  }} />
                </div>
                <span style={{fontWeight:600}}>{isSeller ? 'Seller' : 'Buyer'}</span>
              </label>
              <button onClick={handleLogout} style={{padding: "8px 14px", borderRadius: 8, background: "#ef4444", color: "#fff", fontWeight:600}}>
                Logout
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
