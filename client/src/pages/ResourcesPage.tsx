import React from 'react';
import { BookOpen, DollarSign, Activity, Calendar, Heart, LucideIcon } from 'lucide-react';

interface ResourceSectionProps {
  title: string;
  description: string;
  icon: LucideIcon;
  bgColor?: string;
}

const ResourceSection = ({ title, description, icon: Icon, bgColor = "bg-[#2B6777]" }: ResourceSectionProps) => (
  <div className="mb-10">
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className={`${bgColor} p-4 flex items-center`}>
        <Icon className="text-white h-10 w-10 mr-4" />
        <h2 className="text-2xl font-bold text-white">{title}</h2>
      </div>
      <div className="p-6">
        <p className="text-gray-700 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  </div>
);

const ResourcesPage = () => {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-[#2B6777] mb-4">Resources</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Explore our comprehensive information to help seniors and their families make informed decisions about
          retirement living options and care.
        </p>
      </div>
      
      {/* Senior Living Guide */}
      <ResourceSection 
        title="Senior Living Guide"
        icon={BookOpen}
        description="Senior living options vary based on a person’s needs and level of independence. Independent living is ideal for active seniors who want a maintenance-free lifestyle with services like meals, housekeeping, and social activities. Assisted living suits those who need help with daily tasks but don’t require round-the-clock medical care. Memory care offers a secure, structured environment for those with Alzheimer’s or dementia, while nursing homes provide 24/7 medical support for seniors with serious health conditions. When choosing, consider care needs, location, budget, and community feel—ultimately, the right fit should offer both proper support and a sense of home."
      />
      
      {/* Financial Assistance */}
      <ResourceSection 
        title="Financial Assistance"
        icon={DollarSign}
        bgColor="bg-[#52AB98]"
        description="Many programs can help seniors manage the cost of aging. Social Security provides monthly income after retirement, acting as a financial foundation for most older adults. Medicare covers hospital and medical care for those 65+, while Medicaid helps low-income seniors with long-term care and services Medicare doesn’t cover. Veterans may qualify for additional support through the VA, including pensions and care benefits. Other resources like SSI, SNAP, and Meals on Wheels offer cash aid, food support, and home-delivered meals. Local charities and agencies can also help with bills, housing, and transportation—making it easier for families to find the support they need."
      />
      
      {/* Healthcare Resources */}
      <ResourceSection 
        title="Healthcare Resources"
        icon={Activity}
        description="As health needs change with age, understanding available care options becomes essential. Medicare is the main insurance for seniors, covering hospital stays, doctor visits, and prescriptions, though it doesn’t pay for long-term custodial care. To help with out-of-pocket costs, many turn to supplemental insurance like Medigap or Medicare Advantage plans, which may include extra benefits like dental or vision. Preventive care—such as wellness visits, screenings, and vaccines—is fully covered and helps catch issues early. Tools like Medicare’s Care Compare can help families find trusted doctors and facilities, ensuring seniors receive quality care with confidence."
      />
      
      {/* Retirement Planning */}
      <ResourceSection 
        title="Retirement Planning"
        icon={Calendar}
        bgColor="bg-[#52AB98]"
        description="Smart planning helps ensure financial peace of mind in your later years. Building savings through 401(k)s or IRAs, budgeting carefully, and adjusting investments over time are key strategies. Understanding your pension options, whether lifetime payments or a lump sum, can impact long-term security. The timing of Social Security is also important—waiting until full retirement age or later means larger monthly checks for life. Once retired, tracking expenses, using the 4% withdrawal rule, and maintaining an emergency fund can help your savings last. With the right steps, retirement can be both stable and fulfilling."
      />
      
      {/* Caregiver Support */}
      <ResourceSection 
        title="Caregiver Support"
        icon={Heart}
        description="Caring for a loved one can be deeply fulfilling—but also physically and emotionally demanding. Respite care offers temporary relief so caregivers can rest and recharge, whether through in-home help or short-term stays at care facilities. Support groups provide a sense of community and understanding, helping caregivers feel less alone and more empowered. With training programs, caregivers can learn practical skills for managing daily care tasks with confidence. Just as important is self-care—seeking counseling, staying connected, and taking breaks are essential for long-term well-being. Caring for yourself is part of caring for someone else."
      />
    </div>
  );
};

export default ResourcesPage;