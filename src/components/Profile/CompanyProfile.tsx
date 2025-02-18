import { Building2, MapPin, Phone, Mail, Edit2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../app/redux/store';
import { useEffect } from 'react';
import { fetchCompanyProfile } from '../../app/redux/slices/company/companyAuthSlice';
import ProfileSkeleton from '../Loading/SkeltonProfileLoading';

interface CompanyProfileProps {
  companyIdentifier: string;
}

const CompanyProfile: React.FC<CompanyProfileProps> = ({ companyIdentifier }) => {
  const dispatch: AppDispatch = useDispatch();
  const { company, loading } = useSelector((state: RootState) => state.companyAuth) as {
    company: {
      name: string;
      email: string;
      industry: string;
      companyType: string;
      contact?: { phone?: string | null };
      companyIdentifier: string;
      profile_picture?: string | null;
      locations?: string[] | null;
    };
    loading: boolean;
    error: string;
  };

  useEffect(() => {
    dispatch(fetchCompanyProfile(companyIdentifier));
  }, [dispatch, companyIdentifier]);

  console.log("from component",company)
  if (loading) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="max-w-4xl mx-auto text-white bg-secondary">
      <div className="relative">
        <div className="h-40 w-full bg-gradient-to-r from-indigo-600 to-indigo-300 rounded-t-lg"></div>
        <div className="absolute -bottom-16 left-8">
          <div className="w-32 h-32 rounded-lg border-4 border-[#1a1a2e] bg-gray-200 overflow-hidden">
            {company?.profile_picture ? (
              <img
                src={company.profile_picture}
                alt={company.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-700">
                <Building2 size={48} className="text-gray-400" />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-20 px-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">{company?.name}</h1>
            <div className="flex items-center gap-2 text-gray-400 text-sm mt-1">
              <span className="px-2 py-1 bg-gray-800 rounded">{company?.industry}</span>
              <span className="px-2 py-1 bg-gray-800 rounded">{company?.companyType}</span>
            </div>
          </div>
          <button className="p-2 bg-gray-800 rounded-lg">
            <Edit2 size={20} />
          </button>
        </div>

        <div className="mt-6 space-y-3">
          {company?.contact?.phone && (
            <div className="flex items-center gap-2 text-gray-300">
              <Phone size={16} />
              <span>{company.contact.phone}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-gray-300">
            <Mail size={16} />
            <span>{company?.email}</span>
          </div>
          {company?.locations && company.locations.length > 0 && (
            <div className="flex items-center gap-2 text-gray-300">
              <MapPin size={16} />
              <div className="flex flex-wrap gap-2">
                {company.locations.map((location, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-800 rounded text-sm">
                    {location}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex border-b border-gray-800 mt-8">
          <button className="px-4 py-2 text-sm font-medium border-b-2 border-white">
            OVERVIEW
          </button>
          <button className="px-4 py-2 text-sm font-medium text-gray-400">
            JOBS
          </button>
          <button className="px-4 py-2 text-sm font-medium text-gray-400">
            EMPLOYEES
          </button>
        </div>

        <div className="py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Company Details</h3>
              <div className="space-y-2 text-gray-300">
                <p><span className="text-gray-400">Industry:</span> {company?.industry}</p>
                <p><span className="text-gray-400">Type:</span> {company?.companyType}</p>
                <p><span className="text-gray-400">ID:</span> {company?.companyIdentifier}</p>
              </div>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Locations</h3>
              {company?.locations && company.locations.length > 0 ? (
                <div className="space-y-2">
                  {company.locations.map((location, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <MapPin size={16} className="text-gray-400" />
                      <span className="text-gray-300">{location}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No locations specified</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyProfile;