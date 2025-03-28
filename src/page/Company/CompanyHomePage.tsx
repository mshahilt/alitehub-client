import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import getCompanyMenuItems from '../../app/data/companySidebarItems';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../app/redux/store';
import { getCompany } from '../../app/redux/slices/company/companyAuthSlice';
import LoadingScreen from '@/components/Loading/Loading';
import axiosInstance from '@/services/api/userInstance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Briefcase, Users, Calendar } from 'lucide-react';

interface Job {
  id: string;
  jobTitle: string;
  status: string;
  applicationReceived: number;
  postedDate: string;
}

interface JobApplication {
  id: string;
  user_name: string;
  job_title: string;
  status: string;
  quiz_score: number;
}

const CompanyHomePage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);

  const { company, loading } = useSelector((state: RootState) => state.companyAuth);
  const companySidebarItems = getCompanyMenuItems(company?.companyIdentifier);
  
  const fetchJobApplications = async () => {
    try {
      const response = await axiosInstance.get("/application/company");
      const mappedApplications: JobApplication[] = response.data.applications.map((app: any) => ({
        id: app._id,
        user_name: app.userDetails?.[0]?.name || "Unknown",
        job_title: app.jobDetails?.jobTitle || "Unknown Job",
        status: app.status,
        quiz_score: app.quiz_score ?? 0
      }));
      setApplications(mappedApplications);
    } catch (error) {
      console.error("Error fetching applications:", error);
    }
  };

  const fetchJobs = async () => {
    try {
      const response = await axiosInstance.get("/company/job/get");
      const formattedJobs = response.data.jobs.map((job: any) => ({
        id: job.id,
        jobTitle: job.jobTitle,
        status: "Active",
        applicationReceived: job.applicationReceived || 0,
        postedDate: new Date(job.postedDate).toLocaleDateString(),
      }));
      setJobs(formattedJobs);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };
  
  useEffect(() => {
    dispatch(getCompany());
    fetchJobs();
    fetchJobApplications();
  }, [dispatch]);

  useEffect(() => {
    const handleResize = () => {
      setIsExpanded(window.innerWidth > 1000);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate stats
  const totalApplications = applications.length;
  const totalJobs = jobs.length;
  const activeJobs = jobs.filter(job => job.status === "Active").length;

  const applicationTrends = applications.reduce((acc, app) => {
    const job = jobs.find(j => j.jobTitle === app.job_title);
    const date = job ? new Date(job.postedDate).toLocaleString('default', { month: 'short' }) : 'Unknown';
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  console.log("applicationTrends : ", applicationTrends);

  const applicationTrendData = Object.entries(applicationTrends).map(([name, value]) => ({
    name,
    applications: value
  })).sort((a, b) => a.name.localeCompare(b.name));


  const applicationsByStatus = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <>
      {loading && LoadingScreen}
      <div className="flex bg-secondary min-h-screen">
        <Sidebar
          menuItems={companySidebarItems}
          isExpanded={isExpanded}
          setIsExpanded={setIsExpanded}
        />

        <div className="flex-1 bg-secondary min-h-screen p-4 overflow-y-auto">
          <div className="w-full max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-6">Company Dashboard</h1>
            
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="bg-secondary border border-gray-700">
                <CardContent className="p-4 flex items-center">
                  <div className="rounded-full p-3 bg-blue-900 mr-4">
                    <Briefcase className="h-6 w-6 text-blue-300" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Total Jobs</p>
                    <h3 className="text-2xl font-bold text-white">{totalJobs}</h3>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-secondary border border-gray-700">
                <CardContent className="p-4 flex items-center">
                  <div className="rounded-full p-3 bg-green-900 mr-4">
                    <Users className="h-6 w-6 text-green-300" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Total Applications</p>
                    <h3 className="text-2xl font-bold text-white">{totalApplications}</h3>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-secondary border border-gray-700">
                <CardContent className="p-4 flex items-center">
                  <div className="rounded-full p-3 bg-yellow-900 mr-4">
                    <Calendar className="h-6 w-6 text-yellow-300" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Active Jobs</p>
                    <h3 className="text-2xl font-bold text-white">{activeJobs}</h3>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Card className="bg-secondary border border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Application Trends</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={applicationTrendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                        <XAxis dataKey="name" stroke="#999" />
                        <YAxis stroke="#999" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569' }}
                          labelStyle={{ color: '#f8fafc' }}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="applications" stroke="#00C49F" activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <Card className="bg-secondary border border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Application Status Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(applicationsByStatus).map(([status, count]) => (
                      <div key={status} className="bg-gray-800 p-3 rounded-lg">
                        <p className="text-sm text-gray-400">{status}</p>
                        <p className="text-xl font-bold text-white">{count}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Posted Jobs List */}
              <Card className="bg-secondary border border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Posted Jobs</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-white">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="p-3 text-left">Job Title</th>
                          <th className="p-3 text-left">Status</th>
                          <th className="p-3 text-left">Applications</th>
                          <th className="p-3 text-left">Posted Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {jobs.map((job) => (
                          <tr key={job.id} className="border-b border-gray-700 hover:bg-gray-800">
                            <td className="p-3">{job.jobTitle}</td>
                            <td className="p-3">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                job.status === 'Active' 
                                  ? 'bg-green-900 text-green-300' 
                                  : 'bg-red-900 text-red-300'
                              }`}>
                                {job.status}
                              </span>
                            </td>
                            <td className="p-3">{job.applicationReceived}</td>
                            <td className="p-3">{job.postedDate}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CompanyHomePage;