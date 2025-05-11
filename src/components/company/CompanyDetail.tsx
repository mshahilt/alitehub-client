import { Building2, Mail, Phone, Map } from "lucide-react";

interface CompanyData {

  name: string;
  email: string;
  password: string;
  industry: string;
  companyType: string;
  companyIdentifier: string;
  contact: {
    phone: string | null;
  };
  profile_picture: string | null;
  locations: string | null;
  isBlock: boolean;
}

interface CompanyProfileCardProps {
  companyData: CompanyData;
}

export default function CompanyProfileCard({ companyData }: CompanyProfileCardProps): JSX.Element {


  const getValueOrDefault = (value: string | null | undefined, defaultText = "Not specified"): string => {
    return value || defaultText;
  };

  return (
    <div className="bg-secondary text-white rounded-lg shadow-xl overflow-hidden max-w-4xl mx-auto">
      <div className="relative h-48 bg-gradient-to-r from-blue-900 to-blue-800">
        <div className="absolute -bottom-16 left-8">
          {companyData.profile_picture ? (
            <div className="h-32 w-32 rounded-full border-4 border-white shadow-lg overflow-hidden">
              <img
                src={companyData.profile_picture}
                alt={`${companyData.name} logo`}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="h-32 w-32 rounded-full bg-gray-300 flex items-center justify-center border-4 border-white">
              <Building2 size={48} className="text-gray-500" />
            </div>
          )}
        </div>
      </div>

      <div className="pt-20 pb-8 px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">{companyData.name}</h1>
          <p className="text-blue-200 mt-1">{getValueOrDefault(companyData.industry)}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Building2 className="text-blue-300" size={20} />
              <div>
                <p className="text-blue-300 text-sm">Company Type</p>
                <p>{getValueOrDefault(companyData.companyType)}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Mail className="text-blue-300" size={20} />
              <div>
                <p className="text-blue-300 text-sm">Email</p>
                <p>{getValueOrDefault(companyData.email)}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Phone className="text-blue-300" size={20} />
              <div>
                <p className="text-blue-300 text-sm">Phone</p>
                <p>{getValueOrDefault(companyData.contact?.phone)}</p>
              </div>
            </div>
          </div>
          <div className="space-y-4">

            <div className="flex items-center space-x-3">
              <Map className="text-blue-300" size={20} />
              <div>
                <p className="text-blue-300 text-sm">Locations</p>
                <p>{getValueOrDefault(companyData.locations, "No locations specified")}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-700 text-blue-100">
            @{companyData.companyIdentifier}
          </span>
        </div>
      </div>
    </div>
  );
}