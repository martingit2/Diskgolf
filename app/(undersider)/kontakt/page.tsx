// src/app/kontakt/page.tsx
"use client"; // Markerer komponenten for klient-side rendering, nødvendig for hooks som useState og event handlers.

import { useState } from "react";
import { Button } from "@/components/ui/button"; // Importerer shadcn Button-komponent.
import { Input } from "@/components/ui/input"; // Importerer shadcn Input-komponent.
import { Textarea } from "@/components/ui/textarea"; // Importerer shadcn Textarea-komponent.
import { Label } from "@/components/ui/label"; // Importerer shadcn Label-komponent.
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"; // Importerer shadcn Card-komponenter for struktur.
import { motion } from "framer-motion"; // Importerer framer-motion for animasjoner.
import { Mail, Send, Loader2, Phone, MapPin, Building } from "lucide-react"; // Importerer ikoner fra lucide-react.
import toast from 'react-hot-toast'; // Importerer toast for tilbakemeldinger.

// Definerer typen for form data state.
type FormData = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

// Hovedkomponenten for kontaktsiden.
export default function ContactPage() {
  // State for å holde styr på form data.
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  // State for å håndtere loading under innsending.
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Håndterer endringer i input-felter og oppdaterer state.
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Håndterer innsending av skjemaet.
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Forhindrer standard form submission (reload).
    setIsSubmitting(true); // Setter loading state.
    toast.loading('Sender melding...', { id: 'contact-submit' }); // Viser loading toast.

    // TODO: Implementer faktisk API-kall for å sende form data her.
    // Eksempel på timeout for å simulere nettverksforsinkelse:
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Etter vellykket (simulert) innsending:
    console.log("Form Data Submitted:", formData); // Logger data til konsoll (for utvikling).
    toast.success('Melding sendt! Takk for henvendelsen.', { id: 'contact-submit' }); // Viser suksessmelding.
    // Nullstill skjemaet etter innsending.
    setFormData({ name: "", email: "", subject: "", message: "" });
    setIsSubmitting(false); // Fjerner loading state.

    // Håndter feil (eksempel):
    /*
    try {
      // const response = await fetch('/api/contact', { method: 'POST', body: JSON.stringify(formData) });
      // if (!response.ok) throw new Error('Network response was not ok.');
      // ... success logic ...
    } catch (error) {
      console.error("Submission failed:", error);
      toast.error('Kunne ikke sende melding. Prøv igjen.', { id: 'contact-submit' });
      setIsSubmitting(false);
    }
    */
  };

  // Definerer animasjonsvarianter for fade-in effekt.
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    // Hovedcontainer med padding og maks bredde for konsistent layout.
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Introduksjonsseksjon med tittel og beskrivelse */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="text-center mb-16"
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight mb-4">
            Kontakt Oss
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
          Har du spørsmål eller tilbakemeldinger? Vi hører gjerne fra deg! Bruk skjemaet under eller finn andre måter å nå oss på.
          </p>
        </motion.div>

        {/* Hovedinnhold delt i to kolonner på større skjermer */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">

          {/* Venstre kolonne: Kontaktskjema */}
          <motion.div initial="hidden" animate="visible" variants={{ ...fadeIn, visible: { ...fadeIn.visible, transition: { delay: 0.2, duration: 0.6 } } }}>
            <Card className="shadow-xl border border-gray-200 rounded-xl overflow-hidden bg-white">
              <CardHeader className="bg-gray-50 p-6 border-b border-gray-200">
                <CardTitle className="text-2xl font-semibold text-gray-900 flex items-center">
                  <Mail className="w-6 h-6 mr-3 text-green-600" /> Send oss en melding
                </CardTitle>
                <CardDescription className="text-gray-500 mt-1">
                  Fyll ut skjemaet så kommer vi tilbake til deg så snart som mulig.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="p-6 space-y-6">
                  {/* Navn Input */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="font-medium text-gray-700">Navn</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Ditt fulle navn"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="focus:ring-green-500 focus:border-green-500"
                      aria-label="Navn"
                    />
                  </div>

                  {/* E-post Input */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="font-medium text-gray-700">E-post</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="din.epost@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="focus:ring-green-500 focus:border-green-500"
                      aria-label="E-postadresse"
                    />
                  </div>

                  {/* Emne Input */}
                  <div className="space-y-2">
                    <Label htmlFor="subject" className="font-medium text-gray-700">Emne</Label>
                    <Input
                      id="subject"
                      name="subject"
                      type="text"
                      placeholder="Hva gjelder henvendelsen?"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="focus:ring-green-500 focus:border-green-500"
                      aria-label="Emne for meldingen"
                    />
                  </div>

                  {/* Melding Textarea */}
                  <div className="space-y-2">
                    <Label htmlFor="message" className="font-medium text-gray-700">Melding</Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Skriv meldingen din her..."
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={5} // Gir litt mer høyde til tekstområdet
                      className="focus:ring-green-500 focus:border-green-500"
                      aria-label="Din melding"
                    />
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-50 p-6 border-t border-gray-200">
                  <Button
                    type="submit"
                    className="w-full py-3 text-lg font-semibold bg-green-600 text-white hover:bg-green-700 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    disabled={isSubmitting} // Deaktiverer knappen under innsending
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" /> Sender...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" /> Send Melding
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </motion.div>

          {/* Høyre kolonne: Alternativ kontaktinfo */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ ...fadeIn, visible: { ...fadeIn.visible, transition: { delay: 0.4, duration: 0.6 } } }}
            className="space-y-8 mt-8 lg:mt-0" // Legger til litt margin top på mobil
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Andre måter å nå oss på</h2>

            {/* Kontaktkort for e-post */}
            <div className="flex items-start p-6 bg-white rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300">
              <div className="flex-shrink-0 bg-green-100 p-3 rounded-full mr-4">
                <Mail className="w-6 h-6 text-green-700" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800">E-post</h3>
                <p className="text-gray-600 mt-1">For generelle henvendelser eller support:</p>
                <a href="mailto:epost@diskgolf.app" className="text-green-600 hover:text-green-800 hover:underline font-medium break-all">
                  epost@diskgolf.app
                </a>
              </div>
            </div>

            {/* Kontaktkort for telefon (valgfritt) */}
            <div className="flex items-start p-6 bg-white rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300">
              <div className="flex-shrink-0 bg-blue-100 p-3 rounded-full mr-4">
                <Phone className="w-6 h-6 text-blue-700" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800">Telefon</h3>
                <p className="text-gray-600 mt-1">Ring oss på hverdager mellom 09:00 - 15:00:</p>
                <a href="tel:+4712345678" className="text-blue-600 hover:text-blue-800 hover:underline font-medium">
                  +47 123 45 678
                </a>
              </div>
            </div>

            {/* Kontaktkort for adresse (valgfritt, hvis relevant) */}
            <div className="flex items-start p-6 bg-white rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300">
              <div className="flex-shrink-0 bg-purple-100 p-3 rounded-full mr-4">
                <MapPin className="w-6 h-6 text-purple-700" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800">Besøksadresse</h3>
                <p className="text-gray-600 mt-1">Vårt hovedkontor (kun etter avtale):</p>
                <p className="text-gray-700 font-medium">
                Gullbringvegen 28,<br />
                3800 Bø, Midt-Telemark
                </p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}