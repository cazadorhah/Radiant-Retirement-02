import { useState } from "react";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MapPin } from "lucide-react";

const ContactPage = () => {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    setFormSubmitted(true);
  };

  return (
    <>
      <Helmet>
        <title>Contact Us - Radiant Retirement</title>
        <meta
          name="description"
          content="Contact Radiant Retirement for personalized guidance on senior living options. Our team of certified advisors is ready to help you find the perfect retirement community."
        />
      </Helmet>

      <div className="container center mx-auto px-12 py-12">
        <div className="max-w-4xl center mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-[#2B6777] mb-4">Contact Us</h1>
          </div>

          <div className="flex justify-center">
            <div className="bg-white rounded-lg shadow-md p-6 max-w-xl w-full">
              <h2 className="text-2xl font-bold text-[#2B6777] mb-6">
                Have Questions About Senior Living?
              </h2>
              <p className="text-gray-600 mb-6">
                Our team is ready to provide personalized guidance at no cost to you.
              </p>

              {formSubmitted ? (
                <div className="text-center bg-green-50 border border-green-200 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-green-800 mb-2">
                    Thank You!
                  </h3>
                  <p className="text-gray-600 mb-3">
                    We've received your information and will be in touch with you soon. 
                    One of our senior living advisors will contact you within 24 hours.
                  </p>
                  <p className="text-sm text-gray-500">
                    We appreciate your interest in Radiant Retirement.
                  </p>
                </div>
              ) : (
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name*</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email Address*</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="message">How can we help you?*</Label>
                    <Textarea
                      id="message"
                      name="message"
                      rows={4}
                      value={formData.message}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[#52AB98] hover:bg-[#2B6777] text-white"
                  >
                    Request Information
                  </Button>
                  <p className="text-xs text-gray-500 text-center mt-2">
                    By submitting this form, you agree to our privacy policy and terms of service.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactPage;