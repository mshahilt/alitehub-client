import { useEffect, useState } from "react";
import GenericTable from "../../components/admin/Table";
import Sidebar from "../../components/Sidebar/Sidebar";
import adminMenuItems from "../../app/data/adminSidebarItems";
import adminAxiosInstance from "../../services/api/adminInstance";

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

    const fetchUsers = async () => {
        try {
            const response = await adminAxiosInstance.get('/getUsers');
            console.log(response.data)
            setUsers(response.data.users);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    useEffect(() => {
        const handleResize = () => {
            setIsExpanded(window.innerWidth > 1000);
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleBlock = async (userId: string) => {
        try {
            console.log("called")
            await adminAxiosInstance.patch(`/blockOrUnblock/${userId}`);
            fetchUsers();
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
        <div className="flex bg-black min-h-screen">
            <Sidebar 
                menuItems={adminMenuItems} 
                isExpanded={isExpanded} 
                setIsExpanded={setIsExpanded} 
                bgColor="black" 
            />

            <div className="flex-1 bg-black min-h-screen flex justify-center p-1">
                <div className="w-full bg-black max-w-6xl">
                    <GenericTable 
                        columns={columns} 
                        data={users} 
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
                                    onClick={() => console.log(`Viewing ${user.username}`)}
                                    className="rounded bg-gray-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-gray-700"
                                >
                                    View Details
                                </button>
                            </div>
                        )}
                    />
                </div>
            </div>
        </div>
    );
};

export default UserManagement;