import { useEffect, useState } from "react";
import getUserMenuItems from "@/app/data/userSidebarItems";
import { RootState } from "@/app/redux/store";
import Sidebar from "@/components/Sidebar/Sidebar";
import MediaUpload from "@/components/Posts/MediaUpload";
import { useSelector } from "react-redux";

const AddPost = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const { existingUser } = useSelector((state: RootState) => state.userAuth)
  const userSidebarItems = getUserMenuItems(existingUser?.username);

  useEffect(() => {
    const handleResize = () => {
      setIsExpanded(window.innerWidth > 1000);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex bg-primary min-h-screen">
      <div className="w-1/6 h-screen z-20">
        <Sidebar menuItems={userSidebarItems} isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
      </div>
      <div className="flex-1 min-h-screen flex justify-center p-6">
        <div className="w-5xl max-w-7xl">
          <MediaUpload />
        </div>
      </div>
    </div>
  );
};

export default AddPost;
