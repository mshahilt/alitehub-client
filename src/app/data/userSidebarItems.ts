import { 
    Home, 
    Grid, 
    Search, 
    MessageSquare, 
    Layout, 
    User, 
    MoreHorizontal,
    FileText,
    ProportionsIcon
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

const getUserMenuItems = (username?: string): MenuItem[] => [
    { icon: Grid, label: 'Elite hub', link: '/' },
    { icon: Home, label: 'Home', link: '/' },
    { icon: Search, label: 'Search', link: '/search' },
    { icon: MessageSquare, label: 'Messages', link: '/message' },
    { icon: Layout, label: 'Jobs', link: '/jobs' },
    { icon: FileText, label: 'Applications', link: '/applications' },
    { icon: ProportionsIcon, label: 'Companies', link: '/companies' },
    { icon: User, label: `${username || 'Profile'}`, link: username ? `/${username}` : '/profile' },
    { 
        icon: MoreHorizontal, 
        label: 'More', 
        subItems: [
            { label: 'Build your resume', link: '/build-resume' },
            { label: 'Add Post', link: '/add-post' },
            { label: 'Logout', action: () => {
                localStorage.removeItem("token");
                location.reload();
            }}
        ]
    }
];

export default getUserMenuItems;
