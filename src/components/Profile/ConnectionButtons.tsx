import { followOrUnfollow } from '@/app/redux/slices/user/userAuthSlice';
import { AppDispatch, RootState } from '@/app/redux/store';
import { Edit, UserCheck, UserPlus, UserX } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';

const ConnectionButtons = () => {
    const dispatch: AppDispatch = useDispatch();
    const { existingUser, user, ownAccount, connectionInfo } = useSelector((state: RootState) => state.userAuth);
    const handleConnect = (connectionStatus: string = '') => {
        dispatch(followOrUnfollow({ userId2: user.id, connectionStatus }));
      };
    return (
        <div className="flex flex-col space-y-2">
          {ownAccount ? (
            <button className="group flex items-center text-blue-400 hover:text-blue-300 transition-colors duration-200">
              <Edit size={16} className="mr-2 group-hover:rotate-6 transition-transform" />
              <span className="text-sm font-medium">Edit Bio</span>
            </button>
          ) : connectionInfo ? (
            connectionInfo.status === "accepted" ? (
              <button 
                onClick={() => handleConnect("disconnect")}
                className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 px-3 py-1.5 rounded-md flex items-center space-x-2 transition-all duration-200 group"
              >
                <UserX size={18} className="group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">Disconnect</span>
              </button>
            ) : connectionInfo.status === "pending" ? (
              <div className="flex flex-col space-y-2">
                {connectionInfo.userId1 === existingUser.id ? (
                  <button 
                    className="bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 px-3 py-1.5 rounded-md flex items-center space-x-2 transition-all duration-200 group"
                  >
                    <UserCheck size={18} className="group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium">Requested</span>
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleConnect("accept")}
                      className="bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-400 px-3 py-1.5 rounded-md flex items-center space-x-2 transition-all duration-200 group"
                    >
                      <UserPlus size={18} className="group-hover:rotate-6 transition-transform" />
                      <span className="text-sm font-medium">Accept</span>
                    </button>
                    <button 
                      onClick={() => handleConnect("decline")}
                      className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 px-3 py-1.5 rounded-md flex items-center space-x-2 transition-all duration-200 group"
                    >
                      <UserX size={18} className="group-hover:scale-110 transition-transform" />
                      <span className="text-sm font-medium">Decline</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button 
                onClick={() => handleConnect()}
                className="bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 px-3 py-1.5 rounded-md flex items-center space-x-2 transition-all duration-200 group"
              >
                <UserPlus size={18} className="group-hover:rotate-6 transition-transform" />
                <span className="text-sm font-medium">Connect</span>
              </button>
            )
          ) : (
            <button 
              onClick={() => handleConnect()}
              className="bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 px-3 py-1.5 rounded-md flex items-center space-x-2 transition-all duration-200 group"
            >
              <UserPlus size={18} className="group-hover:rotate-6 transition-transform" />
              <span className="text-sm font-medium">Connect</span>
            </button>
          )}
        </div>
    )
}

export default ConnectionButtons
