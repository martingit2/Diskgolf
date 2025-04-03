"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { X, MapPin, Info, ArrowRight, Disc } from "lucide-react";

// Dynamisk import av CourseMap og spesifiser props
const CourseMap = dynamic(() => import("@/components/CourseMap"), {
  ssr: false,
  loading: () => <p>Laster inn kart...</p>,
}) as React.FC<{ courseId: string }>;

/*
  Hjelpefunksjoner:

  - calculateDistance: Bruker haversine-formelen for å beregne avstanden mellom to koordinater (i meter).
  - pointToSegmentDistance: Beregner den korteste avstanden fra et punkt til et linjesegment.
  - distanceFromPointToPolygon: Går gjennom alle segmentene i en polygon og returnerer den minste avstanden.
*/
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Jordens radius i kilometer
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c * 1000; // meter
};

const pointToSegmentDistance = (
  point: [number, number],
  segStart: [number, number],
  segEnd: [number, number]
): number => {
  const [px, py] = point;
  const [ax, ay] = segStart;
  const [bx, by] = segEnd;
  const A = px - ax;
  const B = py - ay;
  const C = bx - ax;
  const D = by - ay;
  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = lenSq !== 0 ? dot / lenSq : -1;
  let xx, yy;
  if (param < 0) {
    xx = ax;
    yy = ay;
  } else if (param > 1) {
    xx = bx;
    yy = by;
  } else {
    xx = ax + param * C;
    yy = ay + param * D;
  }
  return calculateDistance(px, py, xx, yy);
};

const distanceFromPointToPolygon = (
  point: [number, number],
  polygon: [number, number][]
): number => {
  let minDistance = Infinity;
  for (let i = 0; i < polygon.length; i++) {
    const next = (i + 1) % polygon.length;
    const dist = pointToSegmentDistance(point, polygon[i], polygon[next]);
    if (dist < minDistance) {
      minDistance = dist;
    }
  }
  return minDistance;
};

const GolfInfo = ({ courseData }: { courseData: any }) => {
  if (!courseData) return null;

  // Beregn avstand mellom tee og kurv
  const calculateTeeToBasketDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    return calculateDistance(lat1, lon1, lat2, lon2).toFixed(0);
  };

  return (
    <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Info className="w-5 h-5 text-blue-600" /> 
        Baneinformasjon
      </h3>

      {/* Generell informasjon */}
      <div className="space-y-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h4 className="font-semibold text-gray-800">Generell informasjon</h4>
          <p>
            <strong>Sted:</strong> {courseData.location}
          </p>
          <p>
            <strong>Vanskelighetsgrad:</strong> {courseData.difficulty}
          </p>
          <p>
            <strong>Antall hull:</strong> {courseData.numHoles}
          </p>
          <p>
            <strong>Total lengde:</strong> {courseData.totalDistance?.toFixed(0)} meter
          </p>
        </div>

        {/* Avstander mellom tee og kurv */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h4 className="font-semibold text-gray-800">Avstand mellom Tee og Kurv</h4>
          <ul className="space-y-2">
            {courseData.start?.map((startPoint: any, index: number) => {
              const basket = courseData.baskets?.[index];
              if (!basket) return null;
              const distance = calculateTeeToBasketDistance(
                startPoint.latitude,
                startPoint.longitude,
                basket.latitude,
                basket.longitude
              );
              return (
                <li key={index} className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-gray-500" />
                  <span>
                    Tee {index + 1} til Kurv {index + 1}:{" "}
                    <strong>{distance} meter</strong>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Out of Bounds informasjon */}
        {courseData.obZones?.length > 0 && (
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h4 className="font-semibold text-gray-800">Out of Bounds</h4>
            <ul className="space-y-4">
              {courseData.obZones.map((obZone: any, index: number) => {
                let extraInfo = null;
                if (obZone.type === "polygon" && obZone.points) {
                  // Beregn minimumsavstand fra alle tee-punkter og kurv-punkter til OB-polygonen
                  const teeDistances =
                    courseData.start && courseData.start.length > 0
                      ? courseData.start.map((tee: any) =>
                          distanceFromPointToPolygon(
                            [tee.latitude, tee.longitude],
                            obZone.points
                          )
                        )
                      : [];
                  const basketDistances =
                    courseData.baskets && courseData.baskets.length > 0
                      ? courseData.baskets.map((basket: any) =>
                          distanceFromPointToPolygon(
                            [basket.latitude, basket.longitude],
                            obZone.points
                          )
                        )
                      : [];
                  const minTeeDistance =
                    teeDistances.length > 0 ? Math.min(...teeDistances) : Infinity;
                  const minBasketDistance =
                    basketDistances.length > 0 ? Math.min(...basketDistances) : Infinity;

                  extraInfo = (
                    <div className="text-sm">
                      <p>
                        <strong>Avstand til OB-grense:</strong>
                      </p>
                      <p>
                        Fra Tee:{" "}
                        {minTeeDistance === Infinity ? "N/A" : minTeeDistance.toFixed(0)} meter
                      </p>
                      <p>
                        Fra Kurv:{" "}
                        {minBasketDistance === Infinity ? "N/A" : minBasketDistance.toFixed(0)} meter
                      </p>
                      <p className="mt-1 text-gray-600 text-xs">
                        Disse avstandene angir hvor nær OB-området begynner i forhold til din Tee- eller Kurv-posisjon.
                      </p>
                    </div>
                  );
                } else if (obZone.type === "circle") {
                  extraInfo = (
                    <div className="text-sm">
                      <p>
  Sirkel: Midtpunkt (Lat: {obZone.lat ? obZone.lat.toFixed(4) : "N/A"}, Lng: {obZone.lng ? obZone.lng.toFixed(4) : "N/A"})
</p>

                      <p className="mt-1 text-gray-600 text-xs">
                        Avstanden fra Tee eller Kurv til OB-grensen for sirkelen må beregnes separat.
                      </p>
                    </div>
                  );
                }
                return (
                  <li key={index} className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <Disc className="w-4 h-4 text-red-500" />
                      <span>
                        OB-område {index + 1}
                      </span>
                    </div>
                    {extraInfo}
                  </li>
                );
              })}
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
          if (!response.ok) {
            throw new Error("Kunne ikke hente baneinformasjon");
          }
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
      <Button
        onClick={toggleModal}
        className="bg-yellow-700 hover:bg-gray-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md flex items-center gap-2"
      >
        <MapPin className="w-5 h-5" />
        Bane Kart
      </Button>
  
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative w-11/12 rounded-lg bg-white p-6 shadow-lg md:w-3/4 lg:w-2/3 xl:w-1/2">
            <button
              onClick={toggleModal}
              className="absolute top-3 right-3 text-gray-700 hover:text-gray-900"
            >
              <X className="w-6 h-6" />
            </button>
  
            <h2 className="mb-4 text-xl font-semibold">Baneinformasjon på kart</h2>
  
            {/*
              Her bruker vi:
              - flex-col (stacked på mobil) og md:flex-row (side om side på desktop)
              - h-[80vh] for å gi modalens innhold en fast høyde
              - overflow-hidden på den ytre flex-beholderen for å unngå dobbel scroll
              - overflow-y-auto kun på informasjonspanelet
            */}
            <div className="flex h-[80vh] flex-col md:flex-row overflow-hidden">
              {/* Kart-del */}
              <div className="flex-1 md:w-1/2 min-h-[300px]">
                {courseData ? (
                  <CourseMap courseId={courseId} />
                ) : (
                  <p>Laster inn baneinformasjon...</p>
                )}
              </div>
  
              {/* Info-del med scroll */}
              <div className="flex-1 md:w-1/2 min-h-[300px] overflow-y-auto">
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