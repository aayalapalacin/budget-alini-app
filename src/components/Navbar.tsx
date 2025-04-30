// src/components/Navbar.tsx
"use client";

import React from 'react';
import LoginButton from './LoginButton';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex items-center justify-between">
        {/* Title/Brand on the left */}
        <div>
          <span className="text-white text-xl font-bold">Budget Alini</span>
        </div>

        {/* Simple button on the right */}
        <div>
          <LoginButton />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
