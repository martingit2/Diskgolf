import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server"; 

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1'); // Default to page 1 if not provided
  const limit = parseInt(url.searchParams.get('limit') || '6'); // Default to 6 clubs per page if not provided

  try {
    // Fetch clubs with pagination
    const clubs = await prisma.club.findMany({
      orderBy: {
        established: 'desc',  // Sort by establishment date (newest first)
      },
      skip: (page - 1) * limit,  // Skip the records for previous pages
      take: limit,  // Limit the number of clubs per page
    });

    // Get total number of clubs to calculate total pages
    const totalCount = await prisma.club.count();

    const totalPages = Math.ceil(totalCount / limit); // Calculate the total number of pages

    return NextResponse.json({
      clubs, 
      totalPages, // send the totalPages in the response
    }, { status: 200 });
  } catch (error) {
    console.error("Feil ved henting av klubber:", error);
    return NextResponse.json({ error: "Noe gikk galt ved henting av klubber" }, { status: 500 });
  }
}
