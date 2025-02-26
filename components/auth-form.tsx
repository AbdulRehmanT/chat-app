"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import {
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  setDoc,
  doc,
  db,
  getDoc,
  uploadBytes,
  getDownloadURL,
  storage,
  ref,
  GoogleAuthProvider,
  signInWithPopup,
} from "@/lib/firebase";
import { useRouter } from "next/navigation";

interface AuthFormProps {
  isSignup: boolean;
}

interface User {
  username?: string;
  email: string;
  password: string;
  image?: File | null;
}

export function AuthForm({ isSignup }: AuthFormProps) {
  const router = useRouter();

  const [user, setUser] = useState<User>({
    username: isSignup ? "" : undefined,
    email: "",
    password: "",
    image: null,
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  // Google login and signup handler
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setMessage("");
  
    const provider = new GoogleAuthProvider();
  
    try {
      // Google sign-in process
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
      console.log("User signed in with Google:", firebaseUser);
  
      // Check if the user is signing up
      if (isSignup) {
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        if (!userDoc.exists()) {
          // User doesn't exist, create a new user
          await setDoc(doc(db, "users", firebaseUser.uid), {
            username: firebaseUser.displayName || firebaseUser.email,
            email: firebaseUser.email,
            uid: firebaseUser.uid,
            imageUrl: firebaseUser.photoURL || "", // Save the avatar URL here
          });
          console.log("User saved to Firestore");
        }
      }
  
      // Ensure user data is saved and wait for it to complete
      setLoading(false);
  
      // Redirect to dashboard only after Firestore operation is confirmed
      router.push("/dashboard");
  
    } catch (err) {
      setLoading(false);
      console.error("Error with Google sign-in: ", err);
  
      // Handle error
      setMessage("Error: " + (err instanceof Error ? err.message : err));
    }
  };
  
  
  // Signup
  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!user.email || !user.password) {
      alert("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setMessage("");

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        user.email,
        user.password
      );
      const firebaseUser = userCredential.user;

      console.log("User created:", firebaseUser);

      let imageUrl = "";
      if (user.image) {
        const imageRef = ref(storage, `profile_pictures/${firebaseUser.uid}`);
        await uploadBytes(imageRef, user.image);
        imageUrl = await getDownloadURL(imageRef);
      }

      if (isSignup && user.username) {
        console.log("Saving user to Firestore...", {
          username: user.username,
          email: user.email,
          uid: firebaseUser.uid,
          imageUrl,
        });

        try {
          await setDoc(doc(db, "users", firebaseUser.uid), {
            username: user.username,
            email: user.email,
            uid: firebaseUser.uid,
            imageUrl,
          });
          console.log("User successfully saved to Firestore");
        } catch (error) {
          console.error("Error saving user to Firestore:", error);
          setMessage("Error saving user to Firestore. Please try again later.");
          setLoading(false);
          return;
        }
      }

      setLoading(false);
      setMessage("Account created successfully! Redirecting...");
      console.log("Redirecting to dashboard...");
      router.push("/dashboard");
    } catch (err) {
      setLoading(false);
      console.error("Error creating user: ", err);
      setMessage("Error: " + (err instanceof Error ? err.message : err));
    }
  };

  // Login
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!user.email || !user.password) {
      alert("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        user.email,
        user.password
      );
      const firebaseUser = userCredential.user;

      console.log("User logged in:", firebaseUser);

      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));

      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log("User data from Firestore:", userData);
        setLoading(false);
        router.push("/dashboard");
      } else {
        setLoading(false);
        console.error("No user data found in Firestore.");
        setMessage("No user data found.");
      }
    } catch (err) {
      setLoading(false);
      if (err instanceof Error) {
        console.error("Error logging in: ", err.message);
        setMessage("Error: " + err.message);
      } else {
        console.error("Error logging in: ", err);
        setMessage("Error: " + err);
      }
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {isSignup ? "Sign Up" : "Login"}
          </CardTitle>
          <CardDescription>
            {isSignup
              ? "Create your account by entering your email and password below"
              : "Enter your email and password to log in to your account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={isSignup ? handleSignup : handleLogin}>
            <div className="flex flex-col gap-6">
              {isSignup && (
                <div className="grid gap-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    value={user.username || ""}
                    onChange={(e) =>
                      setUser({ ...user, username: e.target.value })
                    }
                    placeholder="username"
                    required
                  />
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={user.email}
                  onChange={(e) => setUser({ ...user, email: e.target.value })}
                  placeholder="m@example.com"
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  {!isSignup && (
                    <Link
                      href="/auth/forgotpassword"
                      className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                    >
                      Forgot your password?
                    </Link>
                  )}
                </div>
                <Input
                  id="password"
                  type="password"
                  value={user.password}
                  onChange={(e) =>
                    setUser({ ...user, password: e.target.value })
                  }
                  required
                />
              </div>
              {isSignup && (
                <div className="grid gap-2">
                  <Label htmlFor="picture">Profile Photo</Label>
                  <Input id="picture" type="file" required />
                </div>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Loading..." : isSignup ? "Sign Up" : "Login"}
              </Button>
            </div>
            <div className="mt-4 text-center">
            <Button onClick={handleGoogleSignIn} variant="outline" className="w-full" disabled={loading}>
              {loading ? "Loading..." : isSignup ? "Sign Up with Google" : "Login with Google"}
            </Button>
          </div>
            {message && (
              <div
                className={`mt-4 text-center text-sm ${
                  message.includes("Error") ? "text-red-600" : "text-green-600"
                }`}
              >
                {message}
              </div>
            )}
            <div className="mt-4 text-center text-sm">
              {isSignup ? (
                <>
                  Already have an account?{" "}
                  <Link
                    href="/auth/login"
                    className="underline underline-offset-4"
                  >
                    Login
                  </Link>
                </>
              ) : (
                <>
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/auth/signup"
                    className="underline underline-offset-4"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </form>


          
        </CardContent>
      </Card>
    </div>
  );
}
