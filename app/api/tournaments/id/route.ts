import { NextResponse } from "next/server";




// Hardkode turneringsdata for testing
const sampleTournament = {
  id: "sample-id", 
  name: "Test Turnering",
  type: "USER",
  location: "Test Location",
  description: "Test Description for the tournament",
  dateTime: "2025-01-01T12:00:00Z",
  participants: [
    { id: "user-1", name: "Ola Nordmann" },
    { id: "user-2", name: "Kari Nordmann" }
  ]
};

export async function GET() {
  try {
    // Returner hardkodet turnering
    return NextResponse.json(sampleTournament);
  } catch (error) {
    console.error("Error fetching tournament:", error);
    return NextResponse.json({ error: "Failed to fetch tournament" }, { status: 500 });
  }
}
