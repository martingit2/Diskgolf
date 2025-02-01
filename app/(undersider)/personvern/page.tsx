import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PersonvernPage() {
  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <Card className="shadow-lg border border-gray-200">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Personvern</CardTitle>
        </CardHeader>
        <CardContent className="space-y-9 text-1xl">
          <section>
            <p>
              Velkommen til DiskGolf! Vi respekterer ditt personvern og forplikter oss til å beskytte dine personopplysninger. Denne personvernerklæringen forklarer hvilke data vi samler inn, hvordan vi bruker dem, og hvilke rettigheter du har som bruker av vår tjeneste.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">1. Hvilke data samler vi inn?</h2>
            <p>For å kunne tilby en god brukeropplevelse samler vi inn følgende informasjon:</p>
            <ul className="list-disc list-inside ml-4">
              <li><strong>Kontaktinformasjon:</strong> E-postadresse og telefonnummer for kommunikasjon, medlemskap og arrangementregistrering.</li>
              <li><strong>Bruksdata:</strong> Interaksjoner med appen, som sider du besøker, knapper du trykker på, og handlinger du utfører.</li>
              <li><strong>Stedsdata:</strong> Hvis du gir tillatelse, bruker vi din plassering for å vise nærliggende disk-golfbaner.</li>
              <li><strong>Betalingsinformasjon:</strong> Ved kjøp av medlemskap eller arrangementbilletter registrerer vi transaksjonsdetaljer gjennom sikre betalingsløsninger.</li>
              <li><strong>Tekniske data:</strong> Informasjon som IP-adresse, enhetstype, operativsystem og nettleserversjon for å forbedre tjenesten og sikre stabilitet.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold">2. Hvordan bruker vi dataene dine?</h2>
            <p>Dataene vi samler inn brukes til flere formål for å forbedre din opplevelse:</p>
            <ul className="list-disc list-inside ml-4">
              <li>For å tilby og forbedre funksjoner, som å vise relevante disk-golfbaner.</li>
              <li>For å personalisere innhold basert på dine interesser og tidligere bruk.</li>
              <li>For å administrere medlemskap, arrangementer og betalingsprosesser.</li>
              <li>For å opprettholde sikkerhet, forhindre misbruk og etterleve juridiske forpliktelser.</li>
              <li>For å utføre analyser og forbedringer basert på brukerens interaksjon med tjenesten.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold">3. Bruk av informasjonskapsler (Cookies)</h2>
            <p>Vi bruker informasjonskapsler (cookies) for å forbedre din brukeropplevelse. Disse hjelper oss med å:</p>
            <ul className="list-disc list-inside ml-4">
              <li><strong>Nødvendige cookies:</strong> Sikre at viktige funksjoner i appen fungerer som de skal.</li>
              <li><strong>Analysecookies:</strong> Forstå hvordan brukerne navigerer i appen slik at vi kan forbedre den.</li>
              <li><strong>Markedsføringscookies:</strong> Vise deg relevante tilbud basert på dine preferanser.</li>
            </ul>
            <p>Du kan administrere cookie-innstillingene dine i nettleseren.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">4. Hvordan lagrer og beskytter vi dataene dine?</h2>
            <p>For å beskytte dine data har vi implementert følgende sikkerhetstiltak:</p>
            <ul className="list-disc list-inside ml-4">
              <li>Data lagres på sikre servere med kryptering for å forhindre uautorisert tilgang.</li>
              <li>Kun autoriserte ansatte med sikkerhetsklarering har tilgang til brukerinformasjon.</li>
              <li>Vi gjennomfører regelmessige sikkerhetsoppdateringer og sårbarhetsanalyser.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold">5. Hvor lenge lagrer vi dataene dine?</h2>
            <p>Vi lagrer data kun så lenge det er nødvendig:</p>
            <ul className="list-disc list-inside ml-4">
              <li>Kontoopplysninger beholdes så lenge kontoen din er aktiv.</li>
              <li>Transaksjonsdata lagres i henhold til lovpålagte krav (f.eks. regnskapsloven).</li>
              <li>Informasjonskapsler slettes automatisk etter en bestemt tidsperiode.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold">6. Deler vi data med tredjeparter?</h2>
            <p>Vi deler kun data når det er nødvendig, for eksempel:</p>
            <ul className="list-disc list-inside ml-4">
              <li><strong>Betalingsleverandører:</strong> For sikre transaksjoner.</li>
              <li><strong>Analyseverktøy:</strong> For å forbedre tjenesten.</li>
              <li><strong>Myndigheter:</strong> Hvis loven krever det.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold">7. Dine rettigheter</h2>
            <p>Du har rett til å:</p>
            <ul className="list-disc list-inside ml-4">
              <li>Be om en kopi av dataene vi har om deg.</li>
              <li>Be om retting eller sletting av feilaktige data.</li>
              <li>Be om å få kontoen din slettet.</li>
              <li>Protestere mot hvordan vi bruker dine data.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold">8. Endringer i personvernerklæringen</h2>
            <p>Vi kan oppdatere denne erklæringen ved behov. Vesentlige endringer vil bli varslet på e-post eller via appen.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">9. Kontakt oss</h2>
            <p>For spørsmål, kontakt oss på <strong>post@diskgolf.app</strong>.</p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
