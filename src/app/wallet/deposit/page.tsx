"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Script from "next/script";

declare global {
  interface Window {
    Moyasar: any;
  }
}

const MOYASAR_PUBLISHABLE_KEY = "pk_test_z5MZwKtzQfRw7sUFoUVYtsotbzPBJNf6DoND2osN";

export default function WalletDepositPage() {
  const { data: session } = useSession();
  const [amount, setAmount] = useState(500);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [moyasarReady, setMoyasarReady] = useState(false);

  const handlePayment = async () => {
    console.log("Payment button clicked. moyasarReady:", moyasarReady);
    setLoading(true);
    setPaymentStatus(null);
    if (typeof window !== "undefined" && window.Moyasar) {
      window.Moyasar.init({
        element: "#moyasar-payment",
        amount: amount * 100, // in halalas
        currency: "SAR",
        description: "شحن المحفظة",
        publishable_api_key: MOYASAR_PUBLISHABLE_KEY,
        methods: ["mada", "applepay"],
        callback_url: window.location.href, // reload after payment
        on_completed: async function (payment: { id: string }) {
          // Call backend to verify and update wallet
          const res = await fetch("/api/wallet/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paymentId: payment.id }),
          });
          if (res.ok) {
            setPaymentStatus("تم شحن المحفظة بنجاح!");
          } else {
            setPaymentStatus("فشل التحقق من الدفع. الرجاء التواصل مع الدعم.");
          }
          setLoading(false);
        },
        on_failed: function () {
          setPaymentStatus("فشل الدفع. الرجاء المحاولة مرة أخرى.");
          setLoading(false);
        },
      });
    } else {
      setPaymentStatus("فشل تحميل بوابة الدفع. حاول تحديث الصفحة.");
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-lg">
      <Script src="https://cdn.moyasar.com/js/v1/moyasar.js" strategy="beforeInteractive" onLoad={() => { setMoyasarReady(true); console.log("Moyasar script loaded"); }} />
      <h1 className="text-2xl font-bold mb-6">شحن المحفظة</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <label className="block mb-2 font-medium">المبلغ (ريال سعودي)</label>
        <input
          type="number"
          min={1}
          value={amount}
          onChange={e => setAmount(Number(e.target.value))}
          className="w-full p-2 border rounded mb-4"
        />
        <button
          onClick={handlePayment}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mb-4"
          disabled={loading || !moyasarReady}
        >
          {loading ? "جاري معالجة الدفع..." : moyasarReady ? "ادفع الآن" : "جاري تحميل بوابة الدفع..."}
        </button>
        <div id="moyasar-payment" className="my-4"></div>
        {paymentStatus && <div className="mt-4 text-center font-bold">{paymentStatus}</div>}
      </div>
    </div>
  );
} 