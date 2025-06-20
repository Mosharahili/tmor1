"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import AgoraRTC, {
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
} from "agora-rtc-sdk-ng";
import { Role } from "@prisma/client";
import { Maximize2, Minimize2, Mic, MicOff, Video, VideoOff, RefreshCw, Repeat } from "lucide-react";

interface ExtendedUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: Role;
}

interface ExtendedSession {
  user?: ExtendedUser;
}

interface LiveVideoProps {
  auctionId: string;
  isOwner: boolean;
}

// Agora configuration
const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID || "";
const client: IAgoraRTCClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

export default function LiveVideo({ auctionId, isOwner }: LiveVideoProps) {
  const { data: session, status } = useSession() as { data: ExtendedSession | null; status: string };
  const [isStreaming, setIsStreaming] = useState(false);
  const [isWatching, setIsWatching] = useState(false);
  const videoRef = useRef<HTMLDivElement>(null);
  const localVideoTrack = useRef<ICameraVideoTrack | null>(null);
  const localAudioTrack = useRef<IMicrophoneAudioTrack | null>(null);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>("");
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Debug information
  useEffect(() => {
    console.log("LiveVideo Component - Status:", status);
    console.log("LiveVideo Component - Session:", JSON.stringify(session, null, 2));
    console.log("LiveVideo Component - isOwner prop:", isOwner);
    console.log("LiveVideo Component - User Role:", session?.user?.role);
    console.log("LiveVideo Component - isStreaming:", isStreaming);
    console.log("LiveVideo Component - isWatching:", isWatching);
  }, [status, session, isOwner, isStreaming, isWatching]);

  useEffect(() => {
    // Fetch available cameras
    async function getCameras() {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter((d) => d.kind === "videoinput");
        setCameras(videoInputs);
        if (videoInputs.length > 0 && !selectedCameraId) {
          setSelectedCameraId(videoInputs[0].deviceId);
        }
      } catch (e) {
        // ignore
      }
    }
    getCameras();
  }, []);

  useEffect(() => {
    return () => {
      stopStream();
    };
  }, []);

  useEffect(() => {
    function handleFullscreenChange() {
      if (document.fullscreenElement) {
        setIsFullscreen(true);
      } else {
        setIsFullscreen(false);
      }
    }
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const startStream = async () => {
    try {
      // Request permissions and get local tracks
      let videoTrack;
      if (selectedCameraId) {
        videoTrack = await AgoraRTC.createCameraVideoTrack({ cameraId: selectedCameraId });
        localVideoTrack.current = videoTrack;
        localAudioTrack.current = await AgoraRTC.createMicrophoneAudioTrack();
      } else {
      [localAudioTrack.current, localVideoTrack.current] = await AgoraRTC.createMicrophoneAndCameraTracks();
      }
      // Join the channel
      await client.join(appId, auctionId, null, null);
      // Publish the tracks
      await client.publish([localAudioTrack.current, localVideoTrack.current]);
      // Play the local video
      if (videoRef.current) {
        localVideoTrack.current.play(videoRef.current);
      }
      setIsStreaming(true);
      toast.success("تم بدء البث المباشر بنجاح");

      // Handle user joined event
      client.on("user-published", async (user: IAgoraRTCRemoteUser, mediaType: "audio" | "video") => {
        await client.subscribe(user, mediaType);
        if (mediaType === "video" && videoRef.current) {
          user.videoTrack?.play(videoRef.current);
        }
        if (mediaType === "audio") {
          user.audioTrack?.play();
        }
      });

    } catch (error) {
      console.error("Error starting stream:", error);
      toast.error("حدث خطأ أثناء بدء البث المباشر");
    }
  };

  const stopStream = async () => {
    try {
      if (localVideoTrack.current) {
        localVideoTrack.current.stop();
        localVideoTrack.current.close();
      }
      if (localAudioTrack.current) {
        localAudioTrack.current.stop();
        localAudioTrack.current.close();
      }
      await client.leave();
      setIsStreaming(false);
      setIsWatching(false);
      toast.success("تم إيقاف البث المباشر");
    } catch (error) {
      console.error("Error stopping stream:", error);
    }
  };

  const startWatching = async () => {
    try {
      await client.join(appId, auctionId, null, null);
      setIsWatching(true);
      toast.success("جاري الاتصال بالبث المباشر");

      client.on("user-published", async (user: IAgoraRTCRemoteUser, mediaType: "audio" | "video") => {
        await client.subscribe(user, mediaType);
        if (mediaType === "video" && videoRef.current) {
          user.videoTrack?.play(videoRef.current);
        }
        if (mediaType === "audio") {
          user.audioTrack?.play();
        }
      });

    } catch (error) {
      console.error("Error watching stream:", error);
      toast.error("حدث خطأ أثناء الاتصال بالبث المباشر");
      setIsWatching(false);
    }
  };

  const stopWatching = async () => {
    try {
      await client.leave();
      setIsWatching(false);
      toast.success("تم إيقاف مشاهدة البث المباشر");
    } catch (error) {
      console.error("Error stopping watch:", error);
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      } else if ((videoRef.current as any).webkitRequestFullscreen) {
        (videoRef.current as any).webkitRequestFullscreen();
      } else if ((videoRef.current as any).msRequestFullscreen) {
        (videoRef.current as any).msRequestFullscreen();
      }
    }
  };

  const handleMinimize = () => {
    if (document.fullscreenElement) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
    }
  };

  const handleMute = () => {
    if (localAudioTrack.current) {
      if (isMuted) {
        localAudioTrack.current.setEnabled(true);
      } else {
        localAudioTrack.current.setEnabled(false);
      }
      setIsMuted(!isMuted);
    }
  };

  const handleVideoToggle = () => {
    if (localVideoTrack.current) {
      if (isVideoOff) {
        localVideoTrack.current.setEnabled(true);
      } else {
        localVideoTrack.current.setEnabled(false);
      }
      setIsVideoOff(!isVideoOff);
    }
  };

  // Flip camera (front/back) for mobile
  const handleFlipCamera = async () => {
    if (cameras.length < 2) return;
    // Try to find a camera with a different facing mode
    const current = cameras.find(cam => cam.deviceId === selectedCameraId);
    let nextCamera;
    if (current) {
      // Try to switch between user/environment
      const isFront = current.label.toLowerCase().includes("front") || current.label.toLowerCase().includes("user");
      nextCamera = cameras.find(cam => {
        const isNextFront = cam.label.toLowerCase().includes("front") || cam.label.toLowerCase().includes("user");
        return cam.deviceId !== current.deviceId && isFront !== isNextFront;
      });
      // If not found, just pick the next available
      if (!nextCamera) {
        const idx = cameras.findIndex(cam => cam.deviceId === current.deviceId);
        nextCamera = cameras[(idx + 1) % cameras.length];
      }
    } else {
      nextCamera = cameras[0];
    }
    if (nextCamera) {
      setSelectedCameraId(nextCamera.deviceId);
      if (isStreaming && localVideoTrack.current) {
        await localVideoTrack.current.setDevice(nextCamera.deviceId);
      }
    }
  };

  if (status === "loading") {
    return (
      <div className="bg-gray-100 p-4 rounded-lg text-center">
        <p className="text-gray-600">جاري التحميل...</p>
      </div>
    );
  }

  if (status !== "authenticated" || !session) {
    return (
      <div className="bg-gray-100 p-4 rounded-lg text-center">
        <p className="text-gray-600">يرجى تسجيل الدخول لمشاهدة البث المباشر</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden w-full max-w-2xl mx-auto" style={{maxHeight: '80vh'}}>
        <div
          ref={videoRef}
          className="w-full h-full live-video-fullscreen-target"
        />
        {/* Overlay: show message if no stream */}
        {!isStreaming && !isWatching && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-10">
            <p className="text-white text-lg">لا يوجد بث مباشر حالياً</p>
          </div>
        )}
        {/* Controls overlayed at the bottom of the video */}
        <div className="absolute bottom-0 left-0 w-full flex flex-wrap items-center justify-between gap-2 p-2 bg-black bg-opacity-60 z-20 live-video-controls">
          <div className="flex items-center gap-2 flex-wrap">
            {((session?.user?.role === "OWNER" || session?.user?.role === "ADMIN")) && (
              <>
                <button
                  type="button"
                  onClick={handleMute}
                  className="text-white bg-gray-700 hover:bg-green-600 rounded p-2"
                  title={isMuted ? "إلغاء كتم الصوت" : "كتم الصوت"}
                >
                  {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
                <button
                  type="button"
                  onClick={handleVideoToggle}
                  className="text-white bg-gray-700 hover:bg-green-600 rounded p-2"
                  title={isVideoOff ? "تشغيل الكاميرا" : "إيقاف الكاميرا"}
                >
                  {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                </button>
                {isOwner && cameras.length > 1 && (
                  <>
                    <select
                      className="bg-gray-800 text-white rounded p-1 ml-2"
                      value={selectedCameraId}
                      onChange={async e => {
                        setSelectedCameraId(e.target.value);
                        if (isStreaming && localVideoTrack.current) {
                          await localVideoTrack.current.setDevice(e.target.value);
                        }
                      }}
                      title="تغيير الكاميرا"
                    >
                      {cameras.map((cam) => (
                        <option key={cam.deviceId} value={cam.deviceId}>{cam.label || `كاميرا ${cam.deviceId}`}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={handleFlipCamera}
                      className="text-white bg-gray-700 hover:bg-green-600 rounded p-2 ml-2 flex items-center gap-1"
                      title="تبديل الكاميرا الأمامية/الخلفية"
                    >
                      <Repeat className="w-5 h-5" />
                      <span className="text-xs">تبديل</span>
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="text-white bg-yellow-600 hover:bg-yellow-700 rounded p-2 ml-2"
                  title="تحديث البث"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </>
            )}
            {/* Fullscreen/Minimize button for all users */}
            {!isFullscreen ? (
              <button
                type="button"
                onClick={handleFullscreen}
                className="text-white bg-gray-700 hover:bg-green-600 rounded p-2"
                title="تكبير الشاشة"
              >
                <Maximize2 className="w-5 h-5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleMinimize}
                className="text-white bg-gray-700 hover:bg-yellow-600 rounded p-2"
                title="تصغير الشاشة"
              >
                <Minimize2 className="w-5 h-5" />
              </button>
            )}
          </div>
          {/* Start/Stop/Watch buttons */}
          <div className="flex gap-2 flex-wrap">
        {isOwner ? (
          isStreaming ? (
            <button
              onClick={stopStream}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              إيقاف البث
            </button>
          ) : (
            <button
              onClick={startStream}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              بدء البث
            </button>
          )
        ) : (
          isWatching ? (
            <button
              onClick={stopWatching}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              إيقاف المشاهدة
            </button>
          ) : (
            <button
              onClick={startWatching}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              مشاهدة البث
            </button>
          )
        )}
      </div>
        </div>
      </div>
      <div className="text-xs text-gray-400 text-center mt-2">
        ملاحظة: يتم عرض الفيديو داخل عنصر div بواسطة AgoraRTC، لذلك لا يمكن إظهار عناصر تحكم الفيديو الأصلية للمتصفح.<br />
        جميع عناصر التحكم متاحة دائماً في الشريط أسفل الفيديو أو فوقه.
      </div>
      <style jsx global>{`
        .live-video-fullscreen-target:fullscreen {
          width: 100vw !important;
          height: 100vh !important;
          max-width: 100vw !important;
          max-height: 100vh !important;
          background: black;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .live-video-controls {
          z-index: 1000;
        }
      `}</style>
    </div>
  );
} 