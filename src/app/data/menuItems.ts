import { 
    Home, 
    Grid, 
    Search, 
    MessageSquare, 
    Layout, 
    UserPlus, 
    User, 
    MoreHorizontal,
} from 'lucide-react';

interface MenuItem {
    icon: React.ComponentType;
    label: string;
    isActive?: boolean;
}

const menuItems: MenuItem[] = [
    { icon: Grid, label: 'Elite hub', isActive: true },
    { icon: Home, label: 'Home' },
    { icon: Search, label: 'Search' },
    { icon: MessageSquare, label: 'Messages' },
    { icon: Layout, label: 'Applications' },
    { icon: UserPlus, label: 'Join' },
    { icon: User, label: 'Profile' },
    { icon: MoreHorizontal, label: 'More' }
];

export default menuItems;