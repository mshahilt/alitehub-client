class WebRTCHandler {
  peerConnection: RTCPeerConnection;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream = new MediaStream();
  private sendSignal: (event: string, data: any) => void;
  private audioTrack: MediaStreamTrack | null = null;
  private videoTrack: MediaStreamTrack | null = null;

  constructor(sendSignal: (event: string, data: any) => void) {
    this.peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { 
          urls: 'turn:numb.viagenie.ca',
          credential: 'muazkh',
          username: 'webrtc@live.com'
        }
      ],
    });

    this.sendSignal = sendSignal;

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendSignal("ice-candidate", event.candidate);
      }
    };

    this.peerConnection.ontrack = (event) => {
      console.log("Remote track received:", event.track.kind);
      this.remoteStream.addTrack(event.track);
    };

    this.peerConnection.oniceconnectionstatechange = () => {
      console.log("ICE connection state:", this.peerConnection.iceConnectionState);
    };
  }

  async getLocalStream() {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      this.localStream.getTracks().forEach((track) => {
        if (this.localStream) {
          if (track.kind === 'audio') {
            this.audioTrack = track;
          } else if (track.kind === 'video') {
            this.videoTrack = track;
          }
          this.peerConnection.addTrack(track, this.localStream);
        }
      });

      return this.localStream;
    } catch (error) {
      console.error("Error getting local stream:", error);
      throw error;
    }
  }

  async createOffer() {
    try {
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);
      this.sendSignal("offer", offer);
    } catch (error) {
      console.error("Error creating offer:", error);
    }
  }

  async createAnswer(offer: RTCSessionDescriptionInit) {
    try {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      this.sendSignal("answer", answer);
    } catch (error) {
      console.error("Error creating answer:", error);
    }
  }

  async handleAnswer(answer: RTCSessionDescriptionInit) {
    try {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    } catch (error) {
      console.error("Error handling answer:", error);
    }
  }

  async addIceCandidate(candidate: RTCIceCandidateInit) {
    try {
      if (candidate) {
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      }
    } catch (error) {
      console.error("Error adding ICE candidate:", error);
    }
  }

  toggleAudio() {
    if (this.audioTrack) {
      this.audioTrack.enabled = !this.audioTrack.enabled;
      return this.audioTrack.enabled;
    }
    return false;
  }

  toggleVideo() {
    if (this.videoTrack) {
      this.videoTrack.enabled = !this.videoTrack.enabled;
      return this.videoTrack.enabled;
    }
    return false;
  }

  async switchCamera(deviceId?: string) {
    if (!this.localStream) return;
    
    // Stop current video track
    this.localStream.getVideoTracks().forEach(track => track.stop());
    
    // Get new video track
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: deviceId ? { deviceId: { exact: deviceId } } : true
      });
      
      const newVideoTrack = newStream.getVideoTracks()[0];
      this.videoTrack = newVideoTrack;
      
      // Replace track in peer connection
      const senders = this.peerConnection.getSenders();
      const videoSender = senders.find(sender => 
        sender.track && sender.track.kind === 'video'
      );
      
      if (videoSender) {
        await videoSender.replaceTrack(newVideoTrack);
      }
      
      // Replace track in local stream
      const oldVideoTracks = this.localStream.getVideoTracks();
      if (oldVideoTracks.length > 0) {
        this.localStream.removeTrack(oldVideoTracks[0]);
      }
      this.localStream.addTrack(newVideoTrack);
      
      return this.localStream;
    } catch (error) {
      console.error("Error switching camera:", error);
      throw error;
    }
  }

  async switchAudioDevice(deviceId: string) {
    if (!this.localStream) return;
    
    // Stop current audio track
    this.localStream.getAudioTracks().forEach(track => track.stop());
    
    // Get new audio track
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: { exact: deviceId } }
      });
      
      const newAudioTrack = newStream.getAudioTracks()[0];
      this.audioTrack = newAudioTrack;
      
      // Replace track in peer connection
      const senders = this.peerConnection.getSenders();
      const audioSender = senders.find(sender => 
        sender.track && sender.track.kind === 'audio'
      );
      
      if (audioSender) {
        await audioSender.replaceTrack(newAudioTrack);
      }
      
      // Replace track in local stream
      const oldAudioTracks = this.localStream.getAudioTracks();
      if (oldAudioTracks.length > 0) {
        this.localStream.removeTrack(oldAudioTracks[0]);
      }
      this.localStream.addTrack(newAudioTrack);
      
      return this.localStream;
    } catch (error) {
      console.error("Error switching audio device:", error);
      throw error;
    }
  }

  async getAvailableDevices() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(device => device.kind === 'videoinput');
      const microphones = devices.filter(device => device.kind === 'audioinput');
      const speakers = devices.filter(device => device.kind === 'audiooutput');
      
      return { cameras, microphones, speakers };
    } catch (error) {
      console.error("Error getting available devices:", error);
      throw error;
    }
  }

  getRemoteStream() {
    return this.remoteStream;
  }

  closeConnection() {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
    }
    this.peerConnection.close();
  }
}

export default WebRTCHandler;