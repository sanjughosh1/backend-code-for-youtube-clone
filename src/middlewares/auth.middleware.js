import { ApiError } from "../utils/apiError.js";
import { asyncHandalar } from "../utils/asyncHandaler.js";
import  jwt  from "jsonwebtoken"
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandalar(async( req ,res ,next )=>{

  try {
    const token = req.cookies?.accesToken || req.header("Authorization")?.replace("Bearer ", "")

      if (!token) {
          throw new ApiError(401,"Unauthorized ruquest")
          
      }
  
      const decodeToken = jwt.verify(token , process.env.ACCES_TOKEN_SECRATE)
  
      const user = await User.findById(decodeToken?._id).select("-passwore -refreshToken")
  
      if(!user){
          throw new ApiError(401,"Invaled acces Token")
      }
      
      req.user = user
      next()
  } catch (error) {
    throw new ApiError(401,error?.message || "Invaled acces Token")

  }

})