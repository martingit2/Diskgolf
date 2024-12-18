import Map from "@/components/Map";
import SearchForm from "@/components/SearchForm";

export default function Home() {
  return (
    <main className="bg-[var(--headerColor)]">
      {/* Overskrift-seksjon */}
      <section className="max-w-7xl mx-auto p-6">
        <h1 className="font-bold text-5xl bg-gradient-to-r from-green-600 via-green-300 to-green-600 text-transparent bg-clip-text">
          Ta spillet ditt til neste nivå
        </h1>
        <h2 className="text-white py-5 text-xl">
          Søk etter baner, turneringer, klubber og mye mer!
        </h2>
      </section>

      {/* Søkefeltene og kartet */}
      <section className="mx-auto max-w-7xl mt-10 p-6 bg-white rounded-t-lg shadow-md">
        <div className="pt-5">
          <h3 className="text-xl font-bold">Finn og utforsk din neste DiscGolf-bane</h3>
          <p className="font-light">
            Oppdag baner nær deg eller utforsk nye destinasjoner. Perfekt for både nybegynnere og erfarne spillere.
          </p>
        </div>

        {/* Søke-seksjon */}
        <div className="mt-6">
          <SearchForm />
        </div>

        {/* Kart-seksjon */}
        <div className="mt-10">
          <h1 className="text-2xl font-bold mb-4 text-center">Utforsk DiscGolf-baner på kartet</h1>
          <div className="w-full h-[500px]">
            <Map center={[59.9139, 10.7522]} /> {/* Oslo som eksempel */}
          </div>
        </div>
      </section>
    </main>
  );
}
