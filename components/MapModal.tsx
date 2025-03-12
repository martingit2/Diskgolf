"use client";

import { useState, useEffect } from "react"; // ✅ Importer useEffect
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { X, MapPin, Info, ArrowRight, Disc } from "lucide-react"; // Importer flere ikoner

// Dynamisk import av CourseMap og spesifiser props
const CourseMap = dynamic(() => import("@/components/CourseMap"), {
  ssr: false,
  loading: () => <p>Laster inn kart...</p>,
}) as React.FC<{ courseId: string }>;

// Informasjonskomponent for disk-golf
const GolfInfo = ({ courseData }: { courseData: any }) => {
  if (!courseData) return null;

  // Beregn avstander mellom startpunkter og kurver
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Jordens radius i kilometer
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c * 1000).toFixed(0); // Avstand i meter
  };

  return (
    <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Info className="w-5 h-5 text-blue-600" /> {/* Ikon for informasjon */}
        Baneinformasjon
      </h3>

      {/* Generell informasjon */}
      <div className="space-y-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h4 className="font-semibold text-gray-800">Generell informasjon</h4>
          <p><strong>Sted:</strong> {courseData.location}</p>
          <p><strong>Vanskelighetsgrad:</strong> {courseData.difficulty}</p>
          <p><strong>Antall hull:</strong> {courseData.numHoles}</p>
          <p><strong>Total lengde:</strong> {courseData.totalDistance?.toFixed(0)} meter</p>
        </div>

        {/* Avstander mellom startpunkter og kurver */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h4 className="font-semibold text-gray-800">Avstander</h4>
          <ul className="space-y-2">
            {courseData.start?.map((startPoint: any, index: number) => {
              const basket = courseData.baskets?.[index];
              if (!basket) return null;

              const distance = calculateDistance(
                startPoint.latitude,
                startPoint.longitude,
                basket.latitude,
                basket.longitude
              );

              return (
                <li key={index} className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-gray-500" />
                  <span>Tee {index + 1} til Kurv {index + 1}: <strong>{distance} meter</strong></span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* OB-områder */}
        {courseData.obZones?.length > 0 && (
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h4 className="font-semibold text-gray-800">OB-områder</h4>
            <ul className="space-y-2">
              {courseData.obZones.map((obZone: any, index: number) => (
                <li key={index} className="flex items-center gap-2">
                  <Disc className="w-4 h-4 text-red-500" />
                  <span>OB-område {index + 1}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

const MapModal = ({ courseId }: { courseId: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [courseData, setCourseData] = useState<any | null>(null);

  const toggleModal = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (isOpen) {
      const fetchCourseData = async () => {
        try {
          const response = await fetch(`/api/courses/${courseId}`);
          if (!response.ok) throw new Error("Kunne ikke hente baneinformasjon");
          const data = await response.json();
          setCourseData(data);
        } catch (error) {
          console.error(error);
        }
      };

      fetchCourseData();
    }
  }, [isOpen, courseId]);

  return (
    <>
      {/* Knapp for å åpne modalen */}
      <Button 
        onClick={toggleModal} 
        className="bg-gray-900 hover:bg-gray-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition-all duration-300 flex items-center gap-2"
      >
        <MapPin className="w-5 h-5" /> {/* Legger til kart-ikonet */}
        Bane Kart
      </Button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 md:w-3/4 lg:w-2/3 xl:w-1/2 relative">
            {/* Lukkeknapp */}
            <button 
              onClick={toggleModal} 
              className="absolute top-3 right-3 text-gray-700 hover:text-gray-900"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Overskrift */}
            <h2 className="text-xl font-semibold mb-4">Baneinformasjon på kart</h2>

            {/* Innhold: Kart og informasjon */}
            <div className="flex flex-col md:flex-row gap-6">
              {/* Kart */}
              <div className="flex-1 h-[500px]">
                <CourseMap courseId={courseId} />
              </div>

              {/* Informasjonskomponent */}
              <div className="flex-1">
                <GolfInfo courseData={courseData} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MapModal;