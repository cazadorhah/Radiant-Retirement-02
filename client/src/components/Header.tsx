import { useState } from "react";
import { Link } from "wouter";
import { Sun, Menu } from "lucide-react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Sun className="h-6 w-6 text-accent" />
              <span className="text-xl font-bold text-primary">Radiant Retirement</span>
            </Link>
          </div>
          <div className="flex items-center">
            <nav className="hidden md:flex space-x-10">
              <Link href="/" className="text-gray-600 hover:text-primary">Home</Link>
              <Link href="/browse" className="text-gray-600 hover:text-primary">Browse States</Link>
              <Link href="/resources" className="text-gray-600 hover:text-primary">Resources</Link>
              <Link href="/about" className="text-gray-600 hover:text-primary">About</Link>
              <Link href="/contact" className="text-gray-600 hover:text-primary">Contact</Link>
            </nav>
          </div>
          <div className="flex items-center md:hidden">
            <button 
              type="button" 
              className="text-gray-600"
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link href="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100">Home</Link>
            <Link href="/browse" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100">Browse States</Link>
            <Link href="/resources" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100">Resources</Link>
            <Link href="/about" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100">About</Link>
            <Link href="/contact" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100">Contact</Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
