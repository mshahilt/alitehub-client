import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import WebRTCHandler from "@/services/others/WebRTCHandler";
import { Camera, Mic, MicOff, Video, VideoOff, MessageSquare, PhoneOff, Users, Settings, Volume2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface InterviewProps {
  roomId: string;
  userName?: string;
  userRole?: "interviewer" | "candidate";
  userAvatar?: string;
}

interface Message {
  id: string;
  sender: string;
  senderRole?: string;
  text: string;
  timestamp: Date;
}

const Interview = ({
  roomId,
  userName = "You",
  userRole = "candidate",
  userAvatar
}: InterviewProps) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const webRTCRef = useRef<WebRTCHandler | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  const [connectionStatus, setConnectionStatus] = useState<string>("Connecting...");
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("video");
  const [messages, setMessages] = useState<Message[]>([]);
  const [participants, setParticipants] = useState<number>(1);
  const [availableDevices, setAvailableDevices] = useState<{
    cameras: MediaDeviceInfo[];
    microphones: MediaDeviceInfo[];
    speakers: MediaDeviceInfo[];
  }>({ cameras: [], microphones: [], speakers: [] });
  const [selectedDevices, setSelectedDevices] = useState<{
    camera: string;
    microphone: string;
    speaker: string;
  }>({ camera: "", microphone: "", speaker: "" });
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
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        setElapsedTime(`${mins}:${secs}`);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [connectionStatus]);

  useEffect(() => {
    if (!roomId) return;

    socketRef.current = io("http://localhost:5000", { withCredentials: true });
    
    const sendSignal = (event: string, data: any) => {
      socketRef.current?.emit(event, roomId, data);
    };

    webRTCRef.current = new WebRTCHandler(sendSignal);
    const webrtc = webRTCRef.current;

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = webrtc.getRemoteStream();
    }

    socketRef.current.emit("join-room", roomId, userName, userRole);
    setConnectionStatus("Accessing camera and microphone...");

    webrtc.getLocalStream()
      .then((stream) => {
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          setConnectionStatus("Waiting for peer...");
        }
        
        webrtc.getAvailableDevices()
          .then(devices => {
            setAvailableDevices(devices);
            if (devices.cameras.length > 0) setSelectedDevices(prev => ({ ...prev, camera: devices.cameras[0].deviceId }));
            if (devices.microphones.length > 0) setSelectedDevices(prev => ({ ...prev, microphone: devices.microphones[0].deviceId }));
            if (devices.speakers.length > 0) setSelectedDevices(prev => ({ ...prev, speaker: devices.speakers[0].deviceId }));
          })
          .catch(err => {
            console.error("Failed to enumerate devices:", err);
            setDevicePermissionAlert(true);
          });
      })
      .catch(error => {
        console.error("Failed to get local media:", error);
        setConnectionStatus("Camera or microphone access denied");
        setDevicePermissionAlert(true);
      });

    socketRef.current.on("offer", async (offer) => {
      setConnectionStatus("Connecting to peer...");
      await webrtc.createAnswer(offer);
    });

    socketRef.current.on("answer", async (answer) => {
      await webrtc.handleAnswer(answer);
      setConnectionStatus("Connected");
      setParticipants(2);
      setTimeout(() => setConnectionQuality("excellent"), 5000);
      setTimeout(() => setConnectionQuality("good"), 15000);
    });

    socketRef.current.on("ice-candidate", async (candidate) => {
      await webrtc.addIceCandidate(candidate);
    });

    socketRef.current.on("user-connected", (userName, userRole) => {
      setConnectionStatus("Peer joined, connecting...");
      setParticipants(2);
      webrtc.createOffer();
      
      const systemMessage: Message = {
        id: `system-${Date.now()}`,
        sender: "System",
        text: `${userName} joined the interview.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, systemMessage]);
    });

    socketRef.current.on("user-disconnected", (userName) => {
      setConnectionStatus("Peer disconnected");
      setParticipants(1);
      
      const systemMessage: Message = {
        id: `system-${Date.now()}`,
        sender: "System",
        text: `${userName} left the interview.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, systemMessage]);
    });
    
    socketRef.current.on("receive-message", (message, sender, senderRole) => {
      setMessages(prev => [...prev, {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        sender,
        senderRole,
        text: message,
        timestamp: new Date()
      }]);
    });

    const connectionStateHandler = () => {
      const state = webrtc.peerConnection.iceConnectionState;
      if (state === 'connected' || state === 'completed') {
        setConnectionStatus("Connected");
        setParticipants(2);
      } else if (state === 'disconnected') {
        setConnectionStatus("Connection unstable");
        setConnectionQuality("poor");
      } else if (state === 'failed' || state === 'closed') {
        setConnectionStatus("Connection lost");
        setParticipants(1);
      }
    };
    
    webrtc.peerConnection.addEventListener('iceconnectionstatechange', connectionStateHandler);

    return () => {
      webrtc.closeConnection();
      socketRef.current?.off("offer");
      socketRef.current?.off("answer");
      socketRef.current?.off("ice-candidate");
      socketRef.current?.off("user-connected");
      socketRef.current?.off("user-disconnected");
      socketRef.current?.off("receive-message");
      socketRef.current?.emit("leave-room", roomId, userName);
      socketRef.current?.disconnect();
      webrtc.peerConnection.removeEventListener('iceconnectionstatechange', connectionStateHandler);
    };
  }, [roomId, userName, userRole]);

  const toggleAudio = () => {
    webRTCRef.current?.toggleAudio();
    setIsAudioEnabled(!isAudioEnabled);
  };

  const toggleVideo = () => {
    webRTCRef.current?.toggleVideo();
    setIsVideoEnabled(!isVideoEnabled);
  };

  const sendMessage = () => {
    if (!chatInputRef.current?.value.trim()) return;
    
    const message = chatInputRef.current.value;
    socketRef.current?.emit("send-message", roomId, message, userName, userRole);
    setMessages(prev => [...prev, {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sender: userName,
      senderRole: userRole,
      text: message,
      timestamp: new Date()
    }]);
    
    chatInputRef.current.value = "";
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') sendMessage();
  };

  const endCall = () => {
    socketRef.current?.emit("leave-room", roomId, userName);
    window.history.back();
  };

  const changeDevice = (type: 'camera' | 'microphone' | 'speaker', deviceId: string) => {
    setSelectedDevices(prev => ({ ...prev, [type]: deviceId }));
    const webrtc = webRTCRef.current;
    if (!webrtc) return;
    
    switch (type) {
      case 'camera':
        webrtc.switchCamera(deviceId);
        break;
      case 'microphone':
        webrtc.switchAudioDevice(deviceId);
        break;
      case 'speaker':
        if (remoteVideoRef.current && 'setSinkId' in remoteVideoRef.current) {
          // @ts-ignore
          remoteVideoRef.current.setSinkId(deviceId);
        }
        break;
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getConnectionQualityBadge = () => {
    switch (connectionQuality) {
      case 'excellent': return <Badge className="bg-green-500">Excellent</Badge>;
      case 'good': return <Badge className="bg-green-400">Good</Badge>;
      case 'fair': return <Badge className="bg-yellow-500">Fair</Badge>;
      case 'poor': return <Badge className="bg-red-500">Poor</Badge>;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center px-4 py-2 border-b gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-lg font-semibold">Room: {roomId}</h1>
          <Badge variant="outline">{elapsedTime}</Badge>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Users size={14} />
            <span className="text-sm">{participants}</span>
          </div>
          {getConnectionQualityBadge()}
          <Badge variant={connectionStatus === "Connected" ? "default" : "outline"}>
            {connectionStatus}
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid grid-cols-3 w-full max-w-[400px] mx-auto">
            <TabsTrigger value="video"><Video size={16} className="mr-2" />Video</TabsTrigger>
            <TabsTrigger value="chat"><MessageSquare size={16} className="mr-2" />Chat</TabsTrigger>
            <TabsTrigger value="settings"><Settings size={16} className="mr-2" />Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="video" className="flex-1 p-2 overflow-hidden">
            <div className="h-full flex flex-col gap-2">
              <motion.div 
                className="flex-1 relative rounded-lg overflow-hidden bg-black"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <video 
                  ref={remoteVideoRef} 
                  autoPlay 
                  playsInline 
                  className="w-full h-full object-cover" 
                />
                <Badge className="absolute top-2 left-2 bg-black/70">Interviewer</Badge>
                {participants === 1 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <div className="text-center text-white p-4">
                      <p className="font-medium">Waiting for interviewer...</p>
                      <p className="text-sm mt-1">Room: {roomId}</p>
                    </div>
                  </div>
                )}
              </motion.div>
              
              <motion.div 
                className="relative rounded-lg overflow-hidden bg-black h-24 sm:h-32 md:h-40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <video 
                  ref={localVideoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className={`w-full h-full object-cover ${!isVideoEnabled ? 'opacity-50' : ''}`}
                />
                <Badge className="absolute top-2 left-2 bg-black/70">
                  {userName} ({userRole})
                </Badge>
                {!isVideoEnabled && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={userAvatar} />
                      <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </div>
                )}
              </motion.div>
            </div>
          </TabsContent>

          <TabsContent value="chat" className="flex-1 p-2">
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg">Chat</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                  {messages.map(msg => (
                    <div key={msg.id} className={`mb-2 ${msg.sender === "System" ? 'text-center' : ''}`}>
                      {msg.sender === "System" ? (
                        <span className="text-xs bg-muted px-2 py-1 rounded">{msg.text}</span>
                      ) : (
                        <div className={`flex ${msg.sender === userName ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] p-2 rounded ${msg.sender === userName ? 'bg-primary text-white' : 'bg-muted'}`}>
                            <div className="flex justify-between gap-2 text-xs">
                              <span>{msg.sender}</span>
                              <span>{formatTime(msg.timestamp)}</span>
                            </div>
                            <p className="mt-1">{msg.text}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </ScrollArea>
              </CardContent>
              <div className="p-2">
                <div className="flex gap-2">
                  <Input ref={chatInputRef} placeholder="Type a message..." onKeyDown={handleKeyDown} />
                  <Button onClick={sendMessage} size="sm">Send</Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="p-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Camera</Label>
                  <Select value={selectedDevices.camera} onValueChange={(value) => changeDevice('camera', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select camera" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableDevices.cameras.map(device => (
                        <SelectItem key={device.deviceId} value={device.deviceId}>
                          {device.label || `Camera ${availableDevices.cameras.indexOf(device) + 1}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Microphone</Label>
                  <Select value={selectedDevices.microphone} onValueChange={(value) => changeDevice('microphone', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select microphone" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableDevices.microphones.map(device => (
                        <SelectItem key={device.deviceId} value={device.deviceId}>
                          {device.label || `Microphone ${availableDevices.microphones.indexOf(device) + 1}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Speaker</Label>
                  <Select value={selectedDevices.speaker} onValueChange={(value) => changeDevice('speaker', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select speaker" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableDevices.speakers.map(device => (
                        <SelectItem key={device.deviceId} value={device.deviceId}>
                          {device.label || `Speaker ${availableDevices.speakers.indexOf(device) + 1}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-between items-center">
                  <Label>Video Preview</Label>
                  <Switch checked={isVideoEnabled} onCheckedChange={toggleVideo} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Control Bar */}
        <div className="border-t p-2 flex justify-center">
          <div className="flex gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={toggleAudio} 
                    variant={isAudioEnabled ? "outline" : "destructive"}
                    size="icon"
                    className="h-10 w-10"
                  >
                    {isAudioEnabled ? <Mic size={18} /> : <MicOff size={18} />}
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
                    className="h-10 w-10"
                  >
                    {isVideoEnabled ? <Video size={18} /> : <VideoOff size={18} />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isVideoEnabled ? "Turn off camera" : "Turn on camera"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={() => setActiveTab(activeTab === "chat" ? "video" : "chat")}
                    variant="outline"
                    size="icon"
                    className="h-10 w-10"
                  >
                    <MessageSquare size={18} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Toggle chat</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Dialog open={showEndCallDialog} onOpenChange={setShowEndCallDialog}>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DialogTrigger asChild>
                      <Button 
                        variant="destructive"
                        size="icon"
                        className="h-10 w-10"
                      >
                        <PhoneOff size={18} />
                      </Button>
                    </DialogTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>End call</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>End Interview</DialogTitle>
                  <DialogDescription>Are you sure you want to end the interview?</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowEndCallDialog(false)}>Cancel</Button>
                  <Button variant="destructive" onClick={endCall}>End Call</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {devicePermissionAlert && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 left-4 right-4 sm:max-w-sm"
          >
            <Alert variant="destructive">
              <AlertTitle>Device Access</AlertTitle>
              <AlertDescription>
                Please allow camera and microphone access in your browser settings.
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Interview;