import { Navbar } from "./_components/navbar";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

const ProtectedLayout = ({ children }: ProtectedLayoutProps) => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-gray-100">
      <Navbar />
      <main className="w-full flex flex-col items-center mt-4 lg:mt-2">
        {children}
      </main>
    </div>
  );
};

export default ProtectedLayout;
