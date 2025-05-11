import getUserMenuItems from '@/app/data/userSidebarItems';
import { RootState } from '@/app/redux/store';
import Sidebar from '@/components/Sidebar/Sidebar';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axiosInstance from '@/services/api/userInstance';
import { Building, Mail, Briefcase, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Company {
  id: string;
  name: string;
  email: string;
  companyIdentifier: string;
  industry: string;
  companyType: string;
  contact: {
    phone: string | null;
  };
  profile_picture: string | null;
  locations: any | null;
  isBlock: boolean;
}

const Companies = () => {
  const [isExpanded, setIsExpanded] = useState(window.innerWidth > 1000);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { existingUser } = useSelector((state: RootState) => state.userAuth);
  const userSidebarItems = getUserMenuItems(existingUser?.username);
  useEffect(() => {
    const fetchCompanies = async () => {
      setIsLoading(true);
      try {
        const { data } = await axiosInstance.get('/company/getAll');
        console.log("Fetched companies:", data);
        setCompanies(data.data);
      } catch (error) {
        console.error("Error fetching companies:", error);
        setError("Failed to load companies. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchCompanies();
  }, []);
  
  useEffect(() => {
    const handleResize = () => setIsExpanded(window.innerWidth > 1000);

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const generateAvatarColor = (companyName: string) => {
    const colors = [
      'bg-blue-400', 'bg-purple-400', 'bg-green-400', 
      'bg-yellow-400', 'bg-red-400', 'bg-pink-400'
    ];
    
    const index = companyName.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const handleViewDetail = (companyIdentifier: string) => {
    console.log("viewving")
    navigate(`/u/company/${companyIdentifier}`)
  }

  return (
    <div className="flex bg-navy-900 min-h-screen">
      <aside className="fixed left-0 w-1/4 h-screen z-20">
        <Sidebar menuItems={userSidebarItems} isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
      </aside>
      
      <main className="flex-1 min-h-screen ml-auto md:ml-1/4 mr-0 md:mr-1/4 flex justify-center p-4 md:p-6 z-2">
        <div className="w-full max-w-4xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white">Companies</h1>
            <p className="text-gray-300">View and manage your connected companies</p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
            </div>
          ) : error ? (
            <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded relative">
              {error}
            </div>
          ) : companies.length === 0 ? (
            <div className="bg-navy-800 shadow rounded-lg p-8 text-center">
              <Building className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-200">No companies found</h3>
              <p className="mt-1 text-sm text-gray-400">You don't have any companies connected yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {companies.map((company) => (
                <div key={company.id} className="bg-secondary shadow rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-300">
                  <div className="p-5">
                    <div className="flex items-center space-x-4">
                      {company.profile_picture ? (
                        <img 
                          src={company.profile_picture} 
                          alt={company.name} 
                          className="h-16 w-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className={`h-16 w-16 rounded-full flex items-center justify-center text-white text-xl font-bold ${generateAvatarColor(company.name)}`}>
                          {company.name.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h2 className="text-lg font-bold text-white truncate">{company.name}</h2>
                        <p className="text-sm text-gray-400 truncate">@{company.companyIdentifier}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center text-sm text-gray-300">
                        <Mail className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="truncate">{company.email}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-300">
                        <Briefcase className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{company.industry} • {company.companyType}</span>
                      </div>
                      {company.locations && (
                        <div className="flex items-center text-sm text-gray-300">
                          <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                          <span>{company.locations}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4 flex justify-end">
                      <button onClick={() => handleViewDetail(company.companyIdentifier)} className="px-4 py-2 bg-blue-800 text-blue-200 text-sm font-medium rounded-md hover:bg-blue-700 transition-colors duration-300">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Companies;