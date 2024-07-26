import mongoose, { Schema } from "mongoose";
import mongooseaggregatepaginate from "mongoose-aggregate-paginate-v2";


const commentSchema = new Schema({
    content:{
        type:String,
        require:true
    },
    videos:{
        type:Schema.Types.ObjectId,
        ref:"Video"
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
},
{
    timestamps:true
})

commentSchema.plugin(mongooseaggregatepaginate)

export const Comment = mongoose.model("Comment",commentSchema)