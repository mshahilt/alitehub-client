import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import WebRTCHandler from "@/services/others/WebRTCHandler";
import { Mic, MicOff, Video, VideoOff, PhoneOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface VideoCallProps {
  roomId: string;
  userName?: string;
  userRole?: "interviewer" | "candidate";
  userAvatar?: string;
}

const VideoCall = ({
  roomId,
  userName = "You",
  userRole = "candidate",
  userAvatar,
}: VideoCallProps) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const webRTCRef = useRef<WebRTCHandler | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const [connectionStatus, setConnectionStatus] = useState<string>("Connecting...");
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState<boolean>(true);
  const [participants, setParticipants] = useState<number>(1);
  const [showEndCallDialog, setShowEndCallDialog] = useState<boolean>(false);
  const [connectionQuality, setConnectionQuality] = useState<"excellent" | "good" | "fair" | "poor">("good");
  const [elapsedTime, setElapsedTime] = useState<string>("00:00");
  const [devicePermissionAlert, setDevicePermissionAlert] = useState<boolean>(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (connectionStatus === "Connected") {
      let seconds = 0;
      timer = setInterval(() => {
        seconds++;
        const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
        const secs = (seconds % 60).toString().padStart(2, "0");
        setElapsedTime(`${mins}:${secs}`);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [connectionStatus]);

  useEffect(() => {
    if (!roomId) return;

    socketRef.current = io("http://localhost:5000", { withCredentials: true });

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
        const remoteStream = webrtc.getRemoteStream();
        remoteVideoRef.current.srcObject = remoteStream;
        console.log("Remote stream updated with tracks:", remoteStream.getTracks());
      }
    };

    socketRef.current.emit("join-room", roomId, userName, userRole);
    setConnectionStatus("Accessing camera and microphone...");

    webrtc
      .initializeLocalStream()
      .then((stream) => {
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          setConnectionStatus("Waiting for peer...");
        }
        updateRemoteStream();
      })
      .catch((error) => {
        console.error("Failed to initialize local stream:", error);
        setConnectionStatus("Camera or microphone access denied");
        setDevicePermissionAlert(true);
      });

    socketRef.current.on("offer", async (offer) => {
      console.log("Received offer:", offer);
      setConnectionStatus("Connecting to peer...");
      await webrtc.createAnswer(offer);
      updateRemoteStream();
    });

    socketRef.current.on("answer", async (answer) => {
      console.log("Received answer:", answer);
      await webrtc.handleAnswer(answer);
      setConnectionStatus("Connected");
      setParticipants(2);
      updateRemoteStream();
      setTimeout(() => setConnectionQuality("excellent"), 5000);
      setTimeout(() => setConnectionQuality("good"), 15000);
    });

    socketRef.current.on("ice-candidate", async (candidate) => {
      console.log("Received ICE candidate:", candidate);
      await webrtc.addIceCandidate(candidate);
    });

    socketRef.current.on("user-connected", async (peerName, peerRole) => {
      console.log(`Peer ${peerName} (${peerRole}) connected`);
      setConnectionStatus("Peer joined, connecting...");
      setParticipants(2);
      await webrtc.createOffer();
    });

    socketRef.current.on("user-disconnected", () => {
      console.log("Peer disconnected");
      setConnectionStatus("Peer disconnected");
      setParticipants(1);
      setConnectionQuality("poor");
    });

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
    window.history.back();
  };

  const getConnectionQualityBadge = () => {
    switch (connectionQuality) {
      case "excellent":
        return <Badge className="bg-green-500">Excellent</Badge>;
      case "good":
        return <Badge className="bg-green-400">Good</Badge>;
      case "fair":
        return <Badge className="bg-yellow-500">Fair</Badge>;
      case "poor":
        return <Badge className="bg-red-500">Poor</Badge>;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white max-w-7xl mx-auto">
      {/* Top Bar with Controls */}
      <div className="flex justify-between items-center px-6 py-4 border-b border-white/10 bg-gray-800">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold">Room: {roomId}</h1>
          <Badge variant="outline" className="text-white border-white/30">
            {elapsedTime}
          </Badge>
          <Badge variant={connectionStatus === "Connected" ? "default" : "outline"} className="bg-white/10 text-white">
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
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  {isAudioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isAudioEnabled ? "Mute" : "Unmute"}</p>
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
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  {isVideoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isVideoEnabled ? "Turn off camera" : "Turn on camera"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Dialog open={showEndCallDialog} onOpenChange={setShowEndCallDialog}>
            <DialogTrigger asChild>
              <Button variant="destructive" size="icon">
                <PhoneOff size={20} />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-800 text-white border-white/20">
              <DialogHeader>
                <DialogTitle>End Call</DialogTitle>
                <DialogDescription className="text-white/70">
                  Are you sure you want to end this call?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowEndCallDialog(false)}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
                <Button variant="destructive" onClick={endCall}>
                  End Call
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
          {/* Remote Video */}
          <div className="relative rounded-lg overflow-hidden bg-black/40 h-full">
            <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <Badge className="absolute top-3 left-3 bg-black/70 px-3 py-1">Interviewer</Badge>
            {participants === 1 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="text-center text-white p-4">
                  <p className="font-medium">Waiting for other participant...</p>
                </div>
              </div>
            )}
          </div>

          {/* Local Video */}
          <div className="relative rounded-lg overflow-hidden bg-black/40 h-full">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${!isVideoEnabled ? "opacity-50" : ""}`}
            />
            <Badge className="absolute top-3 left-3 bg-black/70 px-3 py-1">
              {userName} ({userRole})
            </Badge>
            {!isVideoEnabled && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={userAvatar} />
                  <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
                </Avatar>
              </div>
            )}
          </div>
        </div>
      </div>

      {devicePermissionAlert && (
        <Alert variant="destructive" className="fixed bottom-6 left-6 sm:max-w-md">
          <AlertTitle>Device Access</AlertTitle>
          <AlertDescription>Please allow camera and microphone access in your browser settings.</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default VideoCall;