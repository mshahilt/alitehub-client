import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import PostCard from '../../components/Posts/PostCard';
import getCompanyMenuItems from '../../app/data/companySidebarItems';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../app/redux/store';
import { getCompany } from '../../app/redux/slices/company/companyAuthSlice';
import LoadingScreen from '@/components/Loading/Loading';

const CompanyHomePage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [isExpanded, setIsExpanded] = useState(true);

  const { company, loading } = useSelector((state: RootState) => state.companyAuth);

  const companySidebarItems = getCompanyMenuItems(company?.companyIdentifier);

  useEffect(() => {
    dispatch(getCompany());
  }, [dispatch]); 

  useEffect(() => {
    const handleResize = () => {
      setIsExpanded(window.innerWidth > 1000);
    };

    handleResize(); 
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
    {loading && LoadingScreen}
    <div className="flex bg-primary min-h-screen">
        <Sidebar
          menuItems={companySidebarItems}
          isExpanded={isExpanded}
          setIsExpanded={setIsExpanded}
        />

      <div className="flex-1 bg-primary min-h-screen flex justify-center p-1">
        <div className="w-full bg-primary max-w-6xl">
          <PostCard />
        </div>
      </div>
    </div>
    </>
  );
};

export default CompanyHomePage;