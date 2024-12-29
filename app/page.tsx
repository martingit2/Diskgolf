

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
      <section className="mx-auto max-w-7xl mt-10 p-6 bg-gradient-to-r from-gray-100 via-white to-gray-100 shadow-lg rounded-lg">
  <div className="text-center p-8">
    <h1 className="text-3xl font-extrabold text-gray-800 leading-tight">
      Utforsk <span className="text-green-600">DiskGolf-baner</span> på kartet
    </h1>
    <p className="text-gray-600 text-lg mt-2">
      Zoom inn på kartet for å finne baner i nærheten eller oppdag nye destinasjoner. Perfekt for både nybegynnere og erfarne spillere.
    </p>
  </div>
  <div className="relative w-full h-[500px]"> {/* Lagt til "relative" her */}
    <Map />
    <div className="absolute top-2 right-2 bg-gradient-to-r from-gray-100 via-white to-gray-100 text-gray-800 text-sm px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 text-green-600"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8 16l-4-4m0 0l4-4m-4 4h16"
    />
  </svg>
  <span className="font-medium">Dra og zoom for å utforske</span>
</div>
  </div>

        {/* Søke-seksjon */}
        <div className="mt-20">
          <SearchForm />
        </div>
      </section>
    </main>
  );
}
