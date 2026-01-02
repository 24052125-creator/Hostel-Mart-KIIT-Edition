import mongoose from "mongoose";
export default async function connectDB()
{
    
    try{
        if(!process.env.DB) throw new Error("DB connection string not found");
        await mongoose.connect(process.env.DB);
            console.log("MongoDB connected.....");
        }
        catch(error)
        {
            console.error(error);
            throw new Error("DB Connection Failed");
        }
        finally{
            console.log("DB process finished");
        }
};