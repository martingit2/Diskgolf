"use client";

import { useSession } from "next-auth/react";
import MapAdminComponent from "@/components/MapAdminComponent";

const AdminDashboard = () => {
  const { data: session, status } = useSession();

  // ✅ Forhindrer hydration error ved å vente til session er lastet
  if (status === "loading") {
    return <p>Laster inn...</p>;
  }

  if (!session || session.user.role !== "ADMIN") {
    return <p>Du har ikke tilgang til denne siden.</p>;
  }

  return (
    <div>
      {/* ✅ Fjernet ekstra duplikat av tittel */}
      <MapAdminComponent />
    </div>
  );
};

export default AdminDashboard;
