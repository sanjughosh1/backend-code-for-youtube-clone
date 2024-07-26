import mongoose, { Schema } from "mongoose";


const likeSchema = new Schema({
    videos:{
        type:Schema.Types.ObjectId,
        ref:"Video"
    },
    comment:{
        type:Schema.Types.ObjectId,
        ref:"Video"
    },
    tweet:{
        type:Schema.Types.ObjectId,
        ref:"Video"
    },
    likeBy:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },

},{
    timestamps:true
})


export const Like = mongoose.model("Like",likeSchema)