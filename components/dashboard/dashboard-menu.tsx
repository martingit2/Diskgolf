import Link from "next/link";

const DashboardMenu = () => {
  return (
    <div className="hidden md:block w-[14%] bg-blue-950 p-4 overflow-y-auto">
      <nav className="mt-4 space-y-4 text-white">
        <Link href="/user/settings" className="block hover:underline">
          Innstillinger
        </Link>
        <Link href="/user/stats" className="block hover:underline">
          Statistikk
        </Link>
      </nav>
    </div>
  );
};

export default DashboardMenu;
