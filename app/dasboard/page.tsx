"use client";

import { useRouter } from "next/navigation";
import React, { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { useStore } from "@/hooks/use-store";
import { getStoreByUserId } from "@/lib/api/stores";
// import FileUpload from "@/components/fileUpload";
// import { IKUploadResponse } from "imagekitio-next/dist/types/components/IKUpload/props";


export default function Dasboard() {
  const [username, setUsername] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");
  const [storeImage, setStoreImage] = useState<string>("");
  const router = useRouter();
  const { store, setStore, removeStore } = useStore();

  useEffect(() => {
    const validateStore = async () => {
      try {
        const raw = localStorage.getItem("user");
        const token = localStorage.getItem("token");
        
        if (raw && token) {
          const u = JSON.parse(raw);
          setUsername(u?.name || u?.userName || u?.username || null);
          
          if (u._id) {
            const backendStore = await getStoreByUserId(u._id, token);
            
            if (backendStore) {
              setStore(backendStore);
              toast.success("You already have a store! Redirecting to your store...");
              setTimeout(() => {
                router.push("/dasboard/my-store");
              }, 2000);
            } else {
              if (store) {
                console.log("Store not found in backend, clearing localStorage");
                removeStore();
                toast.error("Your store was not found in the system");
              }
            }
          }
        }
      } catch (e) {
        setUsername(null);
      }
    };

    validateStore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateStoreButton = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsCreating(true);
    const formData = new FormData(e.currentTarget);
    try {
      const token = localStorage.getItem("token");
      const ownerRaw = localStorage.getItem("user");
      const owner = ownerRaw ? JSON.parse(ownerRaw) : null;
      if (!token || !owner) {
        toast.error("To create a store you must login first");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
        return;
      }

      const formDataObj = Object.fromEntries(formData.entries());

      const storeDetails = {
        ...formDataObj,
        userId: owner._id,
        image: storeImage,
      };
      
      const response = await fetch("/api/createStore", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(storeDetails),
      });
      const data = await response.json();
      
      if (response.ok) {
        setStore(data.store || data);
        toast.success("Store created successfully!");
        router.push("/dasboard/my-store");
      } else {
        setError(data.message || "Failed to create store.");
        toast.error(data.message || "Failed to create store.");
      }
    } catch (error: any) {
      console.error("Error creating store:", error);
      setError(error.message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <p className="text-center font-extrabold text-3xl text-red-400 bg-blue-100 my-8 drop-shadow-sm">
        Hello {username ?? "Guest"}!
      </p>
      <h4 className="text-center bg-amber-100 font-medium">
        Welcome to Hostel Mart! Create your own store
      </h4>
      <form
        onSubmit={handleCreateStoreButton}
        className="space-y-5 text-center my-8"
      >
        <label className="text-center font-serif">
          <h1>Enter Store Details:</h1>
        </label>
        <section className="w-full max-w-lg mx-auto bg-white/70 rounded-lg p-6 shadow-md flex flex-col items-center gap-4">
          <div className="w-full">
            <input
            name="name"
              className="w-full bg-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              type="text"
              placeholder="Store Name"
            />
          </div>
          <div className="w-full">
            <input
            name="hostel"
              className="w-full bg-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              type="text"
              placeholder="Hostel"
            />
          </div>
          <div className="w-full">
            <input
            name="floor"
              className="w-full bg-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              type="text"
              placeholder="Floor"
            />
          </div>
          
          {error && <div>
            <p className="text-red-500 text-sm">{error}</p>
            </div>}
          <div className="w-full text-center">
            <button
              type="submit"
              disabled={isCreating}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
            >
             {isCreating ? "Creating Store..." : "Create Store"}
            </button>
          </div>
        </section>
      </form>
    </>
  );
}
