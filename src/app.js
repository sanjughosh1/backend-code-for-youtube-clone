import express from "express"
import cors from "cors";
import cookiePercer from "cookie-parser";

const app = express()

app.use(cors({
    origin:process.env.CORS_ORIGAN,
    credentials:true,
}))
app.use (express.json({limit: "16kb"}))
app.use (express.urlencoded({extended: true ,limit:"16kb"}))
app.use (express.static("public"))

app.use (cookiePercer())


//routs imports

import  userRouter from "./routes/user.routs.js";

//router description
app.use("/api/v1/users" , userRouter)

//http://localhost:8000/api/v1/users/register

export { app }