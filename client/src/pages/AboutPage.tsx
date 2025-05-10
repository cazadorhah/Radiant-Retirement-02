import React from "react";
import { ExternalLink } from "lucide-react";
import { Helmet } from "react-helmet";
import { Link } from "wouter";

const AboutPage = () => {
  return (
    <>
      <Helmet>
        <title>About Us | Radiant Retirement</title>
        <meta
          name="description"
          content="Learn about our mission to help seniors find the perfect living community with comprehensive information and personalized guidance."
        />
      </Helmet>

      <div className="container mx-auto py-12 px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#2B6777] mb-4">
            About Radiant Retirement
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Simplifying the search for senior living with comprehensive
            information, trusted insights, and personalized guidance for
            families across America.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-10">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="md:w-">
              <h2 className="text-2xl font-bold text-[#2B6777] mb-4 pb-2 border-b-2 border-[#C8D8E4]">
                Our Story
              </h2>
              <p className="text-gray-600">
                Radiant Retirement was created out of a deep personal need: the
                need for clarity, compassion, and trustworthy guidance during
                one of life’s most challenging transitions—navigating aging and
                long-term care. Like many others, the founders of Radiant
                Retirement experienced the overwhelm of trying to understand
                senior living options, healthcare benefits, and financial
                planning for aging loved ones. The information was scattered,
                confusing, and often full of jargon.
              </p>
              <br></br>
              <p className="text-gray-600"> <b>Radiant Retirement exists to change that</b>.</p>
              <br></br>
              <p className="text-gray-600">
                The goal is simple: to make vital information about senior care
                accessible and easy to understand. Whether you’re exploring
                retirement communities, applying for Medicare or Medicaid, or
                caring for a parent with memory loss, Radiant Retirement is here
                to support and inform you every step of the way.

                Aging can be difficult—but finding help shouldn’t be. Radiant
                Retirement empowers families with clear, reliable resources so
                they can make confident decisions for the people they love.
              </p>
              <br></br>
              <p className="italic text-[#52AB98] font-medium">
                "We believe every senior deserves to age with dignity in a
                community that truly feels like home."
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="w-12 h-12 bg-[#C8D8E4] rounded-full flex items-center justify-center mb-4">
              <span className="text-[#2B6777] font-bold text-xl">1</span>
            </div>
            <h3 className="text-xl font-bold text-[#2B6777] mb-3">
              Our Mission
            </h3>
            <p className="text-gray-600">
              To empower seniors and their families with comprehensive, accurate
              information that simplifies the process of finding the right
              senior living community.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="w-12 h-12 bg-[#C8D8E4] rounded-full flex items-center justify-center mb-4">
              <span className="text-[#2B6777] font-bold text-xl">2</span>
            </div>
            <h3 className="text-xl font-bold text-[#2B6777] mb-3">
              Our Vision
            </h3>
            <p className="text-gray-600">
              A world where every senior can easily find a living environment
              that enhances their quality of life, meets their unique needs, and
              respects their dignity.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="w-12 h-12 bg-[#C8D8E4] rounded-full flex items-center justify-center mb-4">
              <span className="text-[#2B6777] font-bold text-xl">3</span>
            </div>
            <h3 className="text-xl font-bold text-[#2B6777] mb-3">
              Our Values
            </h3>
            <p className="text-gray-600">
              We are guided by compassion, integrity, innovation, and community
              in everything we do to support seniors and their families.
            </p>
          </div>
        </div>

        <div className="bg-[#f8f9fa] rounded-lg p-8 mb-10">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-[#2B6777] mb-3">
              Why Choose Radiant Retirement
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              What sets us apart in helping families find the perfect senior
              living solution
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-[#C8D8E4] rounded-full flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#2B6777"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-bold text-[#2B6777] mb-2 text-center">
                Comprehensive Directory
              </h3>
              <p className="text-gray-600 text-center">
                Access detailed profiles of over 5,000 senior living facilities
                across 1000 cities, with verified information updated
                regularly.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-[#C8D8E4] rounded-full flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#2B6777"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 8v8"></path>
                    <path d="M8 12h8"></path>
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-bold text-[#2B6777] mb-2 text-center">
                No Hidden Costs
              </h3>
              <p className="text-gray-600 text-center">
                Our services are completely free for seniors and their families.
                We maintain transparency in all our operations.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-[#C8D8E4] rounded-full flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#2B6777"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-bold text-[#2B6777] mb-2 text-center">
                Ongoing Support
              </h3>
              <p className="text-gray-600 text-center">
                We're with you every step of the way, from initial search
                through to move-in day and beyond.
              </p>
            </div>
          </div>
        </div>


        {/* Call to Action Section */}
        <div className="bg-[#2B6777] rounded-lg p-8 mb-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-3">Have Questions About Senior Living?</h2>
            <p className="text-lg text-white max-w-2xl mx-auto">
              Our team of certified senior living advisors is ready to provide personalized guidance at no cost to you.
            </p>
            <div className="mt-6">
              <Link href="/contact" className="inline-block py-3 px-6 bg-white text-[#2B6777] font-bold rounded-md hover:bg-[#C8D8E4] transition">
                Contact Us Today
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AboutPage;
