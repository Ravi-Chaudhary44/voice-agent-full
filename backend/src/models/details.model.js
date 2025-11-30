import mongose, { Schema } from 'mongoose';

const detailsSchema=new Schema({
jobposition:{
    type:String,
    required:true,
},
jobdescription:{
type:String,
required:true,
},
duration:{
    type:String,
    required:true,
},
type:{
    type:String,
    required:true,
},
question:{
type:Schema.Types.Mixed,
required:true,
},
email:{
    type:String,
    required:true,
},
user:{
    type:Schema.Types.ObjectId,
    ref:"User"
    
}


},{timestamps:true})

export const Details=mongose.model("Details",detailsSchema);