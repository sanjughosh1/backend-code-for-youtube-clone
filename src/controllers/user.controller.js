import { asyncHandalar } from "../utils/asyncHandaler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { UplodeOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponce } from "../utils/ApiResponce.js";


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

export { registerUser }