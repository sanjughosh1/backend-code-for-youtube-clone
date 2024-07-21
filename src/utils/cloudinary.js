import {v2 as cloudinary} from 'cloudinary';
import fs from "fs"

    cloudinary.config({ 
        cloud_name: process.env.CLOUDINERY_CLOUD_NAME, 
        api_key: process.env.CLOUDINERY_API_KEY, 
        api_secret: process.env.CLOUDINERY_API_SECRAT // Click 'View Credentials' below to copy your API secret
    });


    const UplodeOnCloudinary = async (localFilePath) => {
        try {
           if (!localFilePath) return null
           //uplode the file in cloubinery
          const responce = await cloudinary.uploader.upload(localFilePath ,
            {resource_type : "auto"}
            )
            //file has been upoloded succesfully
           // http://res.cloudinary.com/dwyqwo1ym/image/upload/v1721541891/nbamz6mtaz0lrbgsclaw.png
           // http://res.cloudinary.com/dwyqwo1ym/image/upload/v1721541892/tdkgmut3erx7ifa9veim.png
            console.log("File is uploded seccesfully",
                responce.url)
            fs.unlinkSync(localFilePath)
            ; return responce;


        } catch (error) {
            fs.unlinkSync(localFilePath) //remuve the locally saved temporary file as the uplode opwration get failed
            return null
        }    
    }
    export {UplodeOnCloudinary}






    // const uploadResult = await cloudinary.uploader.upload("https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg", {
    //     public_id: "shoes"
    // }).catch((error)=>{console.log(error)});