const cloudinary = require("cloudinary");

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

//cloundinary upload Image

const cloudinaryUploadImage = async(fileToUpload) => {
    try{
        const data = await cloudinary.v2.uploader.upload(fileToUpload,{
            resource_type: 'auto',
        });
        return data;

    }catch (error){
        console.log(error);
        throw new Error("Internal server Error (cloudinary) ");
    }
}

//cloudinary remove image

const cloudinaryRemoveImage = async(imagePublicId) => {
    try{
        const result= await cloudinary.Uploader.destroy(imagePublicId);

        return result;

    }catch (error){
        console.log(error);
        throw new Error("Internal server Error (cloudinary) ");
    }
};

//cloudinary remove multiple  image

const cloudinaryRemoveMultipleImage = async(publicIds) => {
    try{
        const result= await cloudinary.v2.api.delete_resources(publicIds);

        return result;

    }catch (error){
        console.log(error);
        throw new Error("Internal server Error (cloudinary) ");
    }
};

module.exports ={
    cloudinaryUploadImage,
    cloudinaryRemoveImage,
    cloudinaryRemoveMultipleImage
}