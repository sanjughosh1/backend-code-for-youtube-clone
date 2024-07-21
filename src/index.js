//require('dotenv').config({path:'./env'})
import dotenv from "dotenv"
import { app } from "./app.js";

// import mongoose from mongoose;
// import DB_NAME from "./constante"
 import connectDB from "./db/index.js";

dotenv.config({path: './.env'})

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running at port : ${process.env.PORT}`);
    })
})
.catch((err)=>{
    console.log("MONGODB connection Failed" , err);
})















//first approch   *******1******** cunnecting  database in MERN



// import express from express
// const app = express()

// ;(async() => {
//     try{
//         mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//         app.on("ERROR" , (error) => {
//             console.log("ERROR", error);
//             throw error
//         })
//         app.listen(process.env.PORT ,() => {
//             console.log(`app is listening on port ${process.env.PORT}` )
//         })
//     }
//     catch(error){
//         console.error("ERROR:" ,error);
//         throw err
//     }
// })()