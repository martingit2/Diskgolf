"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

// Dynamisk import av CourseMap og spesifiser props
const CourseMap = dynamic(() => import("@/components/CourseMap"), {
  ssr: false,
  loading: () => <p>Laster inn kart...</p>,
}) as React.FC<{ courseId: string }>;

const MapModal = ({ courseId }: { courseId: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleModal = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Knapp for å åpne modalen */}
      <Button 
        onClick={toggleModal} 
        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition-all duration-300"
      >
        Bane Kart
      </Button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 md:w-3/4 lg:w-1/2 relative">
            {/* Lukkeknapp */}
            <button 
              onClick={toggleModal} 
              className="absolute top-3 right-3 text-gray-700 hover:text-gray-900"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Overskrift */}
            <h2 className="text-xl font-semibold mb-4">Baneinformasjon på kart</h2>

            {/* Leaflet Kart */}
            <div className="w-full h-[500px]">
              <CourseMap courseId={courseId} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MapModal;
