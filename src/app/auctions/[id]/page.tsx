"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Auction, Bid, User, Role } from "@prisma/client";
import LiveVideo from '@/components/LiveVideo';

interface ExtendedUser extends User {
  id: string;
  role: Role;
}

interface ExtendedSession {
  user?: ExtendedUser;
}

interface AuctionWithDetails extends Auction {
  id: string;
  title: string;
  description: string;
  image: string;
  startPrice: number;
  currentPrice: number;
  startDate: Date;
  endDate: Date;
  ownerId: string;
  bids: (Bid & {
    user: ExtendedUser;
  })[];
  owner: ExtendedUser;
}

export default function AuctionPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session, status } = useSession() as { data: ExtendedSession | null; status: string };
  const [auction, setAuction] = useState<AuctionWithDetails | null>(null);
  const [bidAmount, setBidAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchAuction = async () => {
      try {
        const response = await fetch(`/api/auctions/${params.id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch auction");
        }
        const data = await response.json();
        setAuction(data);
      } catch (error) {
        console.error("Error fetching auction:", error);
        toast.error("حدث خطأ أثناء جلب بيانات المزاد");
      } finally {
        setLoading(false);
      }
    };

    fetchAuction();
  }, [params.id]);

  const handleEndAuction = async () => {
    try {
      const response = await fetch(`/api/auctions/${params.id}/end`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to end auction");
      }

      toast.success("تم إنهاء المزاد بنجاح");
      router.refresh();
    } catch (error) {
      console.error("Error ending auction:", error);
      toast.error("حدث خطأ أثناء إنهاء المزاد");
    }
  };

  const handleBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      toast.error("يرجى تسجيل الدخول لتقديم مزايدة");
      return;
    }

    // Check if user can bid (not admin or owner)
    const isOwner = session?.user?.role === "OWNER";
    const isAdmin = session?.user?.role === "ADMIN";
    if (isAdmin || isOwner) {
      toast.error("لا يمكن للمدير أو المالك تقديم مزايدة");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/auctions/${params.id}/bid`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: parseFloat(bidAmount),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to place bid");
      }

      toast.success("تم تقديم المزايدة بنجاح");
      setBidAmount("");
      router.refresh();
    } catch (error) {
      console.error("Error placing bid:", error);
      toast.error("حدث خطأ أثناء تقديم المزايدة");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || status === "loading") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            المزاد غير موجود
          </h1>
          <button
            onClick={() => router.push("/auctions")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            العودة إلى المزادات
          </button>
        </div>
      </div>
    );
  }

  const isOwner = session?.user?.role === "OWNER";
  const isAdmin = session?.user?.role === "ADMIN";
  const canManageAuction = isOwner || isAdmin;
  const canBid = session?.user && !isOwner && !isAdmin;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Live Video for this auction */}
        <div className="mb-8">
          <LiveVideo channelName={auction.id} isOwner={isOwner} />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">{auction.title}</h1>

        {/* Auction Details */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <img
                src={auction.image}
                alt={auction.title}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">السعر الابتدائي:</h3>
                <p className="text-gray-600">{auction.startPrice} ريال</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">أعلى مزايدة:</h3>
                <p className="text-gray-600">
                  {auction.bids && auction.bids.length > 0
                    ? `${auction.bids[0].amount} ريال`
                    : `${auction.currentPrice} ريال`}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">تاريخ البداية:</h3>
                <p className="text-gray-600">
                  {new Date(auction.startDate).toLocaleDateString("ar-SA", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">الحالة:</h3>
                <p className="text-gray-600">
                  {new Date() < new Date(auction.endDate) ? "نشط" : "منتهي"}
                </p>
              </div>
            </div>
          </div>

          {/* Bid Form - Only for regular users */}
          {status === "authenticated" && new Date() < new Date(auction.endDate) && canBid && (
            <div className="mt-8">
              <form onSubmit={handleBid} className="space-y-4">
                <div>
                  <label
                    htmlFor="bidAmount"
                    className="block text-sm font-medium text-gray-700"
                  >
                    قيمة المزايدة
                  </label>
                  <input
                    type="number"
                    id="bidAmount"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    min={auction.bids && auction.bids.length > 0 ? auction.bids[0].amount + 1 : auction.startPrice + 1}
                    step="1"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                >
                  {submitting ? "جاري التقديم..." : "تقديم مزايدة"}
                </button>
              </form>
            </div>
          )}

          {/* End Auction Button - Only for owners/admins */}
          {canManageAuction && new Date() < new Date(auction.endDate) && (
            <div className="mt-4">
              <button
                onClick={handleEndAuction}
                className="w-full bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                إنهاء المزاد
              </button>
            </div>
          )}

          {/* Message for owners/admins who can't bid */}
          {status === "authenticated" && new Date() < new Date(auction.endDate) && !canBid && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800">
                {isOwner ? "لا يمكن للمالك المزايدة على المزادات" : "لا يمكن للمدير المزايدة على المزادات"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 