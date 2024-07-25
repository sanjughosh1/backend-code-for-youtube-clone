import { asyncHandalar } from "../utils/asyncHandaler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { UplodeOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponce } from "../utils/ApiResponce.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";


const genarateAccesAndRefereshToken = async(userId) =>{
    try {
           const user = await User.findById(userId) //find user

            const AccessToken = user.genarateAccesToken()//genetate token
            const RefereshToken = user.genarateRefreshToken()//genarate token

            user.refreshToken = RefereshToken
            await user.save({ validateBeforeSave: false }) //save in database;

            return {AccessToken,RefereshToken}

    } catch (error) {
        throw new ApiError(500 , "sumthing want wrong while genarating access and referesh token")
    }
}


const registerUser = asyncHandalar(async (req , res)=>{
    // res.status(200).json({
    //     massage: "ok"
    // })


    //**********   staps to register a user   **************

    //(1) get user detalce from frantend
    //(2) validation - not emty
    //(3) chack user allrady exisist : username , email
    //(4) chack for images,chack for avter
    //(5) uplode them to cloudinary, avter
    //(6) create user object, create entry in db 
    //(7) remove password and refrace token field form responce
    //(8) cheak for user creation
    //(9) return responce



    const {fullname,email,username,password} = req.body

    //  if (fullname==="") {
    //     throw new ApiError(400,"full name is Require")
    // }


    if (
        [fullname,email,username,password].some((field) =>field?.trim()  === "" )
        ) {
           throw new ApiError(400,"full name is Require")
    }

    ///
    const existedUser = await User.findOne({
      $or:[{ username },{ email }]
    })
    
    if (existedUser) {
        throw new ApiError(409 , "username and email allrady existe")
    }

    ///
    const avatarLocalPath = req.files?.avatar[0]?.path;
    //const converImagesLocalPath = req.files?.coverImage[0]?.path;

    let converImagesLocalPath ;
    if (req.files && 
        Array.isArray(req.files.coverImage) && 
        req.files.coverImage.length > 0) {
            converImagesLocalPath = req.files.coverImage[0].path
        
    }

    if (!avatarLocalPath) {
        throw new ApiError(400 , "Avater file is require")
    }


    ///

    const avatar = await UplodeOnCloudinary(avatarLocalPath)
    const coverImages = await UplodeOnCloudinary(converImagesLocalPath)

    if (!avatar) {
        throw new ApiError(400 , "Avater file is a require")
    }

    ///

    const user = await User.create({
        fullname,
        avatar : avatar.url,
        coverImage : coverImages?.url  || "",
        email,
        password,
        username : username.toLowerCase()
    })

    ///
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    ///8
    if (!createdUser) {
        throw new ApiError(500 , "Soumthing want wrong while registering the user")
        
    }


    return res.status(201).json(
        new ApiResponce(200, createdUser,"user register succesfully")
    )


})

const loginUser = asyncHandalar (async ( req, res ) => {

    // (1) req body --> data
    // (1) username or email  based authintication
    // (1) find the user
    // (1) password chack
    // (1) acces token and ref token send to user
    // (1) send cookes



    const { email ,username ,password} = req.body
    ///
    if (!username && !email){
        throw new ApiError(400 , "user name or email is Required")
    }

    ///
    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) {
        throw new ApiError(404 , "user does not exist")
        
    }
    const isPasswordValue = await user.isPasswordCurrect(password)

    if (!isPasswordValue) {
        throw new ApiError(401 , "invalade users credentials")        
    }


    const {AccessToken,RefereshToken} = await genarateAccesAndRefereshToken(user._id)

    const logdinUser = await User.findById(user._id).select("-password -refreshToken")

    const option = {
        httpOnly : true,
        secure : true
    }

    return res
    .status(200)
    .cookie("accesToken ", AccessToken, option)
    .cookie("refereshToken ", RefereshToken, option)
    .json(
        new ApiResponce(
            200,
            {
                user:logdinUser,AccessToken,RefereshToken
            },
            "user logged in succesfully"
        )
    )


})

const logoutUser = asyncHandalar(async( req, res )=>{

    await User.findByIdAndUpdate(
        req.user._id,
        {
            // $set:{
            //     RefereshToken:undefined
            // }
            $unset:{
                RefereshToken: 1 //this remove the field from documant
            }
        },
        {
            new:true
        }
    )
    const option = {
        httpOnly : true,
        secure : true
    }

    return res.status(200)
    .clearCookie("accesToken",option)
    .clearCookie("refereshToken",option)
    .json(new ApiResponce(200,{}, "User logout"))
})

const RefereshAccesToken  = asyncHandalar(async ( req, res ) => {


   const incomingRefereshToken = req.cookies.refereshToken || req.body.refereshToken

   console.log(incomingRefereshToken);

   if (!incomingRefereshToken) {
        throw new ApiError(401 , "Unauthorized request")
   }

   try {
    const dcodedToken = jwt.verify(incomingRefereshToken,process.env.REFRESH_TOKEN_SECRET)
 
    const user = await User.findById(dcodedToken?._id)

    
    console.log(user);
 
     if (!user) {
         throw new ApiError(401 , "invaled refresh token")
     }
     console.log(user?.refreshToken);
     
     if (incomingRefereshToken !== user?.refreshToken ) {
         throw new ApiError(401,"Refrase token is Expired or used")
     }
 
     const option = {
         httpOnly: true,
         secure : true,
     }
 
     const {AccessToken,newRefereshToken} = await genarateAccesAndRefereshToken(user._id)

     console.log(newRefereshToken);
 
     return res
     .status(200)
     .cookie("AccessToken",AccessToken,option)
     .cookie("ReferashToken",newRefereshToken,option)
     .json(
         new ApiResponce(
             200,
             {AccessToken,RefereshToken:newRefereshToken},
             "Acces token Refresh Succesfully"
         )
     )
   } catch (error) {

    throw new ApiError(401,error?.message || "Invaled Refresh Token")
    
   }


})

const changeCurrentPassword = asyncHandalar(async ( req , res )=> {
    try {
        const {oldPassword,newPassword} = req.body
        
    
       const user = await User.findById(req.user?._id)
    
      const isPasswordCurrect = user.isPasswordCurrect(oldPassword)
    
      if (!isPasswordCurrect) {
            throw new ApiError(400 ,"Invaled Old Password")
      }
    
      
      user.password = newPassword
      user.save({ validateBeforeSave: false })
    

  return res
  .status(200)
  .json(
    new ApiResponce(
        200,{
            user
        },"Password Changed"
    )
  )
} catch (error) {
    throw new ApiError(500 ," sunthing want while changing the password try agen later")
}
})

const getCurrentUser = asyncHandalar (async( req, res )=> {
    return res
    .status(200)
    .json(
        200,
        req.user ,"Current User Fetched Succesfully"
    )

})

const updateAccountDetales = asyncHandalar(async ( req, res )=> {

    const {fullname, email} = req.body

    if (!fullname || !email) {
        throw new ApiError(400,"All Fields Are Required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullname : fullname,
                email : email
            }
        },
        {new : true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponce(
            200,
            user,
            "Account Detailes Seccesfully Updated"
        )
    )

})

const updateUserAvater = asyncHandalar (async (req ,res )=>{

    const avaterLocalPath  =  req.file?.path

    console.log(avaterLocalPath);

    if (!avaterLocalPath) {
        throw new ApiResponce(400,"Avater file is missing")
    }
    const Avatar = await UplodeOnCloudinary(avaterLocalPath)
    if (!Avatar.url) {
        throw new ApiError(400,"Error while uploding Avater")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar:Avatar.url
            }
        },
        {new:true}
    )

    console.log(user);
    return res
    .status(200)
    .json(
        new ApiResponce(
            200,
            user,
            "Avatar File Seccesfully Updated"
        )
    )
})

const updateUsercoverImage = asyncHandalar (async (req ,res )=>{

    const coverImageLocalPath  =  req.file?.path

    console.log(coverImageLocalPath);

    if (!coverImageLocalPath) {
        throw new ApiResponce(400,"Avater file is missing")
    }
    const coverImage = await UplodeOnCloudinary(coverImageLocalPath)
    if (!coverImage.url) {
        throw new ApiError(400,"Error while uploding Avater")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage:coverImage.url
            }
        },
        {new:true}
    )

    console.log(user);
    return res
    .status(200)
    .json(
        new ApiResponce(
            200,
            user,
            "Avatar File Seccesfully Updated"
        )
    )
})

const getUserChannelProfile = asyncHandalar(async( req,res ) => {
    const {username} = req.params

    if (!username) {
        throw new ApiError(400,"username is missing")
    }

    const channel = await User.aggregate([
        {
            $match:{
                username:username?.toLowerCase()
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"channel",
                as:"subcribers"
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"subscriber",
                as:"subcribedTo"
            }
        },
        {
            $addFields:{
                subcriberCount:{
                    $size:"$subcribers"
                },
                channelSubcribedToCount:{
                    $size:"$subcribedTo"
                },
                isSubcribed:{
                    $cond:{
                        if:{$in:[req?.user._id,"$subcribers.subscriber"]},
                        then:true,
                        else:false
                    }
                }
            }
        },
        {
            $project:{
                fullname:1,
                email:1,
                username:1,
                avatar:1,
                coverImage:1,
                subcriberCount:1,
                channelSubcribedToCount:1,
                isSubcribed:1,
            }
        }
    ])

    if (!channel?.length) {
        throw new ApiError(404,"Channel Does not exist")
    }

    return res
    .status(200)
    .json(
        new ApiResponce(
            200,
            channel[0],
            "Channel does not exist"
        )
    )



})

const getWatchHistory = asyncHandalar(async( req, res )=> {

    const user = User.aggregate([
        {
            $match:{
                _id: new mongoose.Types.ObjectId(req.user._id),
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"watchHistory",
                foreignField: "_id",
                as:"watchHistory",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField: "_id",
                            as:"owner",
                            pipeline:[
                                {
                                    $project:{
                                        fullname:1,
                                        username:1,
                                        Avater:1,
                                    }
                                }
                            ]

                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first:"$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    if (!user?.getWatchHistory) {
        throw new ApiError(404,"Watch History is missing")
        
    }


    return res.status(200)
    .json(
        new ApiResponce(
            200,
            user[0].getWatchHistory,
            "Watch History Fetched Succesfully"
        )
    )

})



export { 
    registerUser,
    loginUser,
    logoutUser,
    RefereshAccesToken,
    changeCurrentPassword,
    updateAccountDetales,
    getCurrentUser,
    updateUserAvater,
    updateUsercoverImage,
    getUserChannelProfile,
    getWatchHistory,
 }