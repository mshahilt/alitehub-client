import React, { useState } from 'react'
import Sidebar from '@/components/Sidebar/Sidebar';
import adminMenuItems from '@/app/data/adminSidebarItems';
import SearchC from '@/components/Search/SearchC';

const AdminSearchPage = () => {
      const [isExpanded, setIsExpanded] = useState(window.innerWidth > 1000);
    
  return (
    <div className="flex bg-primary min-h-screen">
            <Sidebar 
                menuItems={adminMenuItems} 
                isExpanded={isExpanded} 
                setIsExpanded={setIsExpanded} 
                bgColor="bg-black" 
            />
            <div className="flex-1 min-h-screen bg-black flex justify-center p-6">
                <div className="w-5xl max-w-7xl">
                    <SearchC bgColor='bg-black' isAdmin={true}/>
                </div>
            </div>
        </div>
  )
}

export default AdminSearchPage
