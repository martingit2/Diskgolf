import React from "react";

const ContactPage = () => {
  return (
    <div className="h-[71vh] flex flex-col items-center justify-center bg-gradient-to-br from-green-400 via-black to-black p-6">

      <form className="w-full max-w-lg bg-white shadow-lg rounded-lg p-6 space-y-4">
        {/* Form Heading */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4 text-center">
          Kontakt oss
        </h1>

        {/* Name Field */}
        <div>
          <label htmlFor="name" className="block text-lg font-medium text-gray-700">
            Navn
          </label>
          <input
            type="text"
            id="name"
            placeholder="Skriv ditt navn"
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500"
            required
          />
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-lg font-medium text-gray-700">
            E-postadresse
          </label>
          <input
            type="email"
            id="email"
            placeholder="Skriv din e-postadresse"
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500"
            required
          />
        </div>

        {/* Message Field */}
        <div>
          <label htmlFor="message" className="block text-lg font-medium text-gray-700">
            Melding
          </label>
          <textarea
            id="message"
            rows={4}
            placeholder="Hva ønsker du å spørre om?"
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500"
            required
          ></textarea>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded-lg shadow-lg hover:bg-green-700 focus:ring-4 focus:ring-green-300"
        >
          Send melding
        </button>
      </form>
    </div>
  );
};

export default ContactPage;

