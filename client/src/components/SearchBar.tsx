import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Search } from "lucide-react";
import { City } from "@shared/types";

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [, setLocation] = useLocation();
  const searchRef = useRef<HTMLDivElement>(null);

  const { data: cities } = useQuery<City[]>({
    queryKey: ["/api/cities"],
  });

  const filteredCities = cities?.filter(city => {
    const searchTermLower = searchTerm.toLowerCase();
    return city.name.toLowerCase().includes(searchTermLower) ||
           city.state.toLowerCase().includes(searchTermLower) ||
           (city.stateName?.toLowerCase() || '').includes(searchTermLower);
  }).slice(0, 10) || [];

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setShowResults(e.target.value.length > 0);
  };

  const handleCitySelect = (cityName: string) => {
    setSearchTerm("");
    setShowResults(false);
    setLocation(`/city/${encodeURIComponent(cityName)}`);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="hero-gradient py-6 bg-opacity-90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <p className="text-white text-center mb-4 font-semibold drop-shadow-sm">
            Find senior living options in over 1,000 U.S. cities
          </p>
          <div className="relative" ref={searchRef}>
            <div className="flex items-center bg-white rounded-lg shadow-md overflow-hidden border border-muted/30">
              <div className="px-3 py-2">
                <Search className="h-5 w-5 text-secondary" />
              </div>
              <input
                type="text"
                placeholder="Search city or zip code..."
                className="py-2 flex-1 focus:outline-none text-gray-800"
                value={searchTerm}
                onChange={handleSearch}
                onFocus={() => setShowResults(searchTerm.length > 0)}
              />
              <button className="bg-primary text-white px-5 py-2 font-medium hover:bg-primary/90 transition shadow-sm">
                Search
              </button>
            </div>
            {showResults && (
              <div className="absolute w-full bg-white mt-1 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto border border-muted/50">
                <div className="p-2">
                  {filteredCities.length > 0 ? (
                    filteredCities.map((city) => (
                      <div
                        key={`${city.name}-${city.state}`}
                        className="cursor-pointer p-2 hover:bg-accent/10 hover:text-accent rounded transition-colors"
                        onClick={() => handleCitySelect(`${city.name}-${city.state}`)}
                      >
                        <div className="flex justify-between">
                          <span className="text-gray-800 font-medium">
                            {city.name}, {city.stateName ? `${city.stateName} (${city.state})` : city.state}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-2 text-gray-700 font-medium">No cities found</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
