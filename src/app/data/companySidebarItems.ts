import { 
    Briefcase,
    ClipboardList, 
    FileText, 
    Building, 
    MoreHorizontal,
    BadgeDollarSignIcon
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


const getCompanyMenuItems = (companyIdentifier?: string): MenuItem[] => [
    { icon: Briefcase, label: 'Elite Hub', link:'/' },
    { icon: ClipboardList, label: 'Job Management', link:'/company/jobs'},
    { icon: FileText, label: 'Applicants', link:'/company/applications'},
    { icon: BadgeDollarSignIcon, label: 'Exclusive Plans', link:'/company/plans'},
    { icon: Building, label: `${companyIdentifier}`, link:`/company/${companyIdentifier}`},
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
export default getCompanyMenuItems;
