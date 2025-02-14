import { 
    Home, 
    Grid, 
    Search, 
    MessageSquare, 
    Layout, 
    User, 
    MoreHorizontal,
} from 'lucide-react';

interface MenuItem {
    icon: React.ComponentType;
    label: string;
    link: string;
    isActive?: boolean;
}

const getUserMenuItems = (username?: string): MenuItem[] => [
    { icon: Grid, label: 'Elite hub', isActive: true, link: '/' },
    { icon: Home, label: 'Home', link: '/' },
    { icon: Search, label: 'Search', link: '/search' },
    { icon: MessageSquare, label: 'Messages', link: '/messages' },
    { icon: Layout, label: 'Applications', link: '/applications' },
    { icon: User, label: `${username}`, link: username ? `/${username}` : '' },
    { icon: MoreHorizontal, label: 'More', link: '' }
];

export default getUserMenuItems;