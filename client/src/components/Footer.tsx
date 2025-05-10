import { Link } from "wouter";
import {
  Sun,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center space-x-2">
              <Sun className="h-6 w-6 text-accent" />
              <span className="text-xl font-bold">Radiant Retirement</span>
            </div>
            <p className="mt-4 text-gray-300">
              Helping seniors find the perfect retirement home across the United
              States.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Popular Cities</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/city/New%20York-NY"
                  className="text-gray-300 hover:text-white"
                >
                  New York, NY
                </Link>
              </li>
              <li>
                <Link
                  href="/city/Los%20Angeles-CA"
                  className="text-gray-300 hover:text-white"
                >
                  Los Angeles, CA
                </Link>
              </li>
              <li>
                <Link
                  href="/city/Chicago-IL"
                  className="text-gray-300 hover:text-white"
                >
                  Chicago, IL
                </Link>
              </li>
              <li>
                <Link
                  href="/city/Houston-TX"
                  className="text-gray-300 hover:text-white"
                >
                  Houston, TX
                </Link>
              </li>
              <li>
                <Link
                  href="/city/Phoenix-AZ"
                  className="text-gray-300 hover:text-white"
                >
                  Phoenix, AZ
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Browse States</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/browse/CA"
                  className="text-gray-300 hover:text-white"
                >
                  California
                </Link>
              </li>
              <li>
                <Link
                  href="/browse/FL"
                  className="text-gray-300 hover:text-white"
                >
                  Florida
                </Link>
              </li>
              <li>
                <Link
                  href="/browse/TX"
                  className="text-gray-300 hover:text-white"
                >
                  Texas
                </Link>
              </li>
              <li>
                <Link
                  href="/browse/NY"
                  className="text-gray-300 hover:text-white"
                >
                  New York
                </Link>
              </li>
              <li>
                <Link href="/browse" className="text-gray-300 hover:text-white">
                  All States
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">
              &copy; {new Date().getFullYear()} Radiant Retirement. All rights
              reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
