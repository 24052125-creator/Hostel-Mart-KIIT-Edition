import React from "react";
import { Sidebar } from "@/components/Sidebar";

export default function MyStoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 transition-all duration-300 ease-in-out">
        {children}
      </main>
    </div>
  );
}
