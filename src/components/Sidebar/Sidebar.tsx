
import { Menu } from 'lucide-react';
import menuItems from '../../app/data/menuItems';

const Sidebar = ({isExpanded, setIsExpanded}: {isExpanded: boolean, setIsExpanded: (isExpanded: boolean) => void}) => {

    return (
        <div 
            className={`h-screen bg-primary text-white transition-all duration-300 
            ${isExpanded ? 'w-56' : 'w-16'} border-r border-gray-800`}
        >
            <div className="p-4 flex items-center gap-2">
                <button 
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="p-2 hover:bg-purple-900 rounded-lg flex-shrink-0"
                >
                    <Menu className="w-6 h-6" />
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'w-36' : 'w-8'}`}>
                    {isExpanded ? (
                        <img 
                            src="/images/logo.png" 
                            alt="Logo" 
                            className="max-h-8 w-auto object-contain"
                        />
                    ) : (
                        <img 
                            src="/images/logoOnly.png" 
                            alt="Logo" 
                            className="w-8 h-8 object-contain"
                        />
                    )}
                </div>
            </div>
            
            <nav className="flex-1">
                <ul className="space-y-2">
                    {menuItems.map((item, index) => {
                        const Icon = item.icon as React.ComponentType<{ className?: string }>;
                        return (
                            <li key={index}>
                                <a 
                                    href="#" 
                                    className={`flex items-center p-3 mx-2 rounded-lg
                                        ${item.isActive ? 'text-purple-500' : 'text-gray-400'} 
                                        hover:bg-purple-900`}
                                >
                                    <Icon className="w-6 h-6 min-w-6" />
                                    {isExpanded && (
                                        <span className="ml-3 text-sm">{item.label}</span>
                                    )}
                                </a>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </div>
    );
};

export default Sidebar;