import React from 'react'
import DashboardNavbar from '@/components/dashboard/dashboard-navbar'

const Page = () => {
  return (
    <div className="flex min-h-screen">
      {/* Dashboard Navbar */}
      <DashboardNavbar userRole="bruker" /> {/* Passer brukerrolle her */}

      <div className="flex-grow p-6">
        {/* Main Content */}
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>
        <div>
          {/* Legg til innholdet ditt her */}
          <p>Velkommen til dashboardet!</p>
        </div>
      </div>
    </div>
  )
}

export default Page
