import { RootState } from '@/app/redux/store';
import axiosInstance from '@/services/api/userInstance';
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';

const ConnectionCount = () => {
    const [count, setCount] = useState(0);
    const { fetchedProfile } = useSelector((state: RootState) => state.userAuth);

    useEffect(() => {
        const handleCount = async () => {
            if(!fetchedProfile) return;
            const response = await axiosInstance.get(`/connection/${fetchedProfile.id}/count`);
            console.log("count of connections",response.data)
            setCount(response.data.count);
        }
        handleCount();
    }, [fetchedProfile])
  return (
      <div>
        <span className="font-bold">{count}</span>
        <span className="text-gray-400 ml-1">Connections</span>
    </div>

  )
}

export default ConnectionCount
