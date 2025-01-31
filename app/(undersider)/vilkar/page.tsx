'use client'
export const dynamic = "force-dynamic";


import { useState } from "react";

const TermsOfUse = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const termsContent = [
    {
      id: '1',
      title: 'Introduksjon',
      content: 'Vilkår for bruk er de reglene og betingelsene som regulerer din tilgang og bruk av nettstedet vårt. Vennligst les disse vilkårene nøye før du bruker vår tjeneste.'
    },
    {
      id: '2',
      title: 'Bruk av tjenesten',
      content: 'Ved å bruke nettstedet vårt, godtar du å være bundet av våre vilkår og betingelser. Du samtykker også i å bruke nettstedet vårt på en lovlig måte og i samsvar med gjeldende lover.'
    },
    {
      id: '3',
      title: 'Ansvar',
      content: 'Vi er ikke ansvarlige for eventuelle skader eller tap som kan oppstå som følge av bruken av nettstedet vårt. Det er ditt ansvar å sikre at du bruker tjenesten på en trygg og sikker måte.'
    },
    {
      id: '4',
      title: 'Personvern',
      content: 'Vi respekterer ditt personvern og vil behandle dine personlige opplysninger i samsvar med vår personvernerklæring. Du kan lese mer om hvordan vi behandler dine data i personvernerklæringen.'
    },
    {
      id: '5',
      title: 'Endringer i vilkårene',
      content: 'Vi kan endre disse vilkårene når som helst. Når vi gjør endringer, vil vi oppdatere denne siden, og endringene vil gjelde umiddelbart etter at de er publisert.'
    },
    {
      id: '6',
      title: 'Kontakt',
      content: 'Hvis du har spørsmål eller kommentarer til våre vilkår, kan du kontakte oss via vår kontaktside.'
    },
    {
      id: '7',
      title: 'Brukerens ansvar',
      content: 'Som bruker av nettstedet vårt, forplikter du deg til å bruke tjenesten på en ansvarlig måte og i samsvar med gjeldende lover og regler. Du er ansvarlig for all aktivitet som skjer under din konto og må varsle oss umiddelbart dersom du mistenker at kontoen din er blitt kompromittert.'
    },
    {
      id: '8',
      title: 'Begrensning av ansvar',
      content: 'Vi påtar oss ikke ansvar for eventuelle direkte eller indirekte skader som kan oppstå ved bruk av nettstedet vårt, inkludert men ikke begrenset til tap av data eller økonomiske tap. Ved å bruke nettstedet vårt, samtykker du i å fraskrive oss ansvar for slike hendelser.'
    },
    {
      id: '9',
      title: 'Tredjeparts lenker',
      content: 'Vårt nettsted kan inneholde lenker til tredjeparts nettsteder. Vi er ikke ansvarlige for innholdet på disse nettstedene, og disse lenkene er kun ment som en hjelp for brukeren. Du besøker tredjeparts nettsteder på egen risiko.'
    },
    {
      id: '10',
      title: 'Bruk av cookies',
      content: 'Vårt nettsted bruker informasjonskapsler (cookies) for å forbedre brukeropplevelsen. Ved å bruke nettstedet vårt, samtykker du i vår bruk av cookies i samsvar med vår cookie-policy.'
    },
    {
      id: '11',
      title: 'Opphavsrett',
      content: 'Alt innhold på nettstedet vårt, inkludert tekst, bilder, grafikk og programvare, er beskyttet av opphavsrett. Du kan ikke bruke, kopiere eller distribuere innholdet uten vår skriftlige tillatelse, med mindre det er spesifikt tillatt i disse vilkårene.'
    },
    {
      id: '12',
      title: 'Endringer i vilkårene',
      content: 'Vi forbeholder oss retten til å endre disse vilkårene når som helst. Når endringer skjer, vil de bli publisert på denne siden. Det er ditt ansvar å holde deg oppdatert med eventuelle endringer. Hvis du fortsetter å bruke nettstedet etter at endringene er publisert, anses det som et samtykke til de nye vilkårene.'
    },
    {
      id: '13',
      title: 'Tvisteløsning',
      content: 'Eventuelle tvister som måtte oppstå mellom deg og vårt selskap som følge av bruken av nettstedet, skal forsøkes løst gjennom forhandlinger. Hvis en løsning ikke oppnås, skal tvisten behandles i henhold til gjeldende norsk lovgivning, og domstolene i Norge skal ha jurisdiksjon.'
    },
    {
      id: '14',
      title: 'Kontaktinformasjon',
      content: 'For spørsmål om disse vilkårene, vennligst kontakt oss på følgende måte:\nEmail: support@diskgolf.com\nTelefon: +47 123 45 678\nAdresse: DiskGolf AS, Gate 12, 0123 Oslo, Norge'
    }
  ];

  const termsPerPage = 6;
  const totalPages = Math.ceil(termsContent.length / termsPerPage);

  const startIndex = (currentPage - 1) * termsPerPage;
  const currentTerms = termsContent.slice(startIndex, startIndex + termsPerPage);

  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-extrabold text-center text-gray-900 mb-6">Vilkår for Bruk</h1>

      <div className="space-y-6">
        {currentTerms.map((item) => (
          <div key={item.id} className="p-6 border-2 rounded-lg bg-gray-100 shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-900">{item.title}</h2>
            <p className="text-gray-700 mt-4">{item.content}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <button
          onClick={prevPage}
          disabled={currentPage === 1}
          className="py-2 px-4 rounded-md text-blue-600 hover:bg-blue-200 disabled:opacity-50"
        >
          Forrige
        </button>

        <span className="mx-4 text-gray-700">
          Side {currentPage} av {totalPages}
        </span>

        <button
          onClick={nextPage}
          disabled={currentPage === totalPages}
          className="py-2 px-4 rounded-md text-blue-600 hover:bg-blue-200 disabled:opacity-50"
        >
          Neste
        </button>
      </div>
    </div>
  );
};

export default TermsOfUse;
