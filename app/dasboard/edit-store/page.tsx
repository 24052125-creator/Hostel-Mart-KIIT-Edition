"use client";

import { useRouter } from "next/navigation";
import React, { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { useStore } from "@/hooks/use-store";
import { updateStore, deleteStore } from "@/lib/api/stores";

export default function EditStore() {
  const { store, setStore, removeStore } = useStore();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !store) {
      router.push("/dasboard");
    }
  }, [store, router]);

  const handleUpdateStore = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUpdating(true);
    setError("");
    
    const formData = new FormData(e.currentTarget);
    const updates = Object.fromEntries(formData.entries());

    try {
      const token = localStorage.getItem("token");
      if (!token || !store?._id) {
        toast.error("Authentication required");
        return;
      }

      const updatedStore = await updateStore(store._id, updates as any, token);
      setStore(updatedStore);
      toast.success("Store details updated successfully!");
      router.push("/dasboard/my-store");
    } catch (err: any) {
      console.error("Error updating store:", err);
      setError(err.message || "Failed to update store");
      toast.error(err.message || "Failed to update store");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteStore = async () => {
    if (!confirm("Are you sure you want to PERMANENTLY delete your store? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    try {
      const token = localStorage.getItem("token");
      if (!token || !store?._id) {
        toast.error("Authentication required");
        return;
      }

      await deleteStore(store._id, token);
      removeStore();
      toast.success("Store deleted permanently.");
      router.push("/dasboard");
    } catch (err: any) {
      console.error("Error deleting store:", err);
      toast.error(err.message || "Failed to delete store");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!store) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Edit Store Details</h1>
          <p className="text-gray-600">Update your store information or manage settings</p>
        </header>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          <form onSubmit={handleUpdateStore} className="p-8 space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Store Name</label>
                <input
                  name="name"
                  defaultValue={store.name}
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  type="text"
                  placeholder="e.g. Snack Shack"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Hostel</label>
                  <input
                    name="hostel"
                    defaultValue={store.hostel}
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    type="text"
                    placeholder="e.g. KP-7"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Floor</label>
                  <input
                    name="floor"
                    defaultValue={store.floor}
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    type="text"
                    placeholder="e.g. 3rd Floor"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100">
                {error}
              </div>
            )}

            <div className="pt-4 flex flex-col gap-3">
              <button
                type="submit"
                disabled={isUpdating || isDeleting}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 active:scale-95"
              >
                {isUpdating ? "Saving Changes..." : "Save Changes"}
              </button>
              
              <button
                type="button"
                onClick={() => router.back()}
                className="w-full py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-all active:scale-95"
              >
                Cancel
              </button>
            </div>
          </form>

          <div className="bg-red-50/50 p-8 border-t border-red-100">
            <h3 className="text-red-800 font-bold mb-2">Danger Zone</h3>
            <p className="text-red-600 text-sm mb-6">
              Once you delete your store, all your products will still exist in the database but your store profile will be removed. This action cannot be undone.
            </p>
            <button
              onClick={handleDeleteStore}
              disabled={isUpdating || isDeleting}
              className="w-full py-4 border-2 border-red-200 text-red-600 rounded-2xl font-bold hover:bg-red-600 hover:text-white hover:border-red-600 transition-all disabled:opacity-50 active:scale-95"
            >
              {isDeleting ? "Deleting Store..." : "Delete Store Permanently"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
