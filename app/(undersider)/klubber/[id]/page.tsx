import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Mail, Phone, Globe } from "lucide-react";
import { auth } from "@/auth"; // Importer din autentiseringsmetode
import { PrismaClient, Club as PrismaClub, Course as PrismaCourse, ClubNews as PrismaNews, User as PrismaUser } from "@prisma/client"; // Importer Prisma typer
import { JoinClubButtonClient } from "@/components/klubber/JoinClubButton";
// *** Dobbeltsjekk at navnet og stien er korrekt ***


// Initialiser Prisma Client
const prisma = new PrismaClient();

// Definer type for klubbdata
// *** KUN Omit 'memberships', behold 'membershipPrice' fra PrismaClub ***
interface ClubWithDetails extends Omit<PrismaClub, 'memberships'> {
  courses: PrismaCourse[];
  clubNews: PrismaNews[];
  admins: Pick<PrismaUser, 'id' | 'name'>[];
  _count?: {
      memberships?: number;
  };
  // membershipPrice arves nå fra PrismaClub som number | null
}
// ******************************************************************

// Korrigert type for props (matcher CoursePage.tsx og feilmelding)
interface ClubPageProps {
    params: Promise<{
        id: string;
    }>;
}

// Hjelpefunksjon for å hente klubbdata
async function getClubData(clubId: string): Promise<ClubWithDetails | null> {
    return await prisma.club.findUnique({
        where: { id: clubId },
        include: {
            courses: true,
            clubNews: { orderBy: { createdAt: 'desc' }, take: 5 },
            admins: { select: { id: true, name: true } },
            _count: { select: { memberships: true } }
            // Alle base-felter (inkl. membershipPrice) hentes
        }
    });
}

// Hjelpefunksjon for å sjekke aktivt medlemskap
async function checkActiveMembership(userId: string, clubId: string): Promise<boolean> {
    const membership = await prisma.membership.findUnique({
        where: {
            userId_clubId: { userId: userId, clubId: clubId },
            status: 'active'
        },
        select: { userId: true }
    });
    return !!membership;
}

// Server Component for klubbsiden
export default async function ClubPage({ params }: ClubPageProps) {

  // Await params for å hente ID
  const awaitedParams = await params;
  const id = awaitedParams.id;

  if (!id) {
      console.error("ClubPage: ID mangler etter await params");
      notFound();
  }

  // Hent brukerens sesjon
  const session = await auth();
  const userId = session?.user?.id;

  let club: ClubWithDetails | null = null;
  let isMember = false;

  try {
    // Hent klubbdata
    club = await getClubData(id);

    if (!club) {
      console.warn(`ClubPage: Fant ikke klubb med ID: ${id}`);
      notFound();
    }

    // Hvis bruker er logget inn, sjekk medlemskap
    if (userId) {
      isMember = await checkActiveMembership(userId, club.id);
    }

  } catch (error) {
     console.error(`❌ Error fetching data for club page (ID: ${id}):`, error);
     notFound();
  } finally {
      await prisma.$disconnect();
  }

  if (!club) {
     notFound(); // Sikkerhetsnett
  }

  // Formater data for visning
  const displayClub = {
    ...club,
    establishedFormatted: new Date(club.established).toLocaleDateString('nb-NO'),
    memberCount: club._count?.memberships ?? 0,
  };

  // --- Returnerer JSX (uendret) ---
  return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 text-center md:text-left">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight">{displayClub.name}</h1>
            {displayClub.location && ( <p className="mt-2 text-lg sm:text-xl text-gray-600">{displayClub.location}</p> )}
          </div>
          <hr className="my-8 border-gray-200" />
          {/* Hovedlayout Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {/* Venstre kolonne */}
            <div className="md:col-span-2 space-y-10">
              {/* Bilde */}
              <div className="relative w-full aspect-[16/9] md:aspect-auto md:h-[450px] rounded-xl overflow-hidden shadow-lg group">
                <Image src={ displayClub.imageUrl || "https://res.cloudinary.com/dmuhg7btj/image/upload/v1741665222/discgolf/courses/file_d2gyo0.webp" } alt={displayClub.name} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 800px" className="object-cover transition-transform duration-500 group-hover:scale-105" priority />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-70 group-hover:opacity-50 transition-opacity duration-300"></div>
              </div>
              {/* Handlingsknapper */}
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <JoinClubButtonClient clubId={displayClub.id} clubName={displayClub.name} membershipPrice={displayClub.membershipPrice} isAlreadyMember={isMember} isLoggedIn={!!userId} />
                <Link href={`/klubber/${id}/kontakt`} passHref legacyBehavior><a className="w-full sm:w-auto"><Button variant="outline" className="w-full bg-gray-800 text-white hover:bg-gray-700 font-semibold py-3 px-6 rounded-lg shadow-md transition-colors">Kontakt klubben</Button></a></Link>
              </div>
              {/* Beskrivelse */}
              {displayClub.description && (<div className="p-6 bg-white rounded-lg shadow border-l-4 border-green-500"><h2 className="text-2xl font-semibold text-gray-800 mb-3">Om Klubben</h2><p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{displayClub.description}</p></div>)}
              {/* Baner */}
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Tilknyttede Baner</h2>
                {displayClub.courses.length > 0 ? (<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{displayClub.courses.map((course) => (<Link key={course.id} href={`/courses/${course.id}`} passHref legacyBehavior><a className="block border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer bg-white hover:border-green-300"><h3 className="text-lg font-medium text-gray-900">{course.name}</h3>{course.location && <p className="text-sm text-gray-600 mt-1">{course.location}</p>}{course.numHoles && <p className="text-xs text-gray-500 mt-1">{course.numHoles} hull</p>}</a></Link>))}</div>) : (<p className="text-gray-500 italic">Klubben har ikke registrert noen baner enda.</p>)}
              </div>
              {/* Nyheter */}
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Siste Nytt</h2>
                {displayClub.clubNews.length > 0 ? (<div className="space-y-6">{displayClub.clubNews.map((news) => (<div key={news.id} className="p-5 bg-white rounded-lg shadow border border-gray-100"><h3 className="text-lg font-medium text-gray-900">{news.title}</h3><p className="text-xs text-gray-500 mb-2">{new Date(news.createdAt).toLocaleDateString('nb-NO', { day: 'numeric', month: 'long', year: 'numeric' })}</p>{news.imageUrl && (<div className="relative w-full aspect-video my-3 rounded overflow-hidden"><Image src={news.imageUrl} alt={news.title} fill className="object-cover" /></div>)}<p className="text-gray-700 leading-relaxed text-sm">{news.content}</p></div>))}</div>) : (<p className="text-gray-500 italic">Ingen nyheter registrert enda.</p>)}
              </div>
            </div>
            {/* Høyre kolonne */}
            <div className="md:col-span-1 space-y-8">
              {/* Info-boks */}
              <div className="p-6 bg-white rounded-lg shadow border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Klubbinformasjon</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3"><Calendar className="w-5 h-5 text-gray-500 mt-0.5 shrink-0" /><span>Etablert: {displayClub.establishedFormatted}</span></div>
                  <div className="flex items-start gap-3"><Users className="w-5 h-5 text-gray-500 mt-0.5 shrink-0" /><span>{displayClub.memberCount} Medlemmer</span></div>
                  {displayClub.email && (<div className="flex items-start gap-3"><Mail className="w-5 h-5 text-gray-500 mt-0.5 shrink-0" /><a href={`mailto:${displayClub.email}`} className="text-blue-600 hover:underline break-words">{displayClub.email}</a></div>)}
                  {displayClub.phone && (<div className="flex items-start gap-3"><Phone className="w-5 h-5 text-gray-500 mt-0.5 shrink-0" /><a href={`tel:${displayClub.phone}`} className="text-blue-600 hover:underline">{displayClub.phone}</a></div>)}
                  {displayClub.website && (<div className="flex items-start gap-3"><Globe className="w-5 h-5 text-gray-500 mt-0.5 shrink-0" /><a href={displayClub.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">{displayClub.website}</a></div>)}
                </div>
              </div>
              {/* Admin-boks */}
              <div className="p-6 bg-white rounded-lg shadow border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Administratorer</h3>
                {displayClub.admins.length > 0 ? (<ul className="space-y-2 text-sm">{displayClub.admins.map((admin) => (<li key={admin.id} className="flex items-center gap-2 text-gray-700"><Users className="w-4 h-4 text-gray-400 shrink-0" /><span>{admin.name || `Admin (${admin.id.substring(0,6)}...)`}</span></li>))}</ul>) : (<p className="text-gray-500 italic text-sm">Ingen administratorer registrert.</p>)}
              </div>
              {/* Medlemsområde-knapp */}
              {isMember && (<div className="p-6 bg-blue-50 rounded-lg shadow border border-blue-200"><h3 className="text-xl font-semibold text-blue-800 mb-4">Ditt Medlemskap</h3><p className="text-sm text-blue-700 mb-4">Du er et aktivt medlem av denne klubben.</p><Link href={`/klubber/${id}/medlem`} passHref legacyBehavior><a className="block w-full"><Button variant="default" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg shadow transition-colors">Gå til medlemsområde</Button></a></Link></div>)}
            </div>
          </div>
        </div>
      </div>
    );
}