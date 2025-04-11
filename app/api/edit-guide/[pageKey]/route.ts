// Fil: app/api/edit-guide/[pageKey]/route.ts
// Formål: API-endepunkt for å administrere redigerbart innhold for spesifikke sider (identifisert med pageKey).
//         GET: Henter egendefinert innhold hvis det finnes, ellers indikerer standard.
//         POST: Lagrer eller oppdaterer egendefinert innhold (kun for administratorer).
//         PUT: Tilbakestiller siden til å bruke standardinnhold (kun for administratorer).
// Utvikler: Martin Pettersen
// AI-støtte: Benyttet under utvikling for kodekvalitet, oppdateringer og feilsøking.



import { NextRequest, NextResponse } from 'next/server'; // NextRequest kan fortsatt brukes for GET hvis du trenger URL-params etc.
import { PrismaClient, UserRole } from '@prisma/client';
import { currentUser } from '@/app/lib/auth';

/**
 * GET-handler for å hente innhold for en spesifikk redigerbar side.
 */
export async function GET(
    req: NextRequest, // Behold NextRequest for GET
    { params }: { params: Promise<{ pageKey: string }> } // <<< ENDRING HER
) {
  const prisma = new PrismaClient();
  // --- NÅ MÅ VI BRUKE await HER ---
  const { pageKey } = await params;
  // --------------------------------

  if (!pageKey) {
    return NextResponse.json({ error: 'Sidens nøkkel (pageKey) mangler' }, { status: 400 });
  }

  console.log(`[EDITABLE_CONTENT_GET] Forsøker å hente innhold for pageKey: ${pageKey}`);

  try {
    const pageContent = await prisma.editablePageContent.findUnique({
      where: { pageKey },
      select: {
          useCustom: true,
          content: true
      }
    });

    if (pageContent && pageContent.useCustom) {
      console.log(`[EDITABLE_CONTENT_GET] Fant egendefinert innhold for ${pageKey}.`);
      return NextResponse.json({ useCustom: true, content: pageContent.content }, { status: 200 });
    } else {
      console.log(`[EDITABLE_CONTENT_GET] Bruker standardinnhold for ${pageKey} (useCustom: ${pageContent?.useCustom ?? 'ikke funnet'}).`);
      return NextResponse.json({ useCustom: false, content: null }, { status: 200 });
    }
  } catch (error) {
    console.error(`[EDITABLE_CONTENT_GET_ERROR] Feil ved henting av innhold for ${pageKey}:`, error);
    return NextResponse.json({ error: 'Kunne ikke hente sideinnhold' }, { status: 500 });
  } finally {
      await prisma.$disconnect();
  }
}

/**
 * POST-handler for å lagre/oppdatere egendefinert innhold for en side.
 */
export async function POST(
    request: Request, // Bruk standard Request her
    { params }: { params: Promise<{ pageKey: string }> } // <<< ENDRING HER
) {
  const prisma = new PrismaClient();
  // --- NÅ MÅ VI BRUKE await HER ---
  const { pageKey } = await params;
  // --------------------------------
  const user = await currentUser();

  // Autorisjonssjekk
  if (!user || user.role !== UserRole.ADMIN) {
    console.warn(`[EDITABLE_CONTENT_POST_AUTH_FAIL] Uautorisert forsøk på å redigere ${pageKey} av bruker: ${user?.id ?? 'ingen'}`);
    return NextResponse.json({ error: 'Uautorisert' }, { status: 403 });
  }

  if (!pageKey) {
    return NextResponse.json({ error: 'Sidens nøkkel (pageKey) mangler' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json({ error: 'Innhold (content) mangler i body' }, { status: 400 });
    }

    console.log(`[EDITABLE_CONTENT_POST] Admin ${user.id} lagrer innhold for pageKey: ${pageKey}`);

    const savedContent = await prisma.editablePageContent.upsert({
      where: { pageKey },
      update: {
        content: content,
        useCustom: true,
        updatedAt: new Date(),
      },
      create: {
        pageKey: pageKey,
        content: content,
        useCustom: true,
      },
       select: {
            pageKey: true,
            useCustom: true,
            updatedAt: true
        }
    });

    console.log(`[EDITABLE_CONTENT_POST] Innhold lagret for ${pageKey}. useCustom: ${savedContent.useCustom}`);
    return NextResponse.json({ success: true, data: savedContent }, { status: 200 });

  } catch (error) {
    console.error(`[EDITABLE_CONTENT_POST_ERROR] Feil ved lagring av innhold for ${pageKey}:`, error);
    return NextResponse.json({ error: 'Kunne ikke lagre sideinnhold' }, { status: 500 });
  } finally {
     await prisma.$disconnect();
  }
}

/**
 * PUT-handler for å sette siden til å bruke standardinnhold igjen.
 */
export async function PUT(
    request: Request, // Bruk standard Request her
    { params }: { params: Promise<{ pageKey: string }> } // <<< ENDRING HER
) {
  const prisma = new PrismaClient();
   // --- NÅ MÅ VI BRUKE await HER ---
   const { pageKey } = await params;
   // --------------------------------
  const user = await currentUser();

  // Autorisjonssjekk
  if (!user || user.role !== UserRole.ADMIN) {
     console.warn(`[EDITABLE_CONTENT_PUT_AUTH_FAIL] Uautorisert forsøk på å resette ${pageKey} av bruker: ${user?.id ?? 'ingen'}`);
    return NextResponse.json({ error: 'Uautorisert' }, { status: 403 });
  }

   if (!pageKey) {
    return NextResponse.json({ error: 'Sidens nøkkel (pageKey) mangler' }, { status: 400 });
  }

  console.log(`[EDITABLE_CONTENT_PUT] Admin ${user.id} tilbakestiller innhold for pageKey: ${pageKey}`);

  try {
     const existingContent = await prisma.editablePageContent.findUnique({
         where: { pageKey },
         select: { id: true }
     });

     if (existingContent) {
         await prisma.editablePageContent.update({
             where: { pageKey },
             data: {
                 useCustom: false,
             },
         });
         console.log(`[EDITABLE_CONTENT_PUT] Innhold for ${pageKey} tilbakestilt til standard.`);
         return NextResponse.json({ success: true, message: 'Siden er satt til å bruke standardinnhold.' }, { status: 200 });
     } else {
         console.log(`[EDITABLE_CONTENT_PUT] Innhold for ${pageKey} var allerede standard (ingen oppføring funnet).`);
         return NextResponse.json({ success: true, message: 'Siden brukte allerede standardinnhold (ingen egendefinert versjon lagret).' }, { status: 200 });
     }

  } catch (error) {
      console.error(`[EDITABLE_CONTENT_PUT_ERROR] Feil ved tilbakestilling til standard for ${pageKey}:`, error);
      return NextResponse.json({ error: 'Kunne ikke tilbakestille til standardinnhold' }, { status: 500 });
  } finally {
     await prisma.$disconnect();
  }
}