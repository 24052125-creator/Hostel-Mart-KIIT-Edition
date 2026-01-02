"use client";

import React, { useRef, useState } from "react";
import { IKContext, IKUpload } from "imagekitio-react";
import { FaCloudUploadAlt, FaSpinner } from "react-icons/fa";
import { toast } from "sonner";

interface FileUploadProps {
  onSuccess: (url: string) => void;
}

export default function FileUpload({ onSuccess }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  const onError = (err: any) => {
    console.error("ImageKit Upload Error:", err);
    toast.error("Failed to upload image.");
    setUploading(false);
  };

  const onSuccessHandler = (res: any) => {
    console.log("ImageKit Upload Full Response:", res);
    setUploading(false);
    if (res.url) {
      console.log("Calling onSuccess with URL:", res.url);
      onSuccess(res.url);
      toast.success("Image uploaded successfully!");
    } else {
      console.error("No URL found in response");
      toast.error("Upload failed: No URL received");
    }
  };

  const onUploadStart = () => {
    setUploading(true);
  };

  // Helper to trigger the hidden File Input
  const triggerUpload = () => {
    if (uploadInputRef.current) {
      uploadInputRef.current.click();
    }
  };

  const publicKey = process.env.NEXT_PUBLIC_PUBLIC_KEY;
  const urlEndpoint = process.env.NEXT_PUBLIC_URL_ENDPOINT;

  if (!publicKey || !urlEndpoint) {
    const missing = [];
    if (!publicKey) missing.push("NEXT_PUBLIC_PUBLIC_KEY");
    if (!urlEndpoint) missing.push("NEXT_PUBLIC_URL_ENDPOINT");
    
    console.error("Missing ImageKit environment variables:", missing.join(", "));
    return (
        <div className="text-red-500 p-4 border border-red-200 rounded-xl bg-red-50 text-sm">
            <strong>Configuration Error:</strong><br/>
            Missing values in .env for: {missing.join(", ")}
        </div>
    );
  }

  return (
    <IKContext
      publicKey={publicKey.trim()}
      urlEndpoint={urlEndpoint.trim()}
      authenticator={async () => {
        try {
          const response = await fetch("/api/imagekit-auth");
          if (!response.ok) {
            throw new Error(`Authentication request failed: ${response.statusText}`);
          }
          const data = await response.json();
          return data;
        } catch (error) {
          throw new Error(`Authentication failed: ${error}`);
        }
      }}
    >
      <div className="w-full">
         {/* Hidden IKUpload Component */}
        <IKUpload
          fileName="product-image.jpg"
          onError={onError}
          onSuccess={onSuccessHandler}
          onUploadStart={onUploadStart}
          style={{ display: "none" }}
          ref={uploadInputRef}
          validateFile={(file) => file.size < 5 * 1024 * 1024} // 5MB limit
        />
        
        <button
          type="button"
          onClick={triggerUpload}
          disabled={uploading}
          className="w-full h-32 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? (
             <>
                <FaSpinner className="animate-spin text-2xl mb-2 text-indigo-500" />
                <span className="text-sm font-medium text-gray-500">Uploading...</span>
             </>
          ) : (
             <>
                <FaCloudUploadAlt className="text-3xl mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">Click to Upload Image</span>
             </>
          )}
        </button>
      </div>
    </IKContext>
  );
}
