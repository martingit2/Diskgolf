import { NextResponse } from "next/server";
import cloudinary from "@/app/lib/cloudinary";
import type { UploadApiResponse } from "cloudinary";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Ingen fil opplastet" }, { status: 400 });
    }

    // Valider filstørrelse (maks 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Maks filstørrelse er 5MB" }, { status: 400 });
    }

    // Valider filtype
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: "Ugyldig filtype. Kun JPG, PNG og WEBP er tillatt" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();

    // Last opp til Cloudinary
    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: "discgolf/courses",
          upload_preset: "discgolf_uploads",
          resource_type: "image",
        },
        (error, result) => {
          if (error) {
            reject(new Error(`Cloudinary feil: ${error.message}`));
            return;
          }
          if (!result?.secure_url) {
            reject(new Error("Mangler secure_url i Cloudinary-svar"));
            return;
          }
          resolve(result);
        }
      ).end(Buffer.from(buffer));
    });

    console.log("✅ Bilde lastet opp til Cloudinary:", result.secure_url);

    return NextResponse.json({ secure_url: result.secure_url });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Ukjent feil under bildeopplasting" },
      { status: 500 }
    );
  }
}
