export default function Footer() {
    return (
      <footer className="bg-dark text-white p-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <h2 className="text-xl font-bold">Kontaktinformasjon</h2>
            <p className="mt-2">
              <span className="font-medium">E-post:</span> kontakt@diskgolf.com
            </p>
            <p>
              <span className="font-medium">Telefon:</span> +47 123 456 789
            </p>
          </div>
          <div className="flex space-x-4">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800"
            >
              Facebook
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink-600 hover:text-pink-800"
            >
              Instagram
            </a>
            <a
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-600"
            >
              X
            </a>
          </div>
        </div>
      </footer>
    );
  }
  