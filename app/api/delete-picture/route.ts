// app/api/delete-picture/route.ts
import { NextResponse } from "next/server";
import cloudinary from "@/app/lib/cloudinary";

export async function DELETE(request: Request) {
  try {
    const { public_id } = await request.json();
    if (!public_id) {
      return NextResponse.json({ error: "Mangler public_id" }, { status: 400 });
    }

    console.log("Forsøker å slette bilde med public_id:", public_id);

    const result = await cloudinary.uploader.destroy(public_id);
    console.log("Cloudinary resultat:", result);

    if (result.result !== "ok") {
      return NextResponse.json({ error: "Kunne ikke slette bildet" }, { status: 500 });
    }

    return NextResponse.json({ message: "Bildet ble slettet" }, { status: 200 });
  } catch (error) {
    console.error("Feil ved sletting av bilde:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Ukjent feil" },
      { status: 500 }
    );
  }
}