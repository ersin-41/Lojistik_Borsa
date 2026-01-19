import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const SurucuIsArayanlar = () => {
  const [ilanlar, setIlanlar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hata, setHata] = useState(null);

  const tarihFormatla = (veri) => {
    try {
      if (!veri) return "Yeni İlan";
      if (veri.seconds) return new Date(veri.seconds * 1000).toLocaleDateString('tr-TR');
      if (veri instanceof Date) return veri.toLocaleDateString('tr-TR');
      return "Yeni İlan";
    } catch (e) { return "Yeni İlan"; }
  };

  useEffect(() => {
    const verileriGetir = async () => {
      try {
        const q = collection(db, "surucu_is_arama");
        const querySnapshot = await getDocs(q);
        const veriListesi = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        veriListesi.sort((a, b) => {
          const tA = a.tarih?.seconds || 0;
          const tB = b.tarih?.seconds || 0;
          return tB - tA;
        });
        setIlanlar(veriListesi);
      } catch (err) {
        setHata("İlanlar yüklenirken hata oluştu.");
      } finally {
        setLoading(false);
      }
    };
    verileriGetir();
  }, []);

  if (loading) return <div className="text-center mt-20 font-bold">Yükleniyor...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">İş Arayan Sürücüler</h1>
          <p className="text-gray-500 mt-2">Tır, Kamyon, Tanker ve Servis sürücüleri.</p>
        </div>
        <a href="/surucu-is-arama-ekle" className="mt-4 md:mt-0 bg-yellow-500 text-slate-900 px-6 py-3 rounded-lg font-bold hover:bg-yellow-400 transition shadow-lg flex items-center gap-2">
          ➕ İlan Ekle
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ilanlar.map((ilan) => {

          // --- ÖZEL ETİKET KONTROLÜ ---
          // Eğer ehliyet içinde "SRC 5" veya "Silobas" geçiyorsa rengi Kırmızı yap
          const ozelBelge = ilan.ehliyet && (ilan.ehliyet.includes('SRC 5') || ilan.ehliyet.includes('Silobas'));

          return (
            <div key={ilan.id} className="bg-white rounded-lg shadow-md hover:shadow-xl transition border border-gray-100 overflow-hidden">
              <div className="bg-slate-50 p-4 border-b border-gray-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-slate-900 font-bold">
                    {ilan.adSoyad ? ilan.adSoyad.charAt(0).toUpperCase() : "S"}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">{ilan.adSoyad}</h3>
                    <span className="text-xs text-gray-500">Sürücü</span>
                  </div>
                </div>
                <span className="text-xs bg-white border px-2 py-1 rounded text-gray-500">{tarihFormatla(ilan.tarih)}</span>
              </div>

              <div className="p-4 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Belge:</span>
                  {/* --- DİNAMİK RENKLENDİRME --- */}
                  <span className={`px-2 py-0.5 rounded font-bold text-xs ${ozelBelge ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-gray-100 text-slate-800'}`}>
                    {ilan.ehliyet || "-"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Tecrübe:</span>
                  <span className="font-bold text-slate-800">{ilan.tecrube} Yıl</span>
                </div>
                <p className="text-gray-600 text-sm line-clamp-3 italic bg-yellow-50 p-2 rounded border border-yellow-100">
                  "{ilan.aciklama}"
                </p>
              </div>

              <div className="p-4 pt-0">
                <a href={`tel:${ilan.telefon}`} className="block w-full bg-slate-800 text-white text-center py-2 rounded font-bold hover:bg-slate-700 transition">
                  📞 Hemen Ara
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SurucuIsArayanlar;