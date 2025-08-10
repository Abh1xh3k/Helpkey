'use client';

import { useState } from 'react';
import Link from 'next/link';
import SignInModal from './SignInModal';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user, signOut, loading } = useAuth();

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-blue-600">HelpKey</Link>
        
        <nav className="hidden md:flex space-x-8">
          <Link href="/" className="text-gray-600 hover:text-blue-600 transition-colors">Home</Link>
          <Link href="/hotels" className="text-gray-600 hover:text-blue-600 transition-colors">Hotels</Link>
          <Link href="/about" className="text-gray-600 hover:text-blue-600 transition-colors">About</Link>
          <Link href="/contact" className="text-gray-600 hover:text-blue-600 transition-colors">Contact</Link>
        </nav>
        
        <div className="flex items-center space-x-4">
          {!loading && (
            user ? (
              <div className="relative">
                <button 
                  onClick={toggleDropdown}
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <span>{user.displayName || user.email}</span>
                  <i className="ri-arrow-down-s-line"></i>
                </button>
                <div className={`absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-10 ${isDropdownOpen ? 'block' : 'hidden'}`}>
                  <Link href="/bookings" className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                    My Bookings
                  </Link>
                  <Link href="/profile" className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                    Profile
                  </Link>
                  <button 
                    onClick={signOut}
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => setIsSignInModalOpen(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Sign In
              </button>
            )
          )}
        </div>
      </div>
      
      <SignInModal 
        isOpen={isSignInModalOpen} 
        onClose={() => setIsSignInModalOpen(false)} 
      />
    </header>
  );
}