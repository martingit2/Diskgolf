// /app/api/tournaments/[id]/route.ts
import { PrismaClient, TournamentStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth"; // Adjust path as needed

const prisma = new PrismaClient();

// --- Helper function to calculate distance between two coordinates ---
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c * 1000; // Return distance in meters
}

// --- GET: Fetch details for a single tournament ---
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const awaitedParams = await params;
    const id = awaitedParams.id;

    // Validate ID exists
    if (!id) {
        return NextResponse.json({ error: "Tournament ID is missing." }, { status: 400 });
    }

    try {
        // Fetch tournament with related course data needed for display and calculations
        const tournament = await prisma.tournament.findUnique({
            where: { id },
            include: {
                course: {
                    include: { // Include related models to calculate distance and count OB zones
                        start: true,
                        goal: true,
                        baskets: true, // Needed for numHoles fallback and distance
                        obZones: { select: { id: true } }, // Only need ID to count
                    }
                    // Note: Prisma automatically includes direct fields like par, name, image, location, numHoles etc. when using 'include' on relations
                },
                organizer: { select: { id: true, name: true } },
                club: { select: { id: true, name: true } },
                participants: { select: { id: true, name: true } },
                _count: { select: { participants: true } },
            },
        });

        // Handle tournament not found
        if (!tournament) {
            return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
        }

        // --- Augment Course Data ---
        let courseWithCalculatedData = null;
        if (tournament.course) {
            const courseData = tournament.course;

            // Determine number of holes (prefer explicit field, fallback to basket count)
            const numHoles = courseData.numHoles ?? courseData.baskets?.length ?? 0;

            // Calculate total course distance
            let totalDistance = 0;
            // Priority 1: Start to Goal distance
            if (courseData.start.length > 0 && courseData.goal) {
                const startPoint = courseData.start[0];
                totalDistance = calculateDistance(
                    startPoint.latitude, startPoint.longitude,
                    courseData.goal.latitude, courseData.goal.longitude
                );
            }
            // Priority 2: Sum of distances between baskets
            else if (courseData.baskets.length > 1) {
                for (let i = 0; i < courseData.baskets.length - 1; i++) {
                    const basket1 = courseData.baskets[i];
                    const basket2 = courseData.baskets[i + 1];
                    totalDistance += calculateDistance(
                        basket1.latitude, basket1.longitude,
                        basket2.latitude, basket2.longitude
                    );
                }
            }

            // Create the augmented course object
            courseWithCalculatedData = {
                ...courseData, // Keep original data
                numHoles: numHoles, // Use calculated/fetched numHoles
                totalDistance: totalDistance > 0 ? totalDistance : null, // Add calculated distance
                // obZones are included, frontend will use .length
            };
        }
        // --- End Augment Course Data ---

        // Create the final response object with augmented course data
        const responseTournament = {
            ...tournament, // Keep original tournament data
            course: courseWithCalculatedData, // Replace course with the augmented version
        };

        // Return the complete tournament details
        return NextResponse.json(responseTournament);

    } catch (error) {
        console.error(`Error fetching tournament ${id}:`, error);
        return NextResponse.json(
            { error: "An internal server error occurred while fetching the tournament." },
            { status: 500 }
        );
    } finally {
        // Ensure Prisma client disconnects after the operation
        await prisma.$disconnect();
    }
}

// --- PUT: Update an existing tournament ---
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const awaitedParams = await params;
    const tournamentId = awaitedParams.id;
    const session = await getServerSession(authOptions);

    // --- Authorization Check ---
    // Ensure user is logged in
    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }
    const userId = session.user.id;

    // Validate tournament ID exists
    if (!tournamentId) {
        return NextResponse.json({ error: "Tournament ID is missing." }, { status: 400 });
    }
    // --- End Authorization Check ---

    try {
        // Verify the tournament exists and the current user is the organizer
        const existingTournament = await prisma.tournament.findUnique({
            where: { id: tournamentId },
            select: { organizerId: true }
        });

        // Handle tournament not found
        if (!existingTournament) {
            return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
        }

        // Handle forbidden access (user is not the organizer)
        if (existingTournament.organizerId !== userId) {
            console.warn(`User ${userId} attempted to PUT unauthorized on tournament ${tournamentId} owned by ${existingTournament.organizerId}`);
            return NextResponse.json({ error: "Forbidden: Only the organizer can edit the tournament." }, { status: 403 });
        }

        // Parse request body
        const body = await request.json();

        // --- Input Validation ---
        // Check for required fields
        if (!body.name || !body.startDate || !body.courseId || !body.location || !body.status) {
           return NextResponse.json(
                { error: "Missing required fields for update (name, startDate, courseId, location, status)." },
                { status: 400 }
            );
        }
        // Validate status value
        if (!Object.values(TournamentStatus).includes(body.status as TournamentStatus)) {
            return NextResponse.json({ error: "Invalid status value." }, { status: 400 });
        }
        // Basic date validation
        try {
             new Date(body.startDate);
             if (body.endDate) new Date(body.endDate);
        } catch (e) {
             return NextResponse.json({ error: "Invalid date format for start or end date." }, { status: 400 });
        }
        // Ensure endDate is not before startDate
        if (body.endDate && new Date(body.endDate) < new Date(body.startDate)) {
            return NextResponse.json({ error: "End date cannot be before start date." }, { status: 400 });
        }
        // --- End Input Validation ---

        // Update the tournament in the database
        const updatedTournamentRaw = await prisma.tournament.update({
            where: { id: tournamentId },
            data: {
                // Map fields from body to database schema
                name: body.name,
                description: body.description || null,
                location: body.location,
                startDate: new Date(body.startDate),
                endDate: body.endDate ? new Date(body.endDate) : null,
                status: body.status as TournamentStatus,
                maxParticipants: body.maxParticipants ? parseInt(body.maxParticipants, 10) : null,
                courseId: body.courseId,
                clubId: body.clubId || null,
                image: body.image || null,
                // organizerId should not be updated here
            },
            // Include the same related data as the GET request for a consistent response
            include: {
                course: {
                    include: { // Mirror GET include
                        start: true,
                        goal: true,
                        baskets: true,
                        obZones: { select: { id: true } },
                    }
                },
                organizer: { select: { id: true, name: true } },
                club: { select: { id: true, name: true } },
                participants: { select: { id: true, name: true } },
                _count: { select: { participants: true } },
            },
        });

         // --- Augment Course Data in PUT response (mirroring GET) ---
         let courseWithCalculatedDataPut = null;
         if (updatedTournamentRaw.course) {
             const courseDataPut = updatedTournamentRaw.course;
             const numHolesPut = courseDataPut.numHoles ?? courseDataPut.baskets?.length ?? 0;
             let totalDistancePut = 0;
             if (courseDataPut.start.length > 0 && courseDataPut.goal) {
                const startPoint = courseDataPut.start[0];
                totalDistancePut = calculateDistance(
                    startPoint.latitude, startPoint.longitude,
                    courseDataPut.goal.latitude, courseDataPut.goal.longitude
                );
            } else if (courseDataPut.baskets.length > 1) {
                for (let i = 0; i < courseDataPut.baskets.length - 1; i++) {
                    const basket1 = courseDataPut.baskets[i];
                    const basket2 = courseDataPut.baskets[i + 1];
                    totalDistancePut += calculateDistance(
                        basket1.latitude, basket1.longitude,
                        basket2.latitude, basket2.longitude
                    );
                }
            }
             courseWithCalculatedDataPut = {
                 ...courseDataPut,
                 numHoles: numHolesPut,
                 totalDistance: totalDistancePut > 0 ? totalDistancePut : null,
             };
         }
         const responseTournamentPut = {
             ...updatedTournamentRaw,
             course: courseWithCalculatedDataPut,
         };
         // --- End Augment Course Data ---

        // Return the updated and augmented tournament data
        return NextResponse.json(responseTournamentPut);

    } catch (error) {
        console.error(`Error updating tournament ${tournamentId}:`, error);
        // Consider more specific error handling (e.g., Prisma errors) if needed
        return NextResponse.json(
            { error: "An internal server error occurred while updating the tournament." },
            { status: 500 }
        );
    } finally {
        // Ensure Prisma client disconnects
        await prisma.$disconnect();
    }
}