import mongoose from "mongoose";
const storeSchema = new mongoose.Schema(
   {
      name: {
         type: String,
         required: true
      },
      hostel: {
         type: String,
         required: true
      },
      floor: {
         type: String,
         required: true
      },
      userId:
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User",
         required: true
      },
      image: {
         type: String,
         required: false
      }
   });
export default mongoose.models.Store || mongoose.model("Store", storeSchema);