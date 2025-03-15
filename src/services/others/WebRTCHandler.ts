class WebRTCHandler {
  peerConnection: RTCPeerConnection;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream = new MediaStream();
  private sendSignal: (event: string, data: any) => Promise<void>;
  private audioTrack: MediaStreamTrack | null = null;
  private videoTrack: MediaStreamTrack | null = null;

  constructor(sendSignal: (event: string, data: any) => Promise<void>) {
    this.peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        // Replace with your own TURN server if needed
        {
          urls: "turn:numb.viagenie.ca",
          credential: "muazkh",
          username: "webrtc@live.com",
        },
      ],
    });

    this.sendSignal = sendSignal;

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendSignal("ice-candidate", event.candidate).catch((error) =>
          console.error("Failed to send ICE candidate:", error)
        );
      }
    };

    this.peerConnection.ontrack = (event) => {
      console.log("Received remote track:", event.track.kind);
      this.remoteStream.addTrack(event.track);
    };

    this.peerConnection.oniceconnectionstatechange = () => {
      const state = this.peerConnection.iceConnectionState;
      console.log("ICE connection state:", state);
    };
  }

  async initializeLocalStream() {
    if (this.localStream) return this.localStream;

    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      if (!this.localStream.getTracks().length) {
        throw new Error("No tracks available in local stream");
      }

      this.localStream.getTracks().forEach((track) => {
        console.log(`Adding ${track.kind} track to peerConnection`);
        if (track.kind === "audio") this.audioTrack = track;
        else if (track.kind === "video") this.videoTrack = track;
        this.peerConnection.addTrack(track, this.localStream!);
      });

      return this.localStream;
    } catch (error) {
      console.error("Error initializing local stream:", error);
      throw error;
    }
  }

  async createOffer() {
    try {
      await this.initializeLocalStream();
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);
      await this.sendSignal("offer", offer);
      console.log("Offer created and sent");
    } catch (error) {
      console.error("Error creating offer:", error);
      throw error;
    }
  }

  async createAnswer(offer: RTCSessionDescriptionInit) {
    try {
      await this.initializeLocalStream();
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      await this.sendSignal("answer", answer);
      console.log("Answer created and sent");
    } catch (error) {
      console.error("Error creating answer:", error);
      throw error;
    }
  }

  async handleAnswer(answer: RTCSessionDescriptionInit) {
    try {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      console.log("Answer handled successfully");
    } catch (error) {
      console.error("Error handling answer:", error);
      throw error;
    }
  }

  async addIceCandidate(candidate: RTCIceCandidateInit) {
    try {
      if (candidate) {
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        console.log("ICE candidate added");
      }
    } catch (error) {
      console.error("Error adding ICE candidate:", error);
    }
  }

  toggleAudio() {
    if (this.audioTrack) {
      this.audioTrack.enabled = !this.audioTrack.enabled;
      console.log("Audio toggled:", this.audioTrack.enabled);
      return this.audioTrack.enabled;
    }
    return false;
  }

  toggleVideo() {
    if (this.videoTrack) {
      this.videoTrack.enabled = !this.videoTrack.enabled;
      console.log("Video toggled:", this.videoTrack.enabled);
      return this.videoTrack.enabled;
    }
    return false;
  }

  async switchCamera(deviceId?: string) {
    if (!this.localStream) return;

    try {
      this.localStream.getVideoTracks().forEach((track) => track.stop());
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: deviceId ? { deviceId: { exact: deviceId } } : true,
      });
      const newVideoTrack = newStream.getVideoTracks()[0];
      this.videoTrack = newVideoTrack;

      const sender = this.peerConnection.getSenders().find((s) => s.track?.kind === "video");
      if (sender) await sender.replaceTrack(newVideoTrack);

      this.localStream.getVideoTracks().forEach((track) => this.localStream!.removeTrack(track));
      this.localStream.addTrack(newVideoTrack);
      console.log("Camera switched");
      return this.localStream;
    } catch (error) {
      console.error("Error switching camera:", error);
      throw error;
    }
  }

  async switchAudioDevice(deviceId: string) {
    if (!this.localStream) return;

    try {
      this.localStream.getAudioTracks().forEach((track) => track.stop());
      const newStream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: { exact: deviceId } },
      });
      const newAudioTrack = newStream.getAudioTracks()[0];
      this.audioTrack = newAudioTrack;

      const sender = this.peerConnection.getSenders().find((s) => s.track?.kind === "audio");
      if (sender) await sender.replaceTrack(newAudioTrack);

      this.localStream.getAudioTracks().forEach((track) => this.localStream!.removeTrack(track));
      this.localStream.addTrack(newAudioTrack);
      console.log("Audio device switched");
      return this.localStream;
    } catch (error) {
      console.error("Error switching audio device:", error);
      throw error;
    }
  }

  async getAvailableDevices() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return {
        cameras: devices.filter((d) => d.kind === "videoinput"),
        microphones: devices.filter((d) => d.kind === "audioinput"),
        speakers: devices.filter((d) => d.kind === "audiooutput"),
      };
    } catch (error) {
      console.error("Error getting devices:", error);
      throw error;
    }
  }

  getRemoteStream() {
    return this.remoteStream;
  }

  closeConnection() {
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
    }
    this.peerConnection.close();
    console.log("Connection closed");
  }
}

export default WebRTCHandler;