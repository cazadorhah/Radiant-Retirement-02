import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { City, Facility } from "@shared/types";
import SearchBar from "@/components/SearchBar";
import ContactForm from "@/components/ContactForm";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Building, Star, MessageSquare, Hospital, Bus, Leaf } from "lucide-react";
import { Helmet } from "react-helmet";

const CityPage = () => {
  const { cityName } = useParams();
  // Split city name and state (format: cityName-state)
  const [name, state] = decodeURIComponent(cityName || "").split("-");

  const { data: city, isLoading: isLoadingCity } = useQuery<City>({
    queryKey: [`/api/cities/${encodeURIComponent(cityName || '')}`],
  });

  const { data: facilities, isLoading: isLoadingFacilities } = useQuery<Facility[]>({
    queryKey: [`/api/cities/${encodeURIComponent(cityName || '')}/facilities`],
  });

  // Calculate average rating and total reviews
  const averageRating = facilities?.length 
    ? parseFloat((facilities.reduce((acc, facility) => acc + facility.rating, 0) / facilities.length).toFixed(1))
    : 0;
  
  const totalReviews = facilities?.reduce((acc, facility) => acc + facility.reviewCount, 0) || 0;

  if (isLoadingCity || isLoadingFacilities) {
    return <CityPageSkeleton />;
  }

  if (!city) {
    return <div className="py-20 text-center">City not found</div>;
  }

  return (
    <>
      <Helmet>
        <title>Senior Living Options in {name}, {state} | Radiant Retirement</title>
        <meta name="description" content={`Discover top-rated senior living facilities in ${name}, ${state}. Compare options, read reviews, and find the perfect retirement home.`} />
        <meta name="keywords" content={`senior living, retirement homes, ${name}, ${state}, elder care, assisted living`} />
        <meta property="og:title" content={`Senior Living Options in ${name}, ${state} | Radiant Retirement`} />
        <meta property="og:description" content={`Explore senior living facilities in ${name}, ${state}. Find detailed information, ratings, and reviews to help you make the best choice.`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://radiantretirement.com/city/${encodeURIComponent(cityName || '')}`} />
      </Helmet>

      <SearchBar />

      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Senior Living in {name}, {state}
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              Population: {city.population.toLocaleString()}
            </p>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              Explore senior living options in {name}, {state}.
            </p>
          </div>

          <div className="mt-10 mx-auto max-w-md md:max-w-4xl">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-center">
                <div className="text-primary text-4xl mb-2">
                  <Building className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">5+</h3>
                <p className="text-sm text-gray-500">Available Facilities</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-center">
                <div className="text-secondary text-4xl mb-2">
                  <Star className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">{averageRating}</h3>
                <p className="text-sm text-gray-500">Average Rating</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-center">
                <div className="text-accent text-4xl mb-2">
                  <MessageSquare className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">{totalReviews}</h3>
                <p className="text-sm text-gray-500">Total Reviews</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Us About Senior Living Options</h2>
              <p className="text-lg text-gray-600 mb-8">
                Interested in learning more about senior living options in {name}, {state}? Fill out the form and one of our senior living advisors will get back to you with personalized recommendations.
              </p>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Why Work With Us?</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 text-primary mt-1">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="ml-2 text-gray-600">Expert guidance from senior living specialists</span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 text-primary mt-1">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="ml-2 text-gray-600">Personalized recommendations based on your needs</span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 text-primary mt-1">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="ml-2 text-gray-600">Completely free service with no obligation</span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 text-primary mt-1">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="ml-2 text-gray-600">Save time by having us research options for you</span>
                  </li>
                </ul>
              </div>
            </div>
            <div>
              <ContactForm cityName={name} stateName={city?.stateName || state} />
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">About {name}, {state}</h2>
              <p className="mt-4 text-lg text-gray-500">
                {name} is a vibrant city known for its beautiful surroundings, thriving community, and high quality of life. With excellent healthcare facilities and a variety of cultural activities, it's a popular destination for seniors looking to enjoy their retirement years.
              </p>
              <div className="mt-6 space-y-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white">
                      <Hospital className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Excellent Healthcare</h3>
                    <p className="mt-2 text-base text-gray-500">Access to top-rated medical facilities and healthcare providers.</p>
                  </div>
                </div>
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white">
                      <Bus className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Public Transportation</h3>
                    <p className="mt-2 text-base text-gray-500">Comprehensive public transit system for convenient mobility.</p>
                  </div>
                </div>
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white">
                      <Leaf className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Parks and Recreation</h3>
                    <p className="mt-2 text-base text-gray-500">Numerous parks, gardens, and recreational areas perfect for relaxation and outdoor activities.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-10 lg:mt-0">
              <div className="bg-gray-50 p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-medium text-gray-900 mb-4">Senior Living Resources in {name}</h3>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 text-primary">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h4 className="text-base font-medium text-gray-900">Senior Community Centers</h4>
                      <p className="mt-1 text-sm text-gray-500">Local community centers offering social activities, meals, and wellness programs.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 text-primary">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h4 className="text-base font-medium text-gray-900">Elder Services</h4>
                      <p className="mt-1 text-sm text-gray-500">Organizations providing support with healthcare coordination, transportation, and home care.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 text-primary">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h4 className="text-base font-medium text-gray-900">Medicare Counseling</h4>
                      <p className="mt-1 text-sm text-gray-500">Free counseling services to help navigate Medicare benefits and coverage options.</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">Frequently Asked Questions</h2>
            <p className="mt-4 text-lg text-gray-500">
              Common questions about senior living in {name}
            </p>
          </div>
          <div className="mt-12 max-w-3xl mx-auto">
            <dl className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <dt className="text-lg font-medium text-gray-900">What types of senior living options are available in {name}?</dt>
                <dd className="mt-2 text-base text-gray-500">{name} offers a wide range of senior living options including independent living, assisted living, memory care, and nursing homes. Many facilities provide multiple levels of care to accommodate changing needs.</dd>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <dt className="text-lg font-medium text-gray-900">What is the average cost of senior living in {name}?</dt>
                <dd className="mt-2 text-base text-gray-500">The average cost varies depending on the type of care and amenities offered. Independent living typically ranges from $2,500-$5,000 per month, while assisted living and memory care can range from $4,500-$8,000+ per month.</dd>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <dt className="text-lg font-medium text-gray-900">Are there financial assistance options available?</dt>
                <dd className="mt-2 text-base text-gray-500">Yes, {state} offers various assistance programs including Medicaid waiver programs, veterans benefits, long-term care insurance, and non-profit organization support. Many facilities also offer their own financial assistance options.</dd>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <dt className="text-lg font-medium text-gray-900">How do I choose the right senior living facility?</dt>
                <dd className="mt-2 text-base text-gray-500">Consider factors such as the level of care needed, location, amenities, social activities, and cost. We recommend scheduling tours of multiple facilities, speaking with current residents, and consulting with healthcare providers to make an informed decision.</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>
    </>
  );
};

const CityPageSkeleton = () => {
  return (
    <>
      <SearchBar />
      
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <Skeleton className="h-10 w-96 mx-auto" />
            <Skeleton className="h-6 w-48 mx-auto mt-2" />
            <Skeleton className="h-6 w-80 mx-auto mt-4" />
          </div>

          <div className="mt-10 mx-auto max-w-md md:max-w-4xl">
            <div className="grid gap-6 md:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-gray-50 rounded-lg p-4 flex flex-col items-center">
                  <Skeleton className="h-8 w-8 rounded-full mb-2" />
                  <Skeleton className="h-6 w-8 mb-1" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <Skeleton className="h-8 w-80 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-6" />
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <Skeleton className="h-6 w-48 mb-4" />
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-start">
                      <Skeleton className="h-5 w-5 rounded mr-2" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <div className="bg-gray-200 rounded-lg p-6">
                <Skeleton className="h-7 w-40 mb-6" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
                <div className="space-y-2 mb-6">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-32 w-full" />
                </div>
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default CityPage;
