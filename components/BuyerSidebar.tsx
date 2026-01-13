"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaShoppingBag, FaCommentDots, FaTimes, FaShoppingCart } from "react-icons/fa";
import { useState } from "react";

const menuItems = [
  { name: "My Cart", icon: FaShoppingCart, href: "/cart" },
  { name: "My Orders", icon: FaShoppingBag, href: "/orders" },
  { name: "Chatbox", icon: FaCommentDots, href: "/chats", disabled: false },
];

interface BuyerSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BuyerSidebar({ isOpen, onClose }: BuyerSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col overflow-y-auto font-sans shadow-lg z-50 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3 text-indigo-600">
            <FaShoppingBag className="text-2xl" />
            <span className="text-xl font-extrabold tracking-tight">Quick Menu</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 py-6 px-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const isDisabled = item.disabled;

            return (
              <div key={item.href} className="relative">
                {isDisabled ? (
                  <div
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 cursor-not-allowed opacity-50"
                    title="Coming soon"
                  >
                    <item.icon className="text-lg" />
                    <span className="font-medium">{item.name}</span>
                    <span className="ml-auto text-xs bg-gray-100 text-gray-400 px-2 py-1 rounded-full">
                      Soon
                    </span>
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                      ${
                        isActive
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                          : "text-gray-500 hover:bg-indigo-50 hover:text-indigo-600"
                      }
                    `}
                  >
                    <item.icon
                      className={`text-lg ${
                        isActive
                          ? "text-white"
                          : "text-gray-400 group-hover:text-indigo-600 transition-colors"
                      }`}
                    />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer Info */}
        <div className="p-4 border-t border-gray-100">
          <div className="bg-indigo-50 rounded-xl p-4">
            <p className="text-xs text-indigo-600 font-medium">
              💡 Quick access to your orders and messages
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
