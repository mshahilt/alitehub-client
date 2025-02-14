import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getMe } from "../../app/redux/slices/user/userAuthSlice";
import { RootState, AppDispatch } from "../../app/redux/store";
import Sidebar from "../../components/Sidebar/Sidebar";
import PostCard from "../../components/Posts/PostCard";
import getUserMenuItems from "../../app/data/userSidebarItems";

const Home = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [isExpanded, setIsExpanded] = useState(true);

  const { user } = useSelector((state: RootState) => state.userAuth) as { 
    user: { name: string; username: string; email: string }, 
    loading: boolean,
  };

  useEffect(() => {
    dispatch(getMe());
    console.log(user)
  }, [dispatch]);

  const userSidebarItems = getUserMenuItems(user?.username);

  useEffect(() => {
    const handleResize = () => {
      setIsExpanded(window.innerWidth > 1000);
    };

    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  console.log("user from redux", user);

  return (
    <div className="flex bg-primary min-h-screen">
      <div className="fixed left-0 w-1/4 h-screen md:block z-3">
        <Sidebar menuItems={userSidebarItems} isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
      </div>

      <div className="fixed right-0 w-1/4 h-screen bg-primary border-l border-gray-800 lg:block hidden">
        <div className="p-4 text-gray-400">Right Area</div>
      </div>

      <div className="flex-1 min-h-screen ml-auto md:ml-1/4 mr-0 md:mr-1/4 flex justify-center p-1 z-2">
        <div className="w-full max-w-2xl">
          <PostCard />
        </div>
      </div>
    </div>
  );
};

export default Home;
