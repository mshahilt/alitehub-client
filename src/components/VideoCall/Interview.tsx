import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import WebRTCHandler from "@/services/others/WebRTCHandler";
import { Mic, MicOff, Video, VideoOff, PhoneOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { 
  Avatar, 
  AvatarFallback, 
  AvatarImage 
} from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Alert, 
  AlertDescription, 
  AlertTitle 
} from "@/components/ui/alert";
import ReviewCompany from "@/page/User/ReviewCompany";
import axiosInstance from "@/services/api/userInstance";

interface VideoCallProps {
  roomId: string;
  userName?: string;
  userRole?: "interviewer" | "candidate";
  userAvatar?: string;
}

const VideoCall: React.FC<VideoCallProps> = ({
  roomId,
  userName = "You",
  userRole = "candidate",
  userAvatar,
}) => {
  // Refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const webRTCRef = useRef<WebRTCHandler | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // State
  const [connectionStatus, setConnectionStatus] = useState<string>("Connecting...");
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState<boolean>(true);
  const [participants, setParticipants] = useState<number>(1);
  const [showEndCallDialog, setShowEndCallDialog] = useState<boolean>(false);
  const [connectionQuality, setConnectionQuality] = useState<"excellent" | "good" | "fair" | "poor">("good");
  const [elapsedTime, setElapsedTime] = useState<string>("00:00");
  const [devicePermissionAlert, setDevicePermissionAlert] = useState<boolean>(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);
  const [companyId, setCompanyId] = useState<string>("");

  // Fetch company details
  useEffect(() => {
    const fetchCompanyDetails = async () => {
      try {
        const response = await axiosInstance.get(`/call/interview/${roomId}`);
        if (response.data.callerType === "Company") {
          setCompanyId(response.data.caller);
        }
      } catch (error) {
        console.error("Failed to fetch company details:", error);
      }
    };
    fetchCompanyDetails();
  }, [roomId]);

  // Call duration timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (connectionStatus === "Connected") {
      let seconds = 0;
      timer = setInterval(() => {
        seconds++;
        const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
        const secs = (seconds % 60).toString().padStart(2, "0");
        setElapsedTime(`${minutes}:${secs}`);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [connectionStatus]);

  // WebRTC and Socket setup
  useEffect(() => {
    if (!roomId) return;

    socketRef.current = io("https://api.alitehub.site", { withCredentials: true });
    
    const sendSignal = async (event: string, data: any) => {
      return new Promise<void>((resolve, reject) => {
        socketRef.current?.emit(event, roomId, data, (ack: any) => {
          if (ack?.error) reject(new Error(ack.error));
          else resolve();
        });
      });
    };

    webRTCRef.current = new WebRTCHandler(sendSignal);
    const webrtc = webRTCRef.current;

    const updateRemoteStream = () => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = webrtc.getRemoteStream();
      }
    };

    // Socket event handlers
    const setupSocketListeners = () => {
      socketRef.current?.emit("join-room", roomId, userName, userRole);
      setConnectionStatus("Accessing camera and microphone...");

      socketRef.current?.on("offer", async (offer) => {
        setConnectionStatus("Connecting to peer...");
        await webrtc.createAnswer(offer);
        updateRemoteStream();
      });

      socketRef.current?.on("answer", async (answer) => {
        await webrtc.handleAnswer(answer);
        setConnectionStatus("Connected");
        setParticipants(2);
        updateRemoteStream();
        setTimeout(() => setConnectionQuality("excellent"), 5000);
        setTimeout(() => setConnectionQuality("good"), 15000);
      });

      socketRef.current?.on("ice-candidate", async (candidate) => {
        await webrtc.addIceCandidate(candidate);
      });

      socketRef.current?.on("user-connected", async (peerName, peerRole) => {
        setConnectionStatus(`${peerName}, ${peerRole} joined , connecting...`);
        setParticipants(2);
        await webrtc.createOffer();
      });

      socketRef.current?.on("user-disconnected", () => {
        setConnectionStatus("Peer disconnected");
        setParticipants(1);
        setConnectionQuality("poor");
      });
    };

    // Initialize WebRTC
    const initializeWebRTC = async () => {
      try {
        const stream = await webrtc.initializeLocalStream();
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          setConnectionStatus("Waiting for peer...");
        }
        updateRemoteStream();
      } catch (error) {
        console.error("Failed to initialize local stream:", error);
        setConnectionStatus("Camera or microphone access denied");
        setDevicePermissionAlert(true);
      }
    };

    // Connection state handler
    const connectionStateHandler = () => {
      const state = webrtc.peerConnection.iceConnectionState;
      if (state === "connected" || state === "completed") {
        setConnectionStatus("Connected");
        setParticipants(2);
        updateRemoteStream();
      } else if (state === "disconnected") {
        setConnectionStatus("Connection unstable");
        setConnectionQuality("poor");
      } else if (state === "failed" || state === "closed") {
        setConnectionStatus("Connection lost");
        setParticipants(1);
      }
    };

    webrtc.peerConnection.addEventListener("iceconnectionstatechange", connectionStateHandler);
    setupSocketListeners();
    initializeWebRTC();

    // Cleanup
    return () => {
      webrtc.closeConnection();
      socketRef.current?.off("offer");
      socketRef.current?.off("answer");
      socketRef.current?.off("ice-candidate");
      socketRef.current?.off("user-connected");
      socketRef.current?.off("user-disconnected");
      socketRef.current?.emit("leave-room", roomId, userName);
      socketRef.current?.disconnect();
      webrtc.peerConnection.removeEventListener("iceconnectionstatechange", connectionStateHandler);
    };
  }, [roomId, userName, userRole]);

  // Control handlers
  const toggleAudio = () => {
    const enabled = webRTCRef.current?.toggleAudio();
    setIsAudioEnabled(enabled ?? false);
  };

  const toggleVideo = () => {
    const enabled = webRTCRef.current?.toggleVideo();
    setIsVideoEnabled(enabled ?? false);
  };

  const endCall = () => {
    socketRef.current?.emit("leave-room", roomId, userName);
    if (userRole === "candidate") {
      setShowEndCallDialog(false);
      setIsReviewModalOpen(true);
    } else {
      setTimeout(() => {
        window.close();
      },500);
      window.history.back();
    }
  };

  // UI Helpers
  const getConnectionQualityBadge = () => {
    const qualityStyles = {
      excellent: "bg-emerald-600 text-white",
      good: "bg-teal-600 text-white",
      fair: "bg-amber-600 text-white",
      poor: "bg-rose-600 text-white",
    };
    return (
      <Badge className={qualityStyles[connectionQuality]}>
        {connectionQuality.charAt(0).toUpperCase() + connectionQuality.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-gray-100 max-w-7xl mx-auto">
      {/* Top Control Bar */}
      <div className="flex justify-between items-center px-6 py-4 border-b border-gray-800 bg-gray-900">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-gray-100">Room: {roomId}</h1>
          <Badge variant="outline" className="text-gray-300 border-gray-700 bg-gray-800">
            {elapsedTime}
          </Badge>
          <Badge
            variant={connectionStatus === "Connected" ? "default" : "outline"}
            className={connectionStatus === "Connected" 
              ? "bg-teal-600 text-gray-100" 
              : "bg-gray-800 border-gray-700 text-gray-100"}
          >
            {connectionStatus}
          </Badge>
          {getConnectionQualityBadge()}
        </div>
        <div className="flex gap-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={toggleAudio}
                  variant={isAudioEnabled ? "outline" : "destructive"}
                  size="icon"
                  className={isAudioEnabled 
                    ? "bg-gray-800 border-gray-700 text-gray-100 hover:bg-gray-700"
                    : "bg-rose-700 text-gray-100 hover:bg-rose-800"}
                >
                  {isAudioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-800 text-gray-100 border-gray-700">
                {isAudioEnabled ? "Mute" : "Un    Unmute"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={toggleVideo}
                  variant={isVideoEnabled ? "outline" : "destructive"}
                  size="icon"
                  className={isVideoEnabled 
                    ? "bg-gray-800 border-gray-700 text-gray-100 hover:bg-gray-700"
                    : "bg-rose-700 text-gray-100 hover:bg-rose-800"}
                >
                  {isVideoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-800 text-gray-100 border-gray-700">
                {isVideoEnabled ? "Turn off camera" : "Turn on camera"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Dialog open={showEndCallDialog} onOpenChange={setShowEndCallDialog}>
            <DialogTrigger asChild>
              <Button 
                variant="destructive" 
                size="icon" 
                className="bg-rose-700 hover:bg-rose-800"
              >
                <PhoneOff size={20} />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 text-gray-100 border-gray-800">
              <DialogHeader>
                <DialogTitle>End Call</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Are you sure you want to end this call?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowEndCallDialog(false)}
                  className="border-gray-700 text-gray-100 hover:bg-gray-800"
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={endCall}
                  className="bg-rose-700 hover:bg-rose-800"
                >
                  End Call
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Video Display */}
      <div className="flex-1 overflow-hidden p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
          <div className="relative rounded-lg overflow-hidden bg-gray-900 h-full">
            <video 
              ref={remoteVideoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover" 
            />
            <Badge className="absolute top-3 left-3 bg-gray-800/80 text-gray-200 px-3 py-1">
              Interviewer
            </Badge>
            {participants === 1 && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900/70">
                <div className="text-center text-gray-300 p-4">
                  <p className="font-medium">Waiting for other participant...</p>
                </div>
              </div>
            )}
          </div>

          <div className="relative rounded-lg overflow-hidden bg-gray-900 h-full">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${!isVideoEnabled ? "opacity-50" : ""}`}
            />
            <Badge className="absolute top-3 left-3 bg-gray-800/80 text-gray-200 px-3 py-1">
              {userName} ({userRole})
            </Badge>
            {!isVideoEnabled && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900/70">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={userAvatar} />
                  <AvatarFallback className="bg-gray-800 text-gray-200">
                    {userName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Alerts and Modals */}
      {devicePermissionAlert && (
        <Alert 
          variant="destructive" 
          className="fixed bottom-6 left-6 sm:max-w-md bg-rose-900 text-gray-100 border-rose-800"
        >
          <AlertTitle>Device Access</AlertTitle>
          <AlertDescription>
            Please allow camera and microphone access in your browser settings.
          </AlertDescription>
        </Alert>
      )}

      {userRole === "candidate" && (
        <ReviewCompany
          companyId={companyId}
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
        />
      )}
    </div>
  );
};

export default VideoCall;