import { 
    Briefcase, 
    Users, 
    MessageSquare, 
    Bell, 
    ClipboardList, 
    FileText, 
    Building, 
    MoreHorizontal 
} from 'lucide-react';

interface MenuItem {
    icon: React.ComponentType;
    label: string;
    link: string;
    isActive?: boolean;
}


const getCompanyMenuItems = (companyIdentifier?: string): MenuItem[] => [
    { icon: Briefcase, label: 'Elite Hub', isActive: true,link:'/' },
    { icon: Users, label: 'Candidate Search',isActive: false ,link:'/company/search' },
    { icon: MessageSquare, label: 'Messaged', isActive: false ,link:'/company/messages' },
    { icon: Bell, label: 'Notification' ,isActive: false ,link:'/company/notifications'},
    { icon: ClipboardList, label: 'Job Management', isActive: false ,link:'/company/jobs'},
    { icon: FileText, label: 'Applicants', isActive: false ,link:'/company/applications'},
    { icon: Building, label: `${companyIdentifier}`, isActive: false ,link:`/company/${companyIdentifier}`},
    { icon: MoreHorizontal, label: 'More', isActive: false ,link:'/'}
];
export default getCompanyMenuItems;
