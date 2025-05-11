import { useEffect, useState } from "react";
import GenericTable from "../../components/Table/Table";
import Sidebar from "../../components/Sidebar/Sidebar";
import adminMenuItems from "../../app/data/adminSidebarItems";
import adminAxiosInstance from "../../services/api/adminInstance";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface User {
    id: string;
    name: string;
    username: string;
    email: string;
    postsShared: number;
    isBlocked: boolean;
}

const UserManagement = () => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [fetchLimit, setLimit] = useState(5);
    const [searchTerm, setSearchTerm] = useState("");

    const navigate = useNavigate();

    const fetchUsers = async (limit: number) => {
        try {
            const response = await adminAxiosInstance.get('/getUsers', {
                params: {limit: limit}
            });
            console.log(response.data);
            setUsers(response.data.users);
            setFilteredUsers(response.data.users);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };
    
    const handlePagination = () => {
        setLimit((prev) => prev + 5);
    }
    
    useEffect(() => {
        const handleResize = () => {
            setIsExpanded(window.innerWidth > 1000);
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        fetchUsers(fetchLimit);
    }, [fetchLimit]);

    useEffect(() => {
        // Filter users based on search term
        if (searchTerm.trim() === "") {
            setFilteredUsers(users);
        } else {
            const filtered = users.filter(user => 
                user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredUsers(filtered);
        }
    }, [searchTerm, users]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleViewUserDetail = (username: string) => {
        navigate(`/admin/user/${username}`);
    }

    const handleBlock = async (userId: string) => {
        try {
            await adminAxiosInstance.patch(`/blockOrUnblockUser/${userId}`);
            fetchUsers(fetchLimit);
        } catch (error) {
            console.error("Error blocking/unblocking user:", error);
        }
    };

    const columns: { key: keyof User; label: string }[] = [
        { key: "name", label: "Name" },
        { key: "username", label: "Username" },
        { key: "email", label: "Email" },
        { key: "postsShared", label: "Posts Shared" },
    ];

    return (
        <div className="flex bg-primary min-h-screen">
            <Sidebar 
                menuItems={adminMenuItems} 
                isExpanded={isExpanded} 
                setIsExpanded={setIsExpanded} 
                bgColor="bg-black" 
            />

            <div className="flex-1 bg-black min-h-screen flex justify-center p-1">
                <div className="w-full bg-black max-w-6xl flex flex-col h-screen">
                    <div className="flex-none p-4 flex justify-between items-center">
                        <h1 className="text-xl font-semibold text-white">Users</h1>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={searchTerm}
                                onChange={handleSearch}
                                className="pl-10 pr-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                    
                    <div className="flex-grow overflow-auto no-scrollbar">
                        {filteredUsers.length > 0 ? (
                            <GenericTable 
                                bgColor="bg-black"
                                columns={columns} 
                                data={filteredUsers} 
                                actions={(user: User) => (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleBlock(user.id)}
                                            className={user.isBlocked 
                                                ? "rounded bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-emerald-700 w-24" 
                                                : "rounded bg-rose-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-rose-700 w-24"
                                            }
                                        >
                                            {user.isBlocked ? "Unblock" : "Block"}
                                        </button>
                                        <button
                                            onClick={() => handleViewUserDetail(user.username)}
                                            className="rounded bg-gray-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-gray-700"
                                        >
                                            View Details
                                        </button>
                                    </div>
                                )}
                            />
                        ) : (
                            <div className="flex justify-center items-center h-full">
                                <p className="text-gray-400">No users found matching "{searchTerm}"</p>
                            </div>
                        )}
                    </div>
                    
                    <div className="flex-none border-t border-gray-800">
                        <div className="flex justify-between items-center p-4">
                            <p className="text-sm text-gray-400">
                                {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'} found
                            </p>
                            {filteredUsers.length === users.length && (
                                <button onClick={handlePagination} className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                                    Load more...
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserManagement;