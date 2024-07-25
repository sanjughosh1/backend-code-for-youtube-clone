import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";



const userSchema = new Schema(
    {
       username :{
        type : String,
        required : true,
        unique : true,
        lowercase : true,
        index : true
       },
       email :{
        type : String,
        required : true,
        unique : true,
        lowercase : true,
       },
       fullname :{
        type : String,
        required : true,
        trim : true,
        index : true
       },
       avatar :{
        type : String,//cloudmery url
        required : true,
       },
       coverImage :{
        type : String,//cloudmery url
       },
       watchHistory :{
        type : Schema.Types.ObjectId,
        ref :"video"
       }, 
       password :{
        type :String ,
        required : [true,"password is required"]
        
       },

       refreshToken: {
        type : String
       }

},{timestamps:true})

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password  = await bcrypt.hash(this.password ,8)
    next()
})
//custom methard
userSchema.methods.isPasswordCurrect = async function (password) {
   return await bcrypt.compare(password, this.password)
}

userSchema.methods.genarateAccesToken = function () {
    return jwt.sign({
        _id: this._id,
        email: this.email,
        userName : this.userName,
        fullName : this.fullName
    },
    process.env.ACCES_TOKEN_SECRATE,
    {expiresIn : process.env.ACCES_TOKEN_EXPIRY}) 
    //token genatation

}
userSchema.methods.genarateRefreshToken = function () {
    return jwt.sign({
        _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {expiresIn : process.env.REFRESH_TOKEN_EXPIRY})
    //token genatation
}


export const User = mongoose.model("User", userSchema)