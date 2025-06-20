'use client';
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

const farms = [
  {
    name: "مزرعة النخيل الذهبية",
    images: [
      "/public/uploads/1750197734805-579105309-dallil_use_case_diagram.png",
      "/public/uploads/1750198329873-834873536-dallil_sequence_register.png",
      "/public/uploads/1750199530103-91918943-Screenshot_20250616_231437.png"
    ],
    description: "مزرعة متخصصة في إنتاج أجود أنواع التمور العضوية في بيئة مثالية."
  },
  {
    name: "مزرعة الواحة الخضراء",
    images: [
      "/public/uploads/1750197248851-45220848-deepseek_mermaid_20250510_6d24fc.png",
      "/public/uploads/1750197165517-451372618-dallil_sequence_register.png"
    ],
    description: "واحة خضراء تضم نخيل متنوعة وتنتج تموراً عالية الجودة."
  }
];

export default function FarmsPage() {
  const router = useRouter();
  return (
    <main className="min-h-screen bg-gradient-to-b from-green-100 to-white py-10 px-4">
      <h1 className="text-4xl font-extrabold text-green-900 mb-10 text-center drop-shadow">مزارع التمور</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {farms.map((farm, idx) => (
          <div key={idx} className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center">
            <div className="flex gap-2 mb-4 overflow-x-auto w-full">
              {farm.images.map((img, i) => (
                <img key={i} src={img} alt={farm.name + ' صورة ' + (i+1)} className="w-32 h-24 object-cover rounded-lg border" />
              ))}
            </div>
            <h2 className="text-2xl font-bold text-green-800 mb-2">{farm.name}</h2>
            <p className="text-gray-700 text-center">{farm.description}</p>
          </div>
        ))}
      </div>
    </main>
  );
} 