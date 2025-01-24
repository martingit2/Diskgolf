"use client";

import { useState } from "react";
import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa"; // Import icons from react-icons

export default function KontaktOss() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {/* Button */}
      <button
        className="text-sm font-semibold leading-6 text-white hover:text-green-400"
        onClick={() => setIsModalOpen(true)}
      >
        Kontakt oss
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-md p-6 relative">
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
            >
              &times;
            </button>

            {/* Modal Content */}
            <h2 className="text-2xl font-bold mb-4 text-black">Kontakt Oss</h2>
            <div className="space-y-4 text-gray-800">
              <p>
                <span className="font-medium">E-post:</span> postmottak@usn.no
              </p>
              <p>
                <span className="font-medium">Telefon:</span> +47 123 456 789
              </p>
              <p>
                <span className="font-medium">Adresse:</span>  Gullbringvegen 28, 3800 Bø, Midt-Telemark 
              </p>

              {/* Social Media Icons */}
              <div className="flex justify-around mt-4">
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
                  <FaTwitter size={24} />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
