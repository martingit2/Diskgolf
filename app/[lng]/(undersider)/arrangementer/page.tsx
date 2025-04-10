/**
 * Filnavn: page.tsx
 * Beskrivelse: Arrangementer-side med registrerings-popup for events.
 * Brukere kan melde seg på arrangementer og sende en forespørsel til et team.
 *
 * Utvikler: Said Hussain Khawajazada
 * Opprettet: 2. februar 2025
 * Teknologier: Next.js, Shadcn/UI, Tailwind CSS
 */

"use client"; // Required for modal interactions

import Image from "next/image";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; 

// Dummy event data
const events = [
  {
    id: 1,
    title: "USN DiskGolf Mesterskap",
    date: "10. mars 2025",
    location: "Universitetet i Sørøst-Norge, Bane 3",
    description: "Den største disk-golf turneringen på USN. Konkurrer mot de beste spillerne!",
    image: "/arrangmentBilder/usn-championship.png",
  },
  {
    id: 2,
    title: "Lokal DiskGolf Turnering",
    date: "25. mars 2025",
    location: "Skien DiskGolf Park",
    description: "Møt opp for en morsom og uformell turnering! Åpent for alle nivåer.",
    image: "/arrangmentBilder/local-tournament.png",
  },
  {
    id: 3,
    title: "Nybegynner Workshop",
    date: "5. april 2025",
    location: "Oslo DiskGolf Klubb",
    description: "Lær grunnleggende teknikker med profesjonelle instruktører. Perfekt for nybegynnere!",
    image: "/arrangmentBilder/beginner-workshop.png",
  },
];

// Dummy teams
const teams = ["Team Alpha", "Team Bravo", "Team Champions"];

export default function ArrangementerPage() {
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [about, setAbout] = useState<string>("");
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);

 
  const handleTeamSelect = (team: string) => {
    setSelectedTeams((prevTeams) =>
      prevTeams.includes(team) ? prevTeams.filter((t) => t !== team) : [...prevTeams, team]
    );
  };

    // Function to handle registration submission
    // Function to handle registration submission with validation
    const handleSubmit = async () => {
      // Check if name or email is empty
      if (!name.trim() || !email.trim()) {
        alert("Vennligst fyll inn både navn og e-post før du sender forespørselen.");
        return; // Stop the function from proceeding
      }

      const registrationData = {
        event: selectedEvent,
        name,
        email,
        about, 
        teams: selectedTeams,
      };

      // Simulating an email notification to teams (replace with real backend/API)
      console.log("Sending registration:", registrationData);

      alert("Din registrering er sendt! Teamet vil bli varslet via e-post.");
      
      // Reset form
      setName("");
      setEmail("");
      setAbout("");
      setSelectedTeams([]);
      setSelectedEvent(null);
    };


  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6 text-green-300 text-center">Kommende Arrangementer</h1>
      <div className="space-y-6">
        {events.map((event) => (
          <Card key={event.id} className="shadow-lg border border-gray-200">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">{event.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row gap-4">
              <Image
                src={event.image}
                alt={event.title}
                width={300}
                height={200}
                className="rounded-lg object-cover"
              />
              <div className="flex-1">
                <p className="text-sm text-gray-600"><strong>Dato:</strong> {event.date}</p>
                <p className="text-sm text-gray-600"><strong>Sted:</strong> {event.location}</p>
                <p className="mt-2">{event.description}</p>

                {/* Register Button with Dialog Trigger */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      className="mt-4" 
                      onClick={() => setSelectedEvent(event.title)} 
                    >
                      Registrer deg
                    </Button>
                  </DialogTrigger>

                  {/* Modal Popup */}
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Meld deg på {selectedEvent}</DialogTitle>
                    </DialogHeader>

                    {/* Registration Form */}
                    <div className="space-y-4">
                      <Input 
                        placeholder="Ditt navn" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                      />
                      <Input 
                        placeholder="Din e-post" 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                      />
                      <Textarea 
                        placeholder="Fortell litt om deg selv..." 
                        value={about} 
                        onChange={(e) => setAbout(e.target.value)} 
                      />

                      {/* Team Selection */}
                      <div>
                        <h3 className="font-semibold">Velg et team</h3>
                        {teams.map((team) => (
                          <div key={team} className="flex items-center gap-2">
                            <Button 
                              size="sm"
                              variant={selectedTeams.includes(team) ? "default" : "outline"} 
                              onClick={() => handleTeamSelect(team)}
                            >
                              {selectedTeams.includes(team) ? "✔" : "+"}
                            </Button>
                            <span>{team}</span>
                          </div>
                        ))}
                      </div>

                      {/* Submit Button */}
                      <Button className="w-full" onClick={handleSubmit}>
                        Send registrering
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
