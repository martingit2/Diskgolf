import { v2 as cloudinary } from "cloudinary";

// Konfigurer Cloudinary med direkte verdier (merk at dette ikke anbefales for produksjon)
cloudinary.config({
  cloud_name: "dmuhg7btj",
  api_key: "162139118737331",
  api_secret: "pZmAaD9ErdzYBM7gsa8vTPIkrvU",
  secure: true,
});

export default cloudinary;
