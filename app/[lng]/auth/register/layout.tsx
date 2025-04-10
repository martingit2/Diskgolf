/** 
 * Filnavn: layout.tsx
 * Beskrivelse: Layout-komponent for autentiseringssider. 
 * Sentraliserer autentiseringsrelaterte sider og komponenter i brukergrensesnittet for en bedre brukeropplevelse.
 * Utvikler: Martin Pettersen
 */



const AuthLayout = ({ children }: { children: React.ReactNode }) => {
    return (
      <div
        className="
            h-full flex items-center justify-center"
      >
        {children}
      </div>
    );
  };
  
  export default AuthLayout;