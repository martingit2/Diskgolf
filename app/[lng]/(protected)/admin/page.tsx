// app/(protected)/admin/page.tsx
"use client";

import { useState } from "react";
import { admin } from "@/app/actions/admin"; // Server action for admin check
import { getUsers } from "@/app/actions/get-users"; // Server action to fetch users
import { deleteUserByAdmin } from "@/app/actions/delete-user-by-admin"; // Server action for admin to delete user
import { deleteRecentTestData } from "@/app/actions/delete-recent-test-data"; // Server action to delete recent data
import { RoleGate } from "@/components/auth/role-gate"; // Component to restrict access based on role
import { FormSuccess } from "@/components/form-success"; // Component to display success messages
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { UserRole, User } from "@prisma/client"; // Prisma types
import toast from "react-hot-toast"; // For user feedback notifications
import { Trash2, Users, RefreshCw, AlertTriangle, Hourglass } from "lucide-react"; // Icons
import LoadingSpinner from "@/components/ui/loading-spinner"; // Loading indicator component
import { useSession } from "next-auth/react"; // Hook to access session data

// Type definition for user data, excluding sensitive fields
type SafeUser = Omit<User, "hashedPassword" | "emailVerified" | "accounts" | "twoFactorConfirmation">;

/**
 * AdminPage component providing an interface for administrators.
 * Includes functionality for testing access, managing users, and clearing test data.
 */
const AdminPage = () => {
  const { data: session } = useSession(); // Get current session information
  const [userList, setUserList] = useState<SafeUser[]>([]); // State for the list of users
  const [isLoadingUsers, setIsLoadingUsers] = useState(false); // State for loading users
  const [isProcessing, setIsProcessing] = useState(false); // General state for ongoing delete operations

  // Handler for the server action test button
  const onServerActionClick = () => {
    admin().then((data) => {
      if (data.error) {
        toast.error(data.error);
      }
      if (data.success) {
        toast.success(data.success);
      }
    });
  };

  // Handler for the API route test button
  const onApiRouteClick = () => {
    fetch("/api/admin").then((response) => {
      if (response.ok) {
        toast.success("Tilgang til API Route tillatt!");
      } else {
        toast.error("Ingen tilgang til API Route!");
      }
    });
  };

  // Handler to fetch the list of users
  const handleGetUsers = async () => {
    setIsLoadingUsers(true);
    toast.loading("Henter brukere...", { id: "get-users-toast" });
    const result = await getUsers();
    if (result.success && result.users) {
      setUserList(result.users);
      toast.success(`Fant ${result.users.length} brukere.`, { id: "get-users-toast" });
    } else {
      toast.error(result.error || "Ukjent feil ved henting av brukere.", { id: "get-users-toast" });
      setUserList([]); // Clear list on error
    }
    setIsLoadingUsers(false);
  };

  // Handler to delete a specific user (triggered by admin)
  const handleDeleteUser = async (userId: string, userName: string | null) => {
    // Prevent admin from deleting themselves via this list
    if (session?.user?.id === userId) {
        toast.error("Du kan ikke slette din egen konto fra denne listen.");
        return;
    }

    // Confirmation dialog
    const confirmed = window.confirm(`Er du sikker på at du vil slette brukeren "${userName || userId}" og all tilknyttet data? Dette kan ikke angres.`);
    if (!confirmed) return;

    setIsProcessing(true);
    const toastId = toast.loading(`Sletter bruker ${userName || userId}...`);
    const result = await deleteUserByAdmin(userId); // Call the specific admin delete action
    if (result.success) {
      toast.success(result.success, { id: toastId });
      // Update the user list locally for immediate feedback
      setUserList(prev => prev.filter(u => u.id !== userId));
    } else {
      toast.error(result.error || "Ukjent feil ved sletting.", { id: toastId });
    }
    setIsProcessing(false);
  };

  // Handler to delete recent test data
  const handleDeleteRecent = async () => {
    // Confirmation dialog
    const confirmed = window.confirm(`Er du sikker på at du vil slette alle testdata (brukere (unntatt deg), baner, turneringer, spill etc.) opprettet de siste 6 timene? Dette kan IKKE angres.`);
    if (!confirmed) return;

    setIsProcessing(true);
    const toastId = toast.loading("Sletter nylige testdata...");
    const result = await deleteRecentTestData(); // Uses default 6 hours
    if (result.success && result.counts) {
        // Format a string showing what was deleted
        const deletedCountsString = Object.entries(result.counts)
            .filter(([, count]) => count > 0) // Only show models where something was deleted
            .map(([key, count]) => `${count} ${key}`)
            .join(', ');
        toast.success(`${result.success} Slettet: ${deletedCountsString || 'Ingenting'}`, { id: toastId, duration: 6000 });
         // Refresh user list if users were deleted
         if (result.counts.users > 0) {
             handleGetUsers();
         }
    } else if (result.success) {
         // Success message even if nothing was deleted
         toast.success(result.success + " Ingenting ble slettet.", { id: toastId });
    } else {
      // Error message
      toast.error(result.error || "Ukjent feil ved sletting av testdata.", { id: toastId });
    }
    setIsProcessing(false);
  };


  return (
    // Use RoleGate to protect the entire page content for ADMIN role only
     <RoleGate allowedRole={UserRole.ADMIN}>
        <div className="min-h-screen bg-gray-100 flex justify-center items-start py-4">
            {/* Main content container */}
            <div className="w-full max-w-5xl p-4 space-y-6">

                {/* Admin Panel Title Card */}
                <Card className="shadow-md">
                    <CardHeader>
                        <p className="text-2xl font-semibold text-center">
                        🔑 Adminpanel
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormSuccess message="Du er logget inn som administrator." />
                        {/* Access Test Buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-between rounded-lg border p-3 shadow-sm gap-2">
                        <p className="text-sm font-medium">Admin-kun API Route Test</p>
                        <Button onClick={onApiRouteClick} size="sm">Klikk for å teste</Button>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center justify-between rounded-lg border p-3 shadow-sm gap-2">
                        <p className="text-sm font-medium">Admin-kun Server Action Test</p>
                        <Button onClick={onServerActionClick} size="sm">Klikk for å teste</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* User Management Section */}
                <Card className="shadow-md">
                    <CardHeader>
                        <p className="text-xl font-semibold">Brukeradministrasjon</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Button to load/refresh the user list */}
                        <Button onClick={handleGetUsers} disabled={isLoadingUsers || isProcessing}>
                        {isLoadingUsers ? <LoadingSpinner size="sm" className="mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                        Last inn / Oppdater Brukerliste
                        </Button>

                        {/* Display loading indicator or user table */}
                        {isLoadingUsers && <div className="flex justify-center p-4"><LoadingSpinner text="Laster brukere..." /></div> }
                        {!isLoadingUsers && userList.length > 0 && (
                        <div className="overflow-x-auto border rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Navn</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">E-post</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rolle</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Opprettet</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Handling</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {/* Map through the user list and render table rows */}
                                {userList.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{user.name || <span className="italic text-gray-400">Mangler navn</span>}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{user.email || <span className="italic text-gray-400">Mangler e-post</span>}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{user.role}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500" title={user.createdAt.toISOString()}>{new Date(user.createdAt).toLocaleDateString('nb-NO')}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                                    {/* Render delete button only if the user is not the currently logged-in admin */}
                                    {session?.user?.id !== user.id ? (
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleDeleteUser(user.id, user.name)}
                                            disabled={isProcessing} // Disable while another delete is processing
                                        >
                                            <Trash2 className="w-4 h-4 mr-1" /> Slett
                                        </Button>
                                    ) : (
                                        // Indicate that this is the admin's own account
                                        <span className="text-xs text-gray-400 italic">Deg selv</span>
                                    )}
                                    </td>
                                </tr>
                                ))}
                            </tbody>
                            </table>
                        </div>
                        )}
                        {/* Message shown if no users are loaded or found */}
                        {!isLoadingUsers && userList.length === 0 && <p className="text-sm text-gray-500">Ingen brukere funnet (eller listen er ikke lastet inn).</p>}
                    </CardContent>
                </Card>

                {/* Section for Deleting Recent Test Data */}
                 <Card className="shadow-md border border-orange-300">
                    <CardHeader>
                        <p className="text-xl font-semibold text-orange-700 flex items-center">
                            <AlertTriangle className="w-5 h-5 mr-2 text-orange-600" /> Slett Nylige Testdata
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <p className="text-sm text-gray-600">
                             Denne handlingen vil permanent slette data (brukere (unntatt deg), baner, turneringer, spill etc.) som er opprettet de siste 6 timene.
                             Bruk med forsiktighet - dette kan ikke angres!
                         </p>
                         {/* Button to trigger the deletion of recent data */}
                        <Button
                            variant="destructive"
                            onClick={handleDeleteRecent}
                            disabled={isProcessing} // Disable while another operation is processing
                        >
                            {isProcessing ? <LoadingSpinner size="sm" className="mr-2" /> : <Hourglass className="w-4 h-4 mr-2" />}
                             Slett Testdata (Siste 6 Timer)
                        </Button>
                    </CardContent>
                </Card>

            </div>
        </div>
    </RoleGate>
  );
};

export default AdminPage;