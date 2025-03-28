import { 
    LayoutDashboard, 
    Search, 
    Users, 
    Building,
    CircleDollarSign
} from 'lucide-react';

interface MenuItem {
    icon: React.ComponentType;
    label: string;
    link: string;
    isActive?: boolean;
}

const adminMenuItems: MenuItem[] = [
    { icon: LayoutDashboard, label: 'Dashboard', isActive: true, link: '/admin/dashboard' },
    { icon: Search, label: 'Search', isActive: false, link: '/admin/search' },
    { icon: Users, label: 'Manage Users', isActive: false, link: '/admin/users' },
    { icon: Building, label: 'Manage Companies', isActive: false, link: '/admin/companies' },
    { icon: CircleDollarSign, label: 'Manage Plans', isActive: false, link: '/admin/plans' },
];

export default adminMenuItems;
