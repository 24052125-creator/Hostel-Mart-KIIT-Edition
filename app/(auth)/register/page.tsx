"use client"
import React, { useState } from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm , SubmitHandler } from "react-hook-form"
import { z } from "zod"
import Link from 'next/link'
import { useDebounceValue } from 'usehooks-ts'
import { toast } from "sonner"
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import axios, {AxiosError} from "axios"
import { Form } from '@/components/ui/form'
import { FormField , FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2 } from "lucide-react"
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
const regexpEmail= /^[a-zA-Z0-9._%+-]+@kiit.ac.in$/;
const registerSchema=z.object({
  userName:z.string(),  
      kiitMailId:z.email().regex(regexpEmail,"Login using KIIT Mail ID"),
      password:z.string().min(6,"Password must be at least 6 characters long"),
      confirmPassword:  z.string().min(6,"Password must be at least 6 characters long")
});
const page = () => {
   
    const [isSubmitting, setIsSubmitting]=useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const router=useRouter();
    // zod implementation
    const form=useForm<z.infer<typeof registerSchema>>({
        resolver:zodResolver(registerSchema),
        defaultValues:
        {
            userName:'',
            kiitMailId:'',
            password:'',
            confirmPassword:''
        },
         mode: "onTouched"
       
    })
     const onSubmit= async (data: z.infer<typeof registerSchema>) =>
     {
       setIsSubmitting(true);
       try
       {
         const response = await axios.post("/api/register",data);
         toast.success("Registered Successfully! Please Login.");
         router.push("/login");

       }
       catch (error) {
        console.error("Error during registration:", error);
        if (axios.isAxiosError(error)) {
          const msg = (error.response?.data as { message?: string ; error?: string;} | undefined)?.message;
          toast.error(typeof msg === 'string' ? msg : "Registration failed. Please try again.");
        } else {
          toast.error("Registration failed. Please try again.");
        }
       }
       finally
       {
         setIsSubmitting(false);
       }
     }
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100
    "><div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold  tracking-tight lg:text-5xl mb-6">
          Register
        </h1>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
          <FormField
            control={form.control}
            name="userName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-blue-700 font-bold ">Username : </FormLabel>
                <br />
                <FormControl>
                  <Input  className="w-full px-1 py-1 border border-gray-300 rounded-lg focus:outline-blue-200 focus:ring-2 focus:ring-blue-400 bg-white/95 text-gray-900 placeholder-gray-500 pr-12"
                    placeholder="userName"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-yellow-500 font-medium" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="kiitMailId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-blue-700  font-bold ">KIIT Mail ID : </FormLabel>
                <br />
                <FormControl >
                  <Input className="w-full px-1 py-1 border border-gray-300 rounded-lg focus:outline-blue-200 focus:ring-2 focus:ring-blue-400 bg-white/95 text-gray-900 placeholder-gray-500 pr-12" placeholder="rollNo@kiit.ac.in" {...field} />
                </FormControl>
                <FormMessage className="text-yellow-500 font-medium" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-blue-700  font-bold ">Password :</FormLabel>
                <br />
                <FormControl>
                  <div className="relative">
                    <Input 
                      className="w-full px-1 py-1 border border-gray-300 rounded-lg focus:outline-blue-200 focus:ring-2 focus:ring-blue-400 bg-white/95 text-gray-900 placeholder-gray-500 pr-12" 
                      type={showPassword ? 'text' : 'password'} 
                      placeholder="******" 
                      {...field} 
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-indigo-600 transition-colors"
                    >
                      {showPassword ? <FaRegEyeSlash size={20} /> : <FaRegEye size={20} />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage className="text-yellow-500 font-medium" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-blue-700 font-bold ">Confirm Password :</FormLabel>
                <br />
                <FormControl>
                  <div className="relative">
                    <Input 
                      className="w-full px-1 py-1 border border-gray-300 rounded-lg focus:outline-blue-200 focus:ring-2 focus:ring-blue-400 bg-white/95 text-gray-900 placeholder-gray-500 pr-12"   
                      type={showConfirmPassword ? 'text' : 'password'} 
                      placeholder="******" 
                      {...field} 
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-indigo-600 transition-colors"
                    >
                      {showConfirmPassword ? <FaRegEyeSlash size={20} /> : <FaRegEye size={20} />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage className="text-yellow-500 font-medium" />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isSubmitting} className='bg-black text-white hover:bg-gray-800 w-full'>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please Wait
              </>
            ) : (
              "Register"
            )}
          </Button>
        </form>
      </Form>
      <div className="text-center mt-4">
        <p>
          Already a Member?{' '}
          <Link href="/login" className="text-blue-600  hover:text-blue-800">Login</Link>
        </p>

      </div>
      </div></div>
  )
}

export default page