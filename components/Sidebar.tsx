"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaStore, FaBoxOpen, FaClipboardList, FaCog, FaChartPie, FaSignOutAlt, FaCommentDots } from "react-icons/fa";

const menuItems = [
  { name: "My-Products", icon:FaBoxOpen, href: "/dasboard/my-store" },
  { name: "Active-Orders", icon: FaClipboardList, href: "/dasboard/my-store/orders" },
  { name: "ChatBox", icon: FaCommentDots, href: "/dasboard/my-store/chatbox" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0 left-0 overflow-y-auto font-sans shadow-lg z-10 transition-all duration-300 ease-in-out">
      {/* Header / Logo Area */}
      <div className="p-6 border-b border-gray-100 flex items-center justify-center">
        <div className="flex items-center gap-3 text-indigo-600">
           <FaStore className="text-3xl" />
           <span className="text-2xl font-extrabold tracking-tight">Store-Menu</span>
        </div>
      </div>
      {/* Navigation Links */}
      <nav className="flex-1 py-6 px-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                    : "text-gray-500 hover:bg-indigo-50 hover:text-indigo-600"
                }
              `}
            >
              <item.icon className={`text-lg ${isActive ? "text-white" : "text-gray-400 group-hover:text-indigo-600 transition-colors"}`} />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
