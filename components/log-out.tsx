// components/Logout.tsx
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase"; // Assuming your Firebase instance is initialized in this file
import { useAuthContext } from "@/lib/authContext";
import { Button } from "./ui/button";

const Logout = () => {
  const router = useRouter();
  const { setUser } = useAuthContext() || {}; // Accessing setUser from context

  const handleLogout = async () => {
    try {
      // Sign out the user from Firebase
      await signOut(auth);
      console.log("User signed out");

      // Clear user context
      if (setUser) {
        setUser(null);
      }

      // Redirect to login page
      router.push("/auth/login");
    } catch (error) {
      console.error("Error signing out: ", error);
      alert("An error occurred while logging out. Please try again.");
    }
  };

  return (
    <Button onClick={handleLogout} className="btn">
      Logout
    </Button>
  );
};

export default Logout;
