import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar/Sidebar';
import adminMenuItems from '@/app/data/adminSidebarItems';
import adminAxiosInstance from '@/services/api/adminInstance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { UserRound, Building2, Search, RefreshCcw } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface User {
    id: string;
    name: string;
    username: string;
    email: string;
    postsShared: number;
    isBlocked: boolean;
}

interface Company {
    id: string;
    name: string;
    email: string;
    industry: string;
    companyType: string;
    isBlock: boolean;
}

const AdminDashboard = () => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [users, setUsers] = useState<User[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterIndustry, setFilterIndustry] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    
    const fetchUsers = async () => {
        try {
            const response = await adminAxiosInstance.get('/getUsers');
            console.log(response.data);
            setUsers(response.data.users);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const fetchCompanies = async () => {
        try {
            const { data } = await adminAxiosInstance.get('/getCompanies');
            console.log(data);
            console.log("data.companies", data.companies);
            setCompanies(Array.isArray(data.companies) ? data.companies : []);
        } catch (error) {
            console.error("Error fetching companies:", error);
            setCompanies([]);
        }
    };

    useEffect(() => {
        const handleResize = () => {
            setIsExpanded(window.innerWidth > 1000);
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        console.log("use effect called")
        fetchUsers();
        fetchCompanies();
        console.log("companies", companies);
    }, []);

    const industryData = React.useMemo(() => {
        const industryCount = companies.reduce((acc: { [key: string]: number }, company) => {
            acc[company.industry] = (acc[company.industry] || 0) + 1;
            return acc;
        }, {} as { [key: string]: number });

        return Object.keys(industryCount).map(industry => ({
            name: industry,
            value: industryCount[industry]
        }));
    }, [companies]);

    const userActivityData = React.useMemo(() => {
        return [...users]
            .sort((a, b) => b.postsShared - a.postsShared)
            .slice(0, 5)
            .map(user => ({
                name: user.name.split(' ')[0], 
                posts: user.postsShared
            }));
    }, [users]);

    const filteredCompanies = React.useMemo(() => {
        return companies.filter(company => {
            const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                company.email.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesIndustry = !filterIndustry || company.industry === filterIndustry;
            
            const matchesStatus = !filterStatus || 
                                (filterStatus === 'active' && !company.isBlock) ||
                                (filterStatus === 'blocked' && company.isBlock);
            
            return matchesSearch && matchesIndustry && matchesStatus;
        });
    }, [companies, searchTerm, filterIndustry, filterStatus]);

    const industries = [...new Set(companies.map(company => company.industry))];

    const toggleBlockStatus = async (id: string, type: 'user' | 'company') => {
        try {
            if (type === 'user') {
                const user = users.find(u => u.id === id);
                if (user) {
                    await adminAxiosInstance.post('/toggleUserBlock', { userId: id, status: !user.isBlocked });
                    fetchUsers();
                }
            } else {
                const company = companies.find(c => c.id === id);
                if (company) {
                    await adminAxiosInstance.post('/toggleCompanyBlock', { companyId: id, status: !company.isBlock });
                    fetchCompanies();
                }
            }
        } catch (error) {
            console.error(`Error toggling ${type} block status:`, error);
        }
    };

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

    return (
        <div className="flex bg-black min-h-screen">
            <Sidebar 
                menuItems={adminMenuItems} 
                isExpanded={isExpanded} 
                setIsExpanded={setIsExpanded} 
                bgColor="black" 
            />

            <div className="flex-1 p-6 overflow-y-auto bg-gradient-to-br from-zinc-900 to-black text-white">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                        <Card className="bg-zinc-800 border-zinc-700 text-white">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-zinc-400 text-sm font-medium">Total Users</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center">
                                    <UserRound className="h-6 w-6 text-blue-500 mr-2" />
                                    <span className="text-3xl font-bold">{users.length}</span>
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Card className="bg-zinc-800 border-zinc-700 text-white">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-zinc-400 text-sm font-medium">Total Companies</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center">
                                    <Building2 className="h-6 w-6 text-emerald-500 mr-2" />
                                    <span className="text-3xl font-bold">{companies.length}</span>
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Card className="bg-zinc-800 border-zinc-700 text-white">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-zinc-400 text-sm font-medium">Blocked Users</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center">
                                    <span className="text-3xl font-bold">{users.filter(user => user.isBlocked).length}</span>
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Card className="bg-zinc-800 border-zinc-700 text-white">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-zinc-400 text-sm font-medium">Blocked Companies</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center">
                                    <span className="text-3xl font-bold">{companies.filter(company => company.isBlock).length}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        <Card className="bg-zinc-800 border-zinc-700 text-white">
                            <CardHeader>
                                <CardTitle>Top User Activity</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-80 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={userActivityData}
                                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                        >
                                            <XAxis dataKey="name" stroke="#a1a1aa" />
                                            <YAxis stroke="#a1a1aa" />
                                            <Tooltip 
                                                contentStyle={{ backgroundColor: '#27272a', border: 'none', borderRadius: '0.5rem' }}
                                                itemStyle={{ color: '#ffffff' }}
                                                labelStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                                            />
                                            <Bar dataKey="posts" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Card className="bg-zinc-800 border-zinc-700 text-white">
                            <CardHeader>
                                <CardTitle>Industry Distribution</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-80 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={industryData}
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={80}
                                                innerRadius={40}
                                                fill="#8884d8"
                                                dataKey="value"
                                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                labelLine={false}
                                            >
                                                {industryData.map((_, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip 
                                                contentStyle={{ backgroundColor: '#27272a', border: 'none', borderRadius: '0.5rem' }}
                                                itemStyle={{ color: '#ffffff' }}
                                                labelStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                                            />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    
                    <Tabs defaultValue="companies" className="w-full">
                        <TabsList className="bg-zinc-800 mb-6">
                            <TabsTrigger value="companies">Companies Management</TabsTrigger>
                            <TabsTrigger value="users">Users Management</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="companies">
                            <Card className="bg-zinc-800 border-zinc-700 text-white">
                                <CardHeader>
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <CardTitle>Companies</CardTitle>
                                        <div className="flex flex-col md:flex-row gap-4">
                                            <div className="relative">
                                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-zinc-500" />
                                                <Input
                                                    placeholder="Search companies..."
                                                    className="pl-8 bg-zinc-900 border-zinc-700 text-white"
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                />
                                            </div>
                                            <select
                                                value={filterIndustry}
                                                onChange={(e) => setFilterIndustry(e.target.value)}
                                                className="w-full md:w-40 bg-zinc-900 border-zinc-700 text-white rounded-md px-3 py-2"
                                            >
                                                <option value="">All Industries</option>
                                                {industries
                                                    .filter(industry => industry && industry !== '')
                                                    .map(industry => (
                                                        <option key={industry} value={industry}>
                                                            {industry}
                                                        </option>
                                                    ))}
                                            </select>
                                            
                                            <select
                                                value={filterStatus}
                                                onChange={(e) => setFilterStatus(e.target.value)}
                                                className="w-full md:w-40 bg-zinc-900 border-zinc-700 text-white rounded-md px-3 py-2"
                                            >
                                                <option value="">All Status</option>
                                                <option value="active">Active</option>
                                                <option value="blocked">Blocked</option>
                                            </select>
                                            
                                            <Button variant="outline" size="icon" onClick={() => fetchCompanies()}>
                                                <RefreshCcw className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="border-zinc-700">
                                                    <TableHead className="text-zinc-400">Name</TableHead>
                                                    <TableHead className="text-zinc-400">Email</TableHead>
                                                    <TableHead className="text-zinc-400">Industry</TableHead>
                                                    <TableHead className="text-zinc-400">Type</TableHead>
                                                    <TableHead className="text-zinc-400">Status</TableHead>
                                                    <TableHead className="text-zinc-400">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {filteredCompanies.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={6} className="text-center py-8 text-zinc-400">
                                                            No companies found matching your criteria
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    filteredCompanies.map((company) => (
                                                        <TableRow key={company.id} className="border-zinc-700">
                                                            <TableCell className="font-medium">{company.name}</TableCell>
                                                            <TableCell>{company.email}</TableCell>
                                                            <TableCell>{company.industry}</TableCell>
                                                            <TableCell>{company.companyType}</TableCell>
                                                            <TableCell>
                                                                <Badge variant={company.isBlock ? "destructive" : "outline"}>
                                                                    {company.isBlock ? "Blocked" : "Active"}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Button 
                                                                    variant={company.isBlock ? "outline" : "destructive"} 
                                                                    size="sm"
                                                                    onClick={() => toggleBlockStatus(company.id, 'company')}
                                                                >
                                                                    {company.isBlock ? "Unblock" : "Block"}
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                        
                        <TabsContent value="users">
                            <Card className="bg-zinc-800 border-zinc-700 text-white">
                                <CardHeader>
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <CardTitle>Users</CardTitle>
                                        <div className="flex flex-col md:flex-row gap-4">
                                            <div className="relative">
                                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-zinc-500" />
                                                <Input
                                                    placeholder="Search users..."
                                                    className="pl-8 bg-zinc-900 border-zinc-700 text-white"
                                                />
                                            </div>
                                            
                                            <Button variant="outline" size="icon" onClick={() => fetchUsers()}>
                                                <RefreshCcw className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="border-zinc-700">
                                                    <TableHead className="text-zinc-400">Name</TableHead>
                                                    <TableHead className="text-zinc-400">Username</TableHead>
                                                    <TableHead className="text-zinc-400">Email</TableHead>
                                                    <TableHead className="text-zinc-400">Posts</TableHead>
                                                    <TableHead className="text-zinc-400">Status</TableHead>
                                                    <TableHead className="text-zinc-400">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {users.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={6} className="text-center py-8 text-zinc-400">
                                                            No users found
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    users.map((user) => (
                                                        <TableRow key={user.id} className="border-zinc-700">
                                                            <TableCell className="font-medium">{user.name}</TableCell>
                                                            <TableCell>{user.username}</TableCell>
                                                            <TableCell>{user.email}</TableCell>
                                                            <TableCell>{user.postsShared}</TableCell>
                                                            <TableCell>
                                                                <Badge variant={user.isBlocked ? "destructive" : "outline"}>
                                                                    {user.isBlocked ? "Blocked" : "Active"}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Button 
                                                                    variant={user.isBlocked ? "outline" : "destructive"} 
                                                                    size="sm"
                                                                    onClick={() => toggleBlockStatus(user.id, 'user')}
                                                                >
                                                                    {user.isBlocked ? "Unblock" : "Block"}
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;