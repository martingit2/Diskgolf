// app/api/categories/route.ts
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
