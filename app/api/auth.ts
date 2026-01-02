import jwt from "jsonwebtoken"
import { NextResponse } from "next/server";
interface DecodedToken {
  id: string;
  name: string;
  email: string;
  iat: number;
  exp: number;
}
export default async function decodeToken (token:string)
{
    if(!token || !process.env.SECRET_KEY) return null;
    const decoded=jwt.verify(token,process.env.SECRET_KEY) as DecodedToken;
    if(!decoded)
      {
        console.log(decoded);
       return null;
      }  
    return decoded;
};