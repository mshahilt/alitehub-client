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
    subItems?: {
        label: string;
        link: string;
    }[];
}

const getUserMenuItems = (username?: string): MenuItem[] => [
    { icon: Grid, label: 'Elite hub', isActive: true, link: '/' },
    { icon: Home, label: 'Home', link: '/' },
    { icon: Search, label: 'Search', link: '/search' },
    { icon: MessageSquare, label: 'Messages', link: '/messages' },
    { icon: Layout, label: 'Jobs', link: '/jobs' },
    { icon: FileText, label: 'Applications', isActive: false, link: '/applications' },
    { icon: User, label: `${username || 'Profile'}`, link: username ? `/${username}` : '/profile' },
    { 
        icon: MoreHorizontal, 
        label: 'More', 
        link: '', 
        subItems: [
            { label: 'Build your resume', link: '/build-resume' },
            { label: 'Add Post', link: '/add-post' }
        ]
    }
];

export default getUserMenuItems;