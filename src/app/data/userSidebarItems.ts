import { 
    Home, 
    Grid, 
    Search, 
    MessageSquare, 
    Layout, 
    User, 
    MoreHorizontal,
    FileText,
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
    { icon: Layout, label: 'Jobs', link: '/jobs' },
    { icon: FileText, label: 'Applicantions', isActive: false ,link:'/applications'},
    { icon: User, label: `${username}`, link: username ? `/${username}` : '' },
    { icon: MoreHorizontal, label: 'More', link: '' }
];

export default getUserMenuItems;