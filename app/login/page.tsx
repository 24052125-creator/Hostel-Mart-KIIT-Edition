"use client"
import React, { useState, useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { toast } from "sonner";
import axios, {AxiosError} from "axios"
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
const loginSchema = z.object({
  userName: z.string().nonempty("Enter your username"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginData = z.infer<typeof loginSchema>;
export default function LoginPage() {
  const [isSubmitting, setIsSubmitting]=useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
    const router=useRouter();
    useRedirectIfAuthenticated(router);
     // zod implementation
     const form=useForm<z.infer<typeof loginSchema>>({
         resolver:zodResolver(loginSchema),
         defaultValues:
         {
             userName:'',
             password:'',
         },
        mode: "onTouched"
     })
     const { register, handleSubmit, formState: { errors } } = form;
      const onSubmit= async (data: z.infer<typeof loginSchema>) =>
      {
        setServerError(null);
        setIsSubmitting(true);
        try
        {
          const response = await axios.post("/api/login",data);
          console.log("Login response:", response);
          if(response.status===200)
          {
              const token = response.data?.token;
              const user = response.data?.user;
              console.log("User:", user);
              try {
                if (token) localStorage.setItem("token", token);
                if (user) localStorage.setItem("user", JSON.stringify(user));
                if (!localStorage.getItem("role")) localStorage.setItem("role", "buyer");
                window.dispatchEvent(new Event("authChange"));
              } catch (e) {
                console.warn("Could not persist auth to localStorage", e);
              }
              toast.success("Logged in Successfully!");
              // attention! code changed below
               router.push("/");
          }
        }
        catch (error: any) {
         if (axios.isAxiosError(error) && error.response) {
           // Handle known server errors (400, 401, etc.)
           const msg = (error.response?.data as { message?: string; error?: string } | undefined)?.message;
           const message = typeof msg === 'string' ? msg : "Login failed. Please check your credentials.";
           setServerError(message);
           toast.error(message);
           
           // Only log full error if it's NOT a 400 (validation/auth error)
           if (error.response.status !== 400 && error.response.status !== 401) {
             console.error("Login Error:", error);
           } else {
             console.warn("Login Failed:", message);
           }
         } else {
           // Network or unknown errors
           console.error("Unexpected Login Error:", error);
           setServerError("An unexpected error occurred. Please try again.");
           toast.error("An unexpected error occurred.");
         }
        }
        finally
        {
          setIsSubmitting(false);
        }
      }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white border rounded-lg shadow-md p-8">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Welcome back</h1>
          <p className="text-sm text-gray-600">Sign in with your username and password.</p>
        </header>

        {serverError && (
          <div className="mb-4 text-sm text-red-700 bg-red-100 p-2 rounded">{serverError}</div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              {...register("userName")}
              className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.userName ? "border-red-400" : "border-gray-200"}`}
              placeholder="Enter username"      
            />
            {errors.userName && (
              <p className="mt-1 text-xs text-red-600">{errors.userName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                className={`w-full px-3 py-2 pr-12 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.password ? "border-red-400" : "border-gray-200"}`}
                placeholder="Your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-indigo-600 transition-colors"
              >
                {showPassword ? <FaRegEyeSlash size={20} /> : <FaRegEye size={20} />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <p>
                Don't have an account?{' '} <Link href="/register" className="text-blue-600 hover:text-blue-800">Create one</Link>
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

// redirect logic: if token present, send user to dashboard
// keep small and client-only
function useRedirectIfAuthenticated(router: any) {
  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      if (token) router.push("/");
    } catch (e) {}
  }, [router]);
}
