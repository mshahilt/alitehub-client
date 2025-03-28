import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ReactCrop, { Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Building2, MapPin, Phone, Mail, Edit2, CreditCard } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AppDispatch, RootState } from '../../app/redux/store';
import { 
  fetchCompanyProfile, 
  updateCompanyProfilePicture 
} from '../../app/redux/slices/company/companyAuthSlice';
import ProfileSkeleton from '../Loading/SkeltonProfileLoading';

interface CompanyProfileProps {
  companyIdentifier: string;
}

const ProfileImage = ({ 
  src, 
  alt, 
  onUpload 
}: { 
  src?: string | null; 
  alt: string; 
  onUpload?: (file: File) => void;
}) => {
    if (!onUpload) {
        return src ? (
          <img src={src} alt={alt} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-700">
            <Building2 size={48} className="text-gray-400" />
          </div>
        );
      }
    
      return (
        <div className="relative w-full h-full">
          {src ? (
           <>
           <div className="relative w-full h-full">
             <img src={src} alt={alt} className="w-full h-full object-cover" />
             <label className="absolute inset-0 flex items-center justify-center bg-transparent hover:bg-gray-900/5 transition-all duration-200 cursor-pointer">
               <input
                 type="file"
                 className="hidden"
                 accept="image/*"
                 onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
               />
               <Edit2 size={24} className="text-white opacity-0 hover:opacity-100 transition-all duration-200" />
             </label>
           </div>
         </>     
          ) : (
            <label className="w-full h-full flex items-center justify-center cursor-pointer bg-gray-700">
              <input 
                type="file" 
                className="hidden" 
                accept="image/*" 
                onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])} 
              />
              <span className="text-gray-400">Upload Image</span>
            </label>
          )}
        </div>
      );
};

const InfoItem = ({ icon: Icon, children }: { icon: any; children: React.ReactNode }) => (
  <div className="flex items-center gap-2 text-gray-300">
    <Icon size={16} />
    {children}
  </div>
);

const LocationBadge = ({ location }: { location: string }) => (
  <span className="px-2 py-1 bg-gray-800 rounded text-sm">
    {location}
  </span>
);

const SubscriptionStatus = ({ status }: { status: string }) => (
  <span className={`px-2 py-1 rounded text-sm ${
    status === 'active' ? 'bg-green-800 text-green-200' : 
    status === 'past_due' ? 'bg-yellow-800 text-yellow-200' :
    'bg-red-800 text-red-200'
  }`}>
    {status.charAt(0).toUpperCase() + status.slice(1)}
  </span>
);

const CompanyProfile: React.FC<CompanyProfileProps> = ({ companyIdentifier }) => {
  const dispatch: AppDispatch = useDispatch();
  const { 
    fetchedCompanyProfile, 
    company 
  } = useSelector((state: RootState) => state.companyAuth);

  const companyData = fetchedCompanyProfile.data || company;
  const { loading, ownAcc } = fetchedCompanyProfile;

  const [cropModalState, setCropModalState] = useState({
    isOpen: false,
    imageUrl: '',
  });
  
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 90,
    height: 90,
    x: 5,
    y: 5,
  });

  useEffect(() => {
    dispatch(fetchCompanyProfile(companyIdentifier));
  }, [dispatch, companyIdentifier]);

  const handleImageSelect = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setCropModalState({
        isOpen: true,
        imageUrl: reader.result as string,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = async (imageEl: HTMLImageElement) => {
    const canvas = document.createElement('canvas');
       const scaleX = imageEl.naturalWidth / imageEl.width;
       const scaleY = imageEl.naturalHeight / imageEl.height;
       
       canvas.width = crop.width;
       canvas.height = crop.height;
       const ctx = canvas.getContext('2d');
   
       if (!ctx) return;
   
       ctx.drawImage(
         imageEl,
         crop.x * scaleX,
         crop.y * scaleY,
         crop.width * scaleX,
         crop.height * scaleY,
         0,
         0,
         crop.width,
         crop.height
       );
   
       canvas.toBlob((blob) => {
         if (blob) {
           const file = new File([blob], 'profile-picture.jpg', { type: 'image/jpeg' });
           dispatch(updateCompanyProfilePicture(file));
         }
       }, 'image/jpeg', 1);
   
       setCropModalState({ isOpen: false, imageUrl: '' });
  };

  if (loading) return <ProfileSkeleton />;
  if (!companyData) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="max-w-4xl mx-auto text-white bg-secondary">
      <div className="relative">
        <div className="h-40 w-full bg-gradient-to-r from-gray-600 to-gray-300 rounded-t-lg" />
        <div className="absolute -bottom-16 left-8">
          <div className="w-32 h-32 rounded-lg border-4 border-[#1a1a2e] bg-gray-200 overflow-hidden">
            <ProfileImage 
              src={companyData.profile_picture} 
              alt={companyData.name}
              onUpload={ownAcc ? handleImageSelect : undefined}
            />
          </div>
        </div>
      </div>

      <div className="mt-20 px-8 pb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">{companyData.name}</h1>
            <div className="flex items-center gap-2 text-gray-400 text-sm mt-1">
              <LocationBadge location={companyData.industry} />
              <LocationBadge location={companyData.companyType} />
              {companyData.subscriptionDetails && (
                <SubscriptionStatus status={companyData.subscriptionDetails.status} />
              )}
            </div>
          </div>
          {ownAcc && (
            <Button variant="secondary" size="icon">
              <Edit2 size={20} />
            </Button>
          )}
        </div>

        <div className="mt-6 space-y-3">
          {companyData.contact?.phone && (
            <InfoItem icon={Phone}>{companyData.contact.phone}</InfoItem>
          )}
          <InfoItem icon={Mail}>{companyData.email}</InfoItem>
          {companyData.locations?.length && (
            <InfoItem icon={MapPin}>
              <div className="flex flex-wrap gap-2">
                {companyData.locations.map((location, index) => (
                  <LocationBadge key={index} location={location} />
                ))}
              </div>
            </InfoItem>
          )}
        </div>

        <Tabs defaultValue="overview" className="mt-8">
          <TabsList className='bg-secondary border'>
            <TabsTrigger value="overview">OVERVIEW</TabsTrigger>
            <TabsTrigger value="jobs">JOBS</TabsTrigger>
            <TabsTrigger value="employees">EMPLOYEES</TabsTrigger>
            <TabsTrigger value="subscription">SUBSCRIPTION</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gray-800 p-6">
                <h3 className="text-lg font-semibold mb-4">Company Details</h3>
                <div className="space-y-2 text-gray-300">
                  <p><span className="text-gray-400">Industry:</span> {companyData.industry}</p>
                  <p><span className="text-gray-400">Type:</span> {companyData.companyType}</p>
                  <p><span className="text-gray-400">ID:</span> {companyData.companyIdentifier}</p>
                </div>
              </Card>

              <Card className="bg-gray-800 p-6">
                <h3 className="text-lg font-semibold mb-4">Locations</h3>
                {companyData.locations?.length ? (
                  <div className="space-y-2">
                    {companyData.locations.map((location, index) => (
                      <InfoItem key={index} icon={MapPin}>
                        {location}
                      </InfoItem>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400">No locations specified</p>
                )}
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="jobs">
            <Card className="bg-gray-800 p-6">
              <p className="text-gray-400">Jobs content coming soon...</p>
            </Card>
          </TabsContent>

          <TabsContent value="employees">
            <Card className="bg-gray-800 p-6">
              <p className="text-gray-400">Employees content coming soon...</p>
            </Card>
          </TabsContent>

          <TabsContent value="subscription" className="mt-6">
            <Card className="bg-gray-800 p-6">
              <h3 className="text-lg font-semibold mb-4">Subscription Details</h3>
              {companyData.subscriptionDetails ? (
                <div className="space-y-2 text-gray-300">
                  <InfoItem icon={CreditCard}>
                    Status: <SubscriptionStatus status={companyData.subscriptionDetails.status} />
                  </InfoItem>
                  <p>
                    <span className="text-gray-400">Current Period:</span>{' '}
                    {formatDate(companyData.subscriptionDetails.currentPeriodStart)} -{' '}
                    {formatDate(companyData.subscriptionDetails.currentPeriodEnd)}
                  </p>
                  <p>
                    <span className="text-gray-400">Started:</span>{' '}
                    {formatDate(companyData.subscriptionDetails.createdAt)}
                  </p>
                  <p>
                    <span className="text-gray-400">Subscription ID:</span>{' '}
                    {companyData.subscriptionDetails.stripeSubscriptionId}
                  </p>
                </div>
              ) : (
                <p className="text-gray-400">No active subscription</p>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>

       <Dialog 
              open={cropModalState.isOpen} 
              onOpenChange={(open) => !open && setCropModalState({ isOpen: false, imageUrl: '' })}
            >
              <DialogContent className="bg-gray-900 text-white">
                <DialogHeader>
                  <DialogTitle>Crop Profile Picture</DialogTitle>
                </DialogHeader>
                
                  {cropModalState.imageUrl && (
                  <div className="max-h-[60vh] overflow-auto">
                    <ReactCrop
                    crop={crop}
                    onChange={(c) => setCrop(c)}
                    aspect={1}
                    className="max-w-full"
                    >
                    <img
                      src={cropModalState.imageUrl}
                      alt="Crop preview"
                      className="max-w-full"
                      onLoad={(e) => {
                      const img = e.currentTarget;
                      const width = img.width;
                      const height = img.height;
                      const size = Math.min(width, height);
                      setCrop({
                        unit: 'px',
                        width: size,
                        height: size,
                        x: (width - size) / 2,
                        y: (height - size) / 2,
                      });
                      }}
                    />
                    </ReactCrop>
                  </div>
                  )}
      
                <DialogFooter>
                  <Button 
                    variant="secondary" 
                    onClick={() => setCropModalState({ isOpen: false, imageUrl: '' })}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={(e) => {
                      const img = (e.currentTarget.parentElement?.parentElement?.querySelector('img') as HTMLImageElement);
                      if (img) handleCropComplete(img);
                    }}
                  >
                    Save
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
    </div>
  );
};

export default CompanyProfile;