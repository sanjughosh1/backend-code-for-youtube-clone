import mongoose, { Schema } from "mongoose";

const videoSchema = new Schema({
    videoFile:{
        type : String, //cooudmery URL
        required: true,
    },
    thumbnail:{
        type : String,
        required: true,
    },
    titel:{
        type : String,
        required: true,
    },
    discription:{
        type : String,
        required: true,
    },
    duration:{
        type : Number,
        required: true,
    },
    views:{
        type : Number,
        default: 0,
    },
    inPublished :{
        type :Boolean,
        default :true
    },
    owner:{
        type : Schema.Types.ObjectId,
        ref: "User"
    }
    


},{timestamps:true})


export const Video = mongoose.model("Video", videoSchema)
