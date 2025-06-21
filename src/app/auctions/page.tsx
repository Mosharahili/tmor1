'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FaGavel, FaClock, FaMoneyBillWave, FaVideo, FaStop, FaCircle } from 'react-icons/fa';
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import dynamic from 'next/dynamic';

const LiveVideo = dynamic(() => import('@/components/LiveVideo'), {
  ssr: false,
  loading: () => <p>Loading video stream...</p>,
});

interface Auction {
  id: string;
  title: string;
  description: string;
  startPrice: number;
  currentPrice: number;
  startDate: string;
  endDate: string;
  status: 'UPCOMING' | 'ACTIVE' | 'ENDED';
  images: string[];
  winner?: { id: string; name?: string; email?: string };
  ownerId?: string;
}

export default function AuctionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAuction, setSelectedAuction] = useState<Auction | null>(null);
  const [bidAmount, setBidAmount] = useState('');
  const [showBidModal, setShowBidModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{ [key: string]: string }>({});
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showLive, setShowLive] = useState(false);
  
  // Live video states
  const [isStreaming, setIsStreaming] = useState(false);
  const [isWatching, setIsWatching] = useState(false);
  const [client, setClient] = useState<any>(null);
  const [videoTrack, setVideoTrack] = useState<any>(null);
  const [audioTrack, setAudioTrack] = useState<any>(null);
  const videoRef = useRef<HTMLDivElement>(null);
  const [isLoadingStream, setIsLoadingStream] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);

  const isAdminOrOwner = session?.user && ((session.user as any).role === "ADMIN" || (session.user as any).role === "OWNER");
  const canManageAuction = (auction: Auction) => {
    return !!isAdminOrOwner;
  };
  const canBid = (auction: Auction) => {
    // Only regular users can bid, not admins or owners
    return !!(session?.user && !isAdminOrOwner);
  };

  useEffect(() => {
    fetchAuctions();
    const interval = setInterval(updateTimeLeft, 1000);
    return () => {
      clearInterval(interval);
      // Cleanup stream when component unmounts
      if (client) {
        stopStream();
      }
    };
  }, []);

  // Live video functions - only load Agora when needed
  const startStream = async () => {
    setIsLoadingStream(true);
    setStreamError(null);
    try {
      console.log("Starting stream...");
      const { default: AgoraRTC } = await import('agora-rtc-sdk-ng');
      const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID || "";
      const channelName = "global-auctions-stream";
      const uid = null; // Let Agora assign UID
      // Fetch token from backend
      const tokenRes = await fetch("/api/agora/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channelName, uid, role: "host" })
      });
      const tokenData = await tokenRes.json();
      if (!tokenRes.ok || !tokenData.token) {
        throw new Error(tokenData.error || "Failed to fetch Agora token");
      }
      const token = tokenData.token;
      
      console.log("Agora App ID:", appId);
      if (!appId) {
        throw new Error("Agora App ID is not configured");
      }
      
      const agoraClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
      setClient(agoraClient);
      
      console.log("Creating tracks...");
      const [audio, video] = await AgoraRTC.createMicrophoneAndCameraTracks();
      setAudioTrack(audio);
      setVideoTrack(video);
      
      console.log("Joining channel with token...");
      await agoraClient.join(appId, channelName, token, null);
      
      console.log("Publishing tracks...");
      await agoraClient.publish([audio, video]);
      
      console.log("Playing video...");
      if (videoRef.current) {
        video.play(videoRef.current);
      }
      
      setIsStreaming(true);
      setIsLoadingStream(false);
      console.log("Stream started successfully!");
      
      agoraClient.on("user-published", async (user: any, mediaType: "audio" | "video") => {
        console.log("User published:", user, mediaType);
        await agoraClient.subscribe(user, mediaType);
        if (mediaType === "video" && videoRef.current) {
          user.videoTrack?.play(videoRef.current);
        }
        if (mediaType === "audio") {
          user.audioTrack?.play();
        }
      });
      
    } catch (error) {
      setIsLoadingStream(false);
      setStreamError(error instanceof Error ? error.message : 'حدث خطأ أثناء بدء البث');
      console.error("Error starting stream:", error);
    }
  };

  const stopStream = async () => {
    try {
      if (videoTrack) {
        videoTrack.stop();
        videoTrack.close();
      }
      if (audioTrack) {
        audioTrack.stop();
        audioTrack.close();
      }
      if (client) {
        await client.leave();
      }
      setIsStreaming(false);
      setIsWatching(false);
    } catch (error) {
      console.error("Error stopping stream:", error);
    }
  };

  const startWatching = async () => {
    setIsLoadingStream(true);
    setStreamError(null);
    try {
      const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID || "";
      const channelName = "global-auctions-stream";
      const uid = null;
      // Fetch token from backend
      const tokenRes = await fetch("/api/agora/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channelName, uid, role: "audience" })
      });
      const tokenData = await tokenRes.json();
      if (!tokenRes.ok || !tokenData.token) {
        throw new Error(tokenData.error || "Failed to fetch Agora token");
      }
      const token = tokenData.token;

      const { default: AgoraRTC } = await import('agora-rtc-sdk-ng');
      
      const agoraClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
      setClient(agoraClient);
      
      await agoraClient.join(appId, channelName, token, null);
      setIsWatching(true);
      setIsLoadingStream(false);
      
      agoraClient.on("user-published", async (user: any, mediaType: "audio" | "video") => {
        await agoraClient.subscribe(user, mediaType);
        if (mediaType === "video" && videoRef.current) {
          user.videoTrack?.play(videoRef.current);
        }
        if (mediaType === "audio") {
          user.audioTrack?.play();
        }
      });
      
    } catch (error) {
      setIsLoadingStream(false);
      setStreamError(error instanceof Error ? error.message : 'حدث خطأ أثناء مشاهدة البث');
      console.error("Error watching stream:", error);
    }
  };

  const stopWatching = async () => {
    try {
      if (client) {
        await client.leave();
      }
      setIsWatching(false);
    } catch (error) {
      console.error("Error stopping watch:", error);
    }
  };

  const fetchAuctions = async () => {
    try {
      const response = await fetch('/api/auctions');
      if (!response.ok) throw new Error('Failed to fetch auctions');
      const data = await response.json();
      setAuctions(data);
    } catch (err) {
      setError('حدث خطأ أثناء جلب المزادات');
    } finally {
      setIsLoading(false);
    }
  };

  const updateTimeLeft = () => {
    const now = new Date();
    const newTimeLeft: { [key: string]: string } = {};

    auctions.forEach((auction) => {
      const startDate = new Date(auction.startDate);
      const endDate = new Date(auction.endDate);
      
      if (now < startDate) {
        const diff = startDate.getTime() - now.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        newTimeLeft[auction.id] = `يبدأ بعد ${hours} ساعة و ${minutes} دقيقة`;
      } else if (now < endDate) {
        const diff = endDate.getTime() - now.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        newTimeLeft[auction.id] = `متبقي ${hours} ساعة و ${minutes} دقيقة`;
      } else {
        newTimeLeft[auction.id] = 'انتهى المزاد';
      }
    });

    setTimeLeft(newTimeLeft);
  };

  const handleStartAuction = async (auctionId: string) => {
    try {
      const response = await fetch('/api/auctions', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: auctionId,
          action: 'start',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start auction');
      }

      fetchAuctions();
    } catch (err) {
      setError('حدث خطأ أثناء بدء المزاد');
    }
  };

  const handleEndAuction = async (auctionId: string) => {
    try {
      const response = await fetch('/api/auctions', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: auctionId,
          action: 'end',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to end auction');
      }

      fetchAuctions();
    } catch (err) {
      setError('حدث خطأ أثناء إنهاء المزاد');
    }
  };

  const handleCancelAuction = async (auctionId: string) => {
    try {
      const response = await fetch('/api/auctions', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: auctionId,
          action: 'cancel',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to cancel auction');
      }

      fetchAuctions();
    } catch (err) {
      setError('حدث خطأ أثناء إلغاء المزاد');
    }
  };

  const handleBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAuction || !session) return;

    try {
      const response = await fetch(`/api/auctions/${selectedAuction.id}/bids`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(bidAmount),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to place bid');
      }

      setShowBidModal(false);
      setBidAmount('');
      fetchAuctions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء تقديم المزايدة');
    }
  };

  const handleAddToCart = async (auction: Auction) => {
    if (!session) {
      router.push('/login');
      return;
    }

    setIsAddingToCart(true);
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          auctionId: auction.id,
          price: auction.currentPrice,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add to cart');
      }

      router.push('/cart');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء إضافة المزاد إلى السلة');
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (isLoading) return <div className="text-center p-8">جاري التحميل...</div>;
  if (error) return <div className="text-center text-red-500 p-8">{error}</div>;

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">المزادات</h1>
        {isAdminOrOwner && (
          <Link href="/dashboard/auctions/new" className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <FaGavel />
            <span>إضافة مزاد جديد</span>
          </Link>
        )}
      </div>

      <button onClick={() => setShowLive(!showLive)} className="mb-4 bg-blue-500 text-white px-4 py-2 rounded">
        {showLive ? 'Hide Live Stream' : 'Show Live Stream'}
      </button>

      {showLive && <LiveVideo channelName="global-auctions-stream" />}

      {isLoading ? (
        <p>جاري تحميل المزادات...</p>
      ) : error ? (
        <div className="text-center text-red-500 p-8">{error}</div>
      ) : (
        <>
          {/* Auctions List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {auctions.map((auction) => (
              <div key={auction.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-2">{auction.title}</h2>
                  <p className="text-gray-600 mb-4">{auction.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-700">
                      <FaMoneyBillWave className="ml-2" />
                      <span>السعر الابتدائي: {auction.startPrice} ريال</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <FaGavel className="ml-2" />
                      <span>أعلى مزايدة: {auction.currentPrice} ريال</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <FaClock className="ml-2" />
                      <span>تاريخ البداية: {new Date(auction.startDate).toLocaleString('ar-SA')}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <span>الحالة: {
                        auction.status === 'UPCOMING' ? 'قريباً' :
                        auction.status === 'ACTIVE' ? 'نشط' : 'منتهي'
                      }</span>
                    </div>
                  </div>

                  {/* Management buttons for owners/admins */}
                  {canManageAuction(auction) && (
                    <div className="space-y-2 mb-4">
                      {auction.status === 'UPCOMING' && (
                        <button
                          onClick={() => handleStartAuction(auction.id)}
                          className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
                        >
                          بدء المزاد
                        </button>
                      )}
                      {auction.status === 'ACTIVE' && (
                        <div className="space-y-2">
                          <button
                            onClick={() => handleEndAuction(auction.id)}
                            className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600"
                          >
                            إنهاء المزاد
                          </button>
                          <button
                            onClick={() => handleCancelAuction(auction.id)}
                            className="w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600"
                          >
                            إلغاء المزاد
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Bid button for regular users only */}
                  {auction.status === "ACTIVE" && canBid(auction) && (
                    <button
                      onClick={() => {
                        setSelectedAuction(auction);
                        setShowBidModal(true);
                      }}
                      className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 mt-2"
                    >
                      تقديم مزايدة
                    </button>
                  )}

                  {/* View auction details for all users */}
                  <Link
                    href={`/auctions/${auction.id}`}
                    className="w-full bg-gray-500 text-white py-2 rounded hover:bg-gray-600 block text-center mt-2"
                  >
                    عرض تفاصيل المزاد
                  </Link>

                  {auction.status === "ENDED" && (
                    <div className="mt-4">
                      <div className="text-green-700 font-bold">
                        الفائز: {auction.winner ? (auction.winner.name || auction.winner.email) : "لا يوجد"}
                      </div>
                      <div className="text-gray-700">
                        السعر النهائي: {auction.currentPrice} ريال
                      </div>
                      {session && auction.winner && (session.user as any).id === auction.winner.id && (
                        <div className="mt-2 text-blue-700 font-semibold">
                          مبروك! لقد ربحت هذا المزاد. <Link href="/cart" className="underline">اذهب إلى السلة</Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Show message if no auctions */}
          {auctions.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-gray-600 mb-4">لا توجد مزادات حالياً</h3>
              <p className="text-gray-500">سيتم إضافة مزادات جديدة قريباً</p>
            </div>
          )}
        </>
      )}

      {showBidModal && selectedAuction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">تقديم مزايدة</h2>
            <form onSubmit={handleBid}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  قيمة المزايدة (ريال سعودي)
                </label>
                <input
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  min={selectedAuction.currentPrice + 1}
                  step="0.01"
                  required
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowBidModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  تقديم المزايدة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
} 