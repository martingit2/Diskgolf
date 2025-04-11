
/** 
 * Filnavn: route.ts
 * Beskrivelse: API-endepunkt for søk etter discgolfbaner basert på ulike filtre som fylke, sted, vanskelighetsgrad,
 * antall hull, stjernerangering, antall anmeldelser og banetype. 
 * Returnerer en liste over discgolfbaner som matcher angitte søkekriterier.
 * Utvikler: Martin Pettersen
 * AI-støtte: Benyttet under utvikling for kodekvalitet, oppdateringer og feilsøking.
 */




import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  
  // Hent query params fra URL-en
  const fylke = url.searchParams.get('fylke');
  const sted = url.searchParams.get('sted');
  const difficulty = url.searchParams.get('difficulty');
  const numberOfHoles = url.searchParams.get('numberOfHoles');
  const starRating = url.searchParams.get('starRating');
  const reviewCount = url.searchParams.get('reviewCount');
  const baneType = url.searchParams.get('baneType');

  // Testdata med alle nødvendige felter
  const baner = [
    { 
      id: 1, 
      name: 'USN BØ, Telemark', 
      fylke: 'Telemark', 
      sted: 'Bø', 
      holes: 18, 
      difficulty: "3", 
      starRating: "5", 
      reviewCount: 50, 
      baneType: "Skogsbane", 
      imageSrc: "/dummybaner/dummy_bane_1.webp", 
      address: "Gullbringvegen 36, Bø" 
    },
    { 
      id: 2, 
      name: 'Skogsveien DiscGolf Park', 
      fylke: 'Vestland', 
      sted: 'Skien', 
      holes: 18, 
      difficulty: "4", 
      starRating: "4", 
      reviewCount: 100, 
      baneType: "Parkbane", 
      imageSrc: "/dummybaner/dummy_bane_2.webp", 
      address: "Skogsveien 15, Skien" 
    },
    { 
      id: 3, 
      name: 'Porsgrunn DiscGolf', 
      fylke: 'Vestfold', 
      sted: 'Porsgrunn', 
      holes: 9, 
      difficulty: "2", 
      starRating: "3", 
      reviewCount: 10, 
      baneType: "Bybane", 
      imageSrc: "/dummybaner/dummy_bane_3.webp", 
      address: "Fjellveien 10, Porsgrunn" 
    },
    { 
      id: 4, 
      name: 'Drammen DiscGolf Arena', 
      fylke: 'Viken', 
      sted: 'Drammen', 
      holes: 18, 
      difficulty: "3", 
      starRating: "5", 
      reviewCount: 20, 
      baneType: "Skogsbane", 
      imageSrc: "/dummybaner/dummy_bane_4.webp", 
      address: "Parkveien 22, Drammen" 
    },
    { 
      id: 5, 
      name: 'Oslo DiscGolf Center', 
      fylke: 'Oslo', 
      sted: 'Oslo Sentrum', 
      holes: 18, 
      difficulty: "4", 
      starRating: "4", 
      reviewCount: 100, 
      baneType: "Parkbane", 
      imageSrc: "/dummybaner/dummy_bane_5.webp", 
      address: "Karl Johans gate 5, Oslo" 
    },
    { 
      id: 6, 
      name: 'Sandefjord Frisbeepark', 
      fylke: 'Vestfold', 
      sted: 'Sandefjord', 
      holes: 18, 
      difficulty: "2", 
      starRating: "4", 
      reviewCount: 30, 
      baneType: "Skogsbane", 
      imageSrc: "/dummybaner/dummy_bane_6.webp", 
      address: "Havna 4, Sandefjord" 
    },
    { 
      id: 7, 
      name: 'Larvik DiscGolf Club', 
      fylke: 'Vestfold', 
      sted: 'Larvik', 
      holes: 18, 
      difficulty: "3", 
      starRating: "5", 
      reviewCount: 150, 
      baneType: "Parkbane", 
      imageSrc: "/dummybaner/dummy_bane_7.webp", 
      address: "Torget 8, Larvik" 
    },
    { 
      id: 8, 
      name: 'Tønsberg DiscGolf', 
      fylke: 'Vestfold', 
      sted: 'Tønsberg', 
      holes: 9, 
      difficulty: "3", 
      starRating: "3", 
      reviewCount: 20, 
      baneType: "Fjellbane", 
      imageSrc: "/dummybaner/dummy_bane_8.webp", 
      address: "Slottsfjellveien 1, Tønsberg" 
    },
  ];

  // Filtrere baner basert på søkekriteriene
  const filteredBaner = baner.filter(bane => {
    return (
      // Filtrer kun på fylke hvis det er spesifisert
      (!fylke || bane.fylke === fylke) &&
      // Filtrer kun på sted hvis det er spesifisert
      (!sted || bane.sted === sted) &&
      // Håndter "Vis alle" for difficulty, numberOfHoles, starRating, reviewCount og baneType
      (difficulty === "Vis alle" || !difficulty || bane.difficulty === difficulty) &&
      (numberOfHoles === "Vis alle" || !numberOfHoles || bane.holes.toString() === numberOfHoles) &&
      (starRating === "Vis alle" || !starRating || bane.starRating === starRating) &&
      (reviewCount === "Vis alle" || !reviewCount || bane.reviewCount.toString() === reviewCount) &&
      (baneType === "Vis alle" || !baneType || bane.baneType === baneType)
    );
  });

  return NextResponse.json(filteredBaner);
}
