import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { City } from "@shared/types";
import SearchBar from "@/components/SearchBar";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRightCircle, Building, MapPin, Loader2, Star } from "lucide-react";
import HomeLink from "@/components/HomeLink";

const stateFullNames: Record<string, string> = {
  'AL': 'Alabama',
  'AK': 'Alaska',
  'AZ': 'Arizona',
  'AR': 'Arkansas',
  'CA': 'California',
  'CO': 'Colorado',
  'CT': 'Connecticut',
  'DE': 'Delaware',
  'FL': 'Florida',
  'GA': 'Georgia',
  'HI': 'Hawaii',
  'ID': 'Idaho',
  'IL': 'Illinois',
  'IN': 'Indiana',
  'IA': 'Iowa',
  'KS': 'Kansas',
  'KY': 'Kentucky',
  'LA': 'Louisiana',
  'ME': 'Maine',
  'MD': 'Maryland',
  'MA': 'Massachusetts',
  'MI': 'Michigan',
  'MN': 'Minnesota',
  'MS': 'Mississippi',
  'MO': 'Missouri',
  'MT': 'Montana',
  'NE': 'Nebraska',
  'NV': 'Nevada',
  'NH': 'New Hampshire',
  'NJ': 'New Jersey',
  'NM': 'New Mexico',
  'NY': 'New York',
  'NC': 'North Carolina',
  'ND': 'North Dakota',
  'OH': 'Ohio',
  'OK': 'Oklahoma',
  'OR': 'Oregon',
  'PA': 'Pennsylvania',
  'RI': 'Rhode Island',
  'SC': 'South Carolina',
  'SD': 'South Dakota',
  'TN': 'Tennessee',
  'TX': 'Texas',
  'UT': 'Utah',
  'VT': 'Vermont',
  'VA': 'Virginia',
  'WA': 'Washington',
  'WV': 'West Virginia',
  'WI': 'Wisconsin',
  'WY': 'Wyoming',
  'DC': 'District of Columbia'
};

const getStateFullName = (stateCode: string): string => {
  return stateFullNames[stateCode] || stateCode;
};

const BrowsePage = () => {
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const params = useParams<{ stateCode: string }>();
  const [, setLocation] = useLocation();
  
  // Set selected state based on URL params when component mounts or params change
  useEffect(() => {
    if (params.stateCode && params.stateCode !== selectedState) {
      setSelectedState(params.stateCode);
    }
  }, [params.stateCode, selectedState]);

  // Fetch all states
  const { data: states, isLoading: isLoadingStates } = useQuery<string[]>({
    queryKey: ["/api/states"],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch cities for the selected state
  const { data: cities, isLoading: isLoadingCities } = useQuery<City[]>({
    queryKey: [`/api/states/${selectedState}/cities`],
    enabled: !!selectedState,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const handleBackToStates = () => {
    setSelectedState(null);
    setLocation('/browse');
  };

  return (
    <>
      <Helmet>
        <title>
          {selectedState
            ? `Senior Living in ${getStateFullName(selectedState)} | Radiant Retirement`
            : "Browse Senior Living by State | Radiant Retirement"}
        </title>
        <meta
          name="description"
          content={
            selectedState
              ? `Find top-rated senior living facilities in ${getStateFullName(
                  selectedState
                )}. Browse by city to discover the perfect retirement community.`
              : "Browse senior living options by state. Find retirement communities, assisted living, and memory care facilities across the United States."
          }
        />
      </Helmet>

      <SearchBar />

      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              {selectedState
                ? `Senior Living in ${getStateFullName(selectedState)}`
                : "Browse Senior Living by State"}
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              {selectedState
                ? `Explore senior living options in ${getStateFullName(
                    selectedState
                  )} by city`
                : "Select a state to explore senior living facilities"}
            </p>
          </div>

          {isLoadingStates ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {!selectedState && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {states?.map((state) => (
                    <HomeLink 
                      key={state} 
                      href={`/browse/${state}`}
                      className="block"
                    >
                      <Card className="hover:shadow-md transition cursor-pointer h-full">
                        <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
                          <MapPin className="h-8 w-8 text-primary mb-2" />
                          <h2 className="font-semibold text-lg">{getStateFullName(state)}</h2>
                          <p className="text-sm text-gray-500 mt-1">{state}</p>
                        </CardContent>
                      </Card>
                    </HomeLink>
                  ))}
                </div>
              )}

              {selectedState && (
                <>
                  <div className="mb-8">
                    <Button
                      variant="outline"
                      onClick={handleBackToStates}
                      className="flex items-center gap-2"
                    >
                      <ArrowRightCircle className="h-4 w-4 rotate-180" />
                      Back to All States
                    </Button>
                  </div>

                  {isLoadingCities ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    </div>
                  ) : cities && cities.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {cities.map((city) => (
                        <HomeLink
                          key={`${city.name}-${city.state}`}
                          href={`/city/${encodeURIComponent(`${city.name}-${city.state}`)}`}
                          className="block"
                        >
                          <Card className="hover:shadow-md transition cursor-pointer h-full">
                            <CardHeader className="pb-2">
                              <CardTitle>{city.name}</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-gray-600 mb-4">
                                Population: {city.population.toLocaleString()}
                              </p>
                              <p className="text-gray-700 mb-4">
                                Explore senior living options in {city.name}, {city.state}.
                              </p>
                              <div className="flex gap-4 text-sm">
                                <div className="flex items-center">
                                  <Building className="h-4 w-4 text-primary mr-1" />
                                  <span>5+ Facilities</span>
                                </div>
                                <div className="flex items-center">
                                  <Star className="h-4 w-4 text-accent mr-1" />
                                  <span>
                                    {city.name === "New York" && city.state === "NY" ? "4.4" : 
                                    city.name === "Los Angeles" && city.state === "CA" ? "4.2" : 
                                    city.name === "Chicago" && city.state === "IL" ? "4.1" : 
                                    city.name === "Philadelphia" && city.state === "PA" ? "4.2" : 
                                    (3.7 + (city.id % 15) / 10).toFixed(1)} Rating
                                  </span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </HomeLink>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-lg text-gray-600">No cities found for {getStateFullName(selectedState)}.</p>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
};

export default BrowsePage;