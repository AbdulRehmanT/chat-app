import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuthContext } from "@/lib/authContext";
import { Button } from "./ui/button";

const Logout = () => {
  const router = useRouter();
  const { setUser } = useAuthContext() || {};

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("User signed out");

      if (setUser) {
        setUser(null);
      }

      router.push("/");
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
