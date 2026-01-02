import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {z} from "zod";
import connectDB from "../mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
const regexpEmail= /^[a-zA-Z0-9._%+-]+@kiit.ac.in$/;
const reqSchema=z.object({
    userName:z.string(),  
    kiitMailId:z.email().regex(regexpEmail,"Login using KIIT Mail ID"),
    password:z.string().min(6,"Password must be at least 6 characters long"),
    confirmPassword:  z.string().min(6,"Password must be at least 6 characters long")
});
export  async function POST(req:NextRequest)
{
   try
   {
   await connectDB();
   const body=await req.json();
   const parsedBody=reqSchema.safeParse(body);
   if(!parsedBody.success) 
   {
    console.log();
    return NextResponse.json({
        message:"Invalid Request Data"},{status:400});
   }

   const { userName, kiitMailId, password, confirmPassword } =parsedBody.data ;
   if(password!=confirmPassword)
   return NextResponse.json({message:"Passwords do not match"},{status:400});

   const user=await User.findOne({kiitMailId});
   if(user) 
    return NextResponse.json({message:"User Already Exists"},{status:400});

   const hashedPassword=await bcrypt.hash(password,11);
   const newUser=new User({
   userName,
    kiitMailId,
    password:hashedPassword
   });
    await newUser.save();

    return NextResponse.json({message:"User registered Successfully"},{status:201
    });
    }
    catch(error)
    {
      // console.error(error);
      return NextResponse.json({error:"Internal Server Error"
      },{status:500});
    }
}

