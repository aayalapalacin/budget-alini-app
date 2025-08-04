"use client";

import { useState, useEffect } from "react";
import { auth, provider } from "@/lib/firebase";
import {
  signInWithPopup,
  signInWithRedirect, // Import signInWithRedirect
  signOut,
  getRedirectResult, // Import getRedirectResult
} from "firebase/auth";

const ALLOWED_EMAIL = process.env.NEXT_PUBLIC_ALLOWED_EMAIL;

export default function LoginButton() {
  const [user, setUser] = useState<any>(null); // Consider a more specific type for user (firebase.User)

  // useEffect to handle the authentication state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        // First, set the user
        setUser(authUser);

        // Then, check if the email is allowed
        if (ALLOWED_EMAIL && authUser.email !== ALLOWED_EMAIL) {
          signOut(auth); // Sign out unauthorized users
          setUser(null);
          console.error("Unauthorized email:", authUser.email);
        }
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  // NEW useEffect to handle redirect results specifically
  useEffect(() => {
    const handleRedirectSignIn = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          // This block runs when redirected back from Google sign-in
          const authUser = result.user;
          console.log("Signed in via redirect:", authUser.email);

          // The onAuthStateChanged listener above will also catch this,
          // but explicitly handling it here ensures immediate state update
          // if there's any delay with onAuthStateChanged.
          // It's also where you'd typically handle successful redirect sign-ins
          // like navigation or setting specific states.
          if (ALLOWED_EMAIL && authUser.email !== ALLOWED_EMAIL) {
            signOut(auth);
            setUser(null); // Ensure unauthorized user is not set
            console.error("Unauthorized email after redirect:", authUser.email);
          } else {
            setUser(authUser); // Set user if authorized
          }
        }
      } catch (error: any) {
        console.error("Error during redirect sign-in:", error);
        // Handle specific redirect errors, e.g., user cancelled
        if (
          error.code === "auth/cancelled-popup-request" ||
          error.code === "auth/popup-closed-by-user"
        ) {
          console.log("Sign-in process was cancelled or popup was closed.");
          // You might want to display a more user-friendly message here
        }
      }
    };

    handleRedirectSignIn();
  }, []); // Run only once on component mount

  const login = async () => {
    try {
      // Determine if we should use redirect or popup
      // Simple check for mobile screen width or user agent
      const isMobileDevice =
        window.innerWidth <= 768 ||
        /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

      if (isMobileDevice) {
        console.log("Using signInWithRedirect for mobile device...");
        await signInWithRedirect(auth, provider);
        // Important: No code here after signInWithRedirect, as the page will fully reload
        // and the 'getRedirectResult' useEffect will handle the result.
      } else {
        console.log("Using signInWithPopup for desktop device...");
        const result = await signInWithPopup(auth, provider);
        // This code runs immediately after popup closes on desktop
        const authUser = result.user;
        console.log("Signed in via popup:", authUser.email);
        // onAuthStateChanged will handle setting the user and authorization check.
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
          {/* Your existing display logic for logged-in user */}
          {user.email === ALLOWED_EMAIL ? (
            <span className="mx-[2rem] text-white bg-gray-700 py-2 px-4 rounded-md">
              Hi, {user.displayName || user.email}
            </span>
          ) : (
            <span className="mx-[2rem] text-yellow-500 bg-gray-700 py-2 px-4 rounded-md">
              Unauthorized User
            </span>
          )}
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
