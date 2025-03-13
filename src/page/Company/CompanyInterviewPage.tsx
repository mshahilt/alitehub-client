import getCompanyMenuItems from '@/app/data/companySidebarItems';
import { RootState } from '@/app/redux/store';
import LoadingScreen from '@/components/Loading/Loading';
import Sidebar from '@/components/Sidebar/Sidebar';
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import Interview from '@/components/VideoCall/Interview';

const CompanyInterviewPage = () => {
    const {roomId} = useParams();
    
    useEffect(() => {
        const handleResize = () => {
            setIsExpanded(window.innerWidth > 1000);
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);
    
    const [isExpanded, setIsExpanded] = useState(true);
    const { company, loading } = useSelector((state: RootState) => state.companyAuth);
    const companySidebarItems = getCompanyMenuItems(company?.companyIdentifier);
    if (!roomId) {
        return (
          <div className="flex items-center justify-center min-h-screen bg-primary">
            <div className="text-center p-6 bg-white rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold mb-4">Invalid Room</h2>
              <p className="mb-4">No room ID provided. You need a valid room ID to join an interview.</p>
              <button 
                onClick={() => window.history.back()} 
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Go Back
              </button>
            </div>
          </div>
        );
      }    
        return (
             <>
                {loading && <LoadingScreen />}
                <div className="flex bg-primary min-h-screen">
                    <Sidebar menuItems={companySidebarItems} isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
                    <div className="flex-1 flex justify-center p-4 z-2">
                    <Interview roomId={roomId}/>
                    </div>
                </div>
            </>
        )
}

export default CompanyInterviewPage;
