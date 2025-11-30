import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Navbar = () => {
  return (
    <div className="bg-gray-800 border-b border-green-500">
      <nav className="bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <img src="/logo.png" alt="Logo" width={150} height={50} />
            </div>
            <div className="flex space-x-4">
              <Link to="/login">
                <Button variant="outline" className="border-green-500 text-green-400 hover:bg-green-500/10">
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-green-500 text-gray-900 hover:bg-green-400">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;