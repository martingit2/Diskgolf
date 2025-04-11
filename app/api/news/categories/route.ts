// Fil: app/api/categories/route.ts
// Formål: API-endepunkt (GET) for å hente en liste over alle tilgjengelige nyhetskategorier.
//         Returnerer kategoriens ID, navn og slug, sortert alfabetisk på navn.
// Utvikler: Martin Pettersen, Maria Sofie Ulvheim
// AI-støtte: Benyttet under utvikling for kodekvalitet, oppdateringer og feilsøking.


import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
    const prisma = new PrismaClient(); // Isoler instans
    try {
        const categories = await prisma.category.findMany({
            select: {
                id: true,
                name: true,
                slug: true,
            },
            orderBy: {
                name: 'asc', // Sorter alfabetisk
            },
        });
        return NextResponse.json(categories);
    } catch (error) {
        console.error('[CATEGORIES_GET_ERROR]', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
