"use client";

import { useState, useEffect } from "react";
import { auth, provider } from "@/lib/firebase"; // Make sure firebaseApp is imported
import { signInWithPopup, signOut } from "firebase/auth";

const ALLOWED_EMAIL = process.env.NEXT_PUBLIC_ALLOWED_EMAIL;

export default function LoginButton() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        setUser(authUser);
        if (ALLOWED_EMAIL && authUser.email !== ALLOWED_EMAIL) {
          signOut(auth);
          setUser(null);
          console.error("Unauthorized email");
          // Optionally, you can redirect the user or display an error message here
        }
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      // After successful sign-in, the onAuthStateChanged listener will handle the email check
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };
console.log("user: ", user?.email, "allowed: ", ALLOWED_EMAIL);
  return (
    <div>
      {user ? (
        <>
          
            <span className="mx-[2rem] text-white bg-gray-700 py-2 px-4 rounded-md">
              Hi, {user.displayName || user.email}
            </span>
          
          <button
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            onClick={logout}
          >
            Log Out
          </button>
        </>
      ) : (
        <button
          className="mx-[2rem] bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={login}
        >
          Sign in with Google
        </button>
      )}
    </div>
  );
}