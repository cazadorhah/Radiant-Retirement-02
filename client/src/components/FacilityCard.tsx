import { Facility } from "@shared/types";
import { Building, MapPin, Phone, Globe, Brain, Heart, Activity, Home } from "lucide-react";

// Helper function to get the appropriate icon based on facility type
const getFacilityIcon = (facilityType?: string) => {
  switch (facilityType) {
    case 'Memory Care':
      return <Brain className="h-16 w-16 text-accent" />;
    case 'Assisted Living':
      return <Heart className="h-16 w-16 text-success" />;
    case 'Skilled Nursing':
      return <Activity className="h-16 w-16 text-secondary" />;
    case 'Continuing Care Retirement Community':
      return <Home className="h-16 w-16 text-warning" />;
    case 'Independent Living':
      return <Building className="h-16 w-16 text-primary" />;
    default:
      return <Building className="h-16 w-16 text-primary" />;
  }
};

interface StarRatingProps {
  rating: number;
  reviewCount: number;
}

const StarRating: React.FC<StarRatingProps> = ({ rating, reviewCount }) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return (
    <div className="star-rating text-sm">
      {[...Array(fullStars)].map((_, i) => (
        <i key={`full-${i}`} className="fas fa-star"></i>
      ))}
      {halfStar && <i className="fas fa-star-half-alt"></i>}
      {[...Array(emptyStars)].map((_, i) => (
        <i key={`empty-${i}`} className="far fa-star"></i>
      ))}
      <span className="ml-1 text-gray-600">
        {rating.toFixed(1)} ({reviewCount} reviews)
      </span>
    </div>
  );
};

interface FacilityCardProps {
  facility: Facility;
  featured?: boolean;
}

const FacilityCard: React.FC<FacilityCardProps> = ({ facility, featured = false }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="md:flex">
        <div className="md:w-1/3 h-48 md:h-auto bg-primary-light flex items-center justify-center relative">
          <div className="facility-icon text-center">
            {getFacilityIcon(facility.facilityType)}
            <div className="mt-2 text-primary font-semibold">{facility.facilityType || "Senior Living"}</div>
          </div>
          {featured && (
            <div className="absolute top-0 right-0 bg-accent text-white px-3 py-1 m-2 rounded-full text-sm font-semibold">
              Featured
            </div>
          )}
        </div>
        <div className="p-6 md:w-2/3">
          <div className="flex justify-between items-start">
            <h3 className="text-xl font-bold text-gray-900">{facility.name}</h3>
            <StarRating rating={facility.rating} reviewCount={facility.reviewCount} />
          </div>
          <p className="text-gray-600 mt-2">
            <MapPin className="h-4 w-4 inline text-primary mr-2" />
            {facility.address}
          </p>
          <p className="text-gray-600 mt-1">
            <Phone className="h-4 w-4 inline text-primary mr-2" />
            {facility.phone}
          </p>
          <p className="text-gray-600 mt-1">
            <Globe className="h-4 w-4 inline text-primary mr-2" />
            <a href={facility.website} className="text-primary hover:underline">{facility.website.replace(/^https?:\/\//, '')}</a>
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {facility.amenities.map((amenity, index) => (
              <span key={index} className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">
                {amenity}
              </span>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <a href="#" className="inline-flex items-center bg-primary text-white px-4 py-2 rounded hover:bg-indigo-700 transition">
              <Building className="h-4 w-4 mr-2" /> Details
            </a>
            <a href="#" className="inline-flex items-center border border-primary text-primary px-4 py-2 rounded hover:bg-primary hover:text-white transition">
              <i className="fas fa-calendar-alt mr-2"></i> Schedule Tour
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacilityCard;
