import { 
    LayoutDashboard, 
    Search, 
    Users, 
    Building,
    CircleDollarSign,
    MoreHorizontal
} from 'lucide-react';

interface MenuItem {
    icon: React.ComponentType;
    label: string;
    link?: string;
    subItems?: {
        label: string;
        link?: string;
        action?: () => void;
    }[];
}

const adminMenuItems: MenuItem[] = [
    { icon: LayoutDashboard, label: 'Dashboard', link: '/admin/dashboard' },
    { icon: Search, label: 'Search', link: '/admin/search' },
    { icon: Users, label: 'Manage Users', link: '/admin/users' },
    { icon: Building, label: 'Manage Companies', link: '/admin/companies' },
    { icon: CircleDollarSign, label: 'Manage Plans', link: '/admin/plans' },
    { 
        icon: MoreHorizontal, 
        label: 'More', 
        subItems: [
            { label: 'Logout', action: () => {
                localStorage.removeItem("token");
                location.reload();
            }}
        ]
    }
];

export default adminMenuItems;
