const cloudinary = require("cloudinary").v2;
const fs = require("fs").promises;
const path = require("path");

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a local file to Cloudinary (async-safe and structured)
 */
const uploadOnCloudinary = async (localFilePath, folder = "foldername") => {
    if (!localFilePath) {
        return { success: false, error: "No file path provided" };
    }

    try {
        // Check if file exists
        await fs.access(localFilePath);

        // Upload to Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
            folder,
        });

        // Remove local temp file safely
        try {
            await fs.unlink(localFilePath);
        } catch (unlinkError) {
            console.warn("Failed to delete temp file:", unlinkError.message);
        }

        return {
            success: true,
            url: response.secure_url,
            public_id: response.public_id,
        };
    } catch (error) {
        // Attempt cleanup if upload failed
        try {
            await fs.unlink(localFilePath);
        } catch {}

        return {
            success: false,
            error: "Cloudinary upload failed",
            details: error.message,
        };
    }
};

/**
 * Delete a file from Cloudinary
 */
const deleteFromCloudinary = async (publicId) => {

    if (!publicId) {

        console.log("No publicId provided");

        return { success: false };

    }

    try {

        console.log("Deleting from Cloudinary:", publicId);

        const result = await cloudinary.uploader.destroy(

            publicId,

            {

                resource_type: "image",

                invalidate: true

            }

        );

        console.log("Cloudinary delete result:", result);

        return {

            success: result.result === "ok"

        };

    }

    catch (error) {

        console.error("Cloudinary delete error:", error);

        return {

            success: false,

            error: error.message

        };

    }

};

const deleteMultipleFromCloudinary = async (publicIds = []) => {

    if (!Array.isArray(publicIds) || publicIds.length === 0) {

        return {
            success: false,
            error: "No publicIds array provided"
        };

    }

    try {

        const result = await cloudinary.api.delete_resources(

            publicIds,

            {
                resource_type: "image"
            }

        );

        return {

            success: true,

            deleted: result.deleted,

            result

        };

    } catch (error) {

        return {

            success: false,

            error: "Cloudinary bulk delete failed",

            details: error.message

        };

    }

};

module.exports = { uploadOnCloudinary, deleteFromCloudinary, deleteMultipleFromCloudinary };
