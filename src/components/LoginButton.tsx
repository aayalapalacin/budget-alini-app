"use client";

import { useState, useEffect } from "react";
import { auth, provider } from "@/lib/firebase";
import { signInWithPopup, signOut } from "firebase/auth";

const ALLOWED_EMAIL = process.env.NEXT_PUBLIC_ALLOWED_EMAIL;

export default function LoginButton() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        if (ALLOWED_EMAIL && authUser.email !== ALLOWED_EMAIL) {
          alert("Unauthorized email. Please use the correct account.");
          signOut(auth);
          setUser(null);
        } else {
          setUser(authUser);
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
      if (ALLOWED_EMAIL && result.user.email !== ALLOWED_EMAIL) {
        alert("Unauthorized email. Please use the correct account.");
        await signOut(auth);
        setUser(null);
      }
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