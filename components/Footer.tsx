"use client";
import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-dark text-white p-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="text-center md:text-left">
          <h2 className="text-xl font-bold">Kontaktinformasjon</h2>
          <p className="mt-2">
            <span className="font-medium">E-post:</span> postmottak@usn.no
          </p>
          <p>
            <span className="font-medium">Telefon:</span> +47 123 456 789
          </p>
          <p>
                <span className="font-medium">Adresse:</span>  Gullbringvegen 28, 3800 Bø, Midt-Telemark 
                </p>
        </div>
        <div className="flex space-x-4 mt-4">
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800"
          >
            <FaFacebook size={24} />
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-pink-600 hover:text-pink-800"
          >
            <FaInstagram size={24} />
          </a>
          <a
            href="https://x.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-600"
            >
            <FaTwitter size={24} title="X" /> {/* Add a title to clarify it's X */}
            </a>
        </div>
      </div>
    </footer>
  );
}
