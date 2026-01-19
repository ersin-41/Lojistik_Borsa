import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom'; // Navigasyon eklendi
import TeklifModal from '../components/TeklifModal';

const YukIlanlari = () => {
  const [ilanlar, setIlanlar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [secilenIlan, setSecilenIlan] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate(); // Yönlendirme kancası

  // Filtreleme State'leri
  const [filtreNereden, setFiltreNereden] = useState("");
  const [filtreNereye, setFiltreNereye] = useState("");
  const [filtreTip, setFiltreTip] = useState("Tümü");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    const verileriGetir = async () => {
      try {
        // Sadece 'aktif' olan yükleri getir
        const q = query(
          collection(db, "ilanlar"),
          where("durum", "==", "aktif"),
          orderBy("tarih", "desc")
        );
        const querySnapshot = await getDocs(q);
        const veriListesi = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
        setIlanlar(veriListesi);
      } catch (err) {
        console.error("Veri hatası:", err);
      } finally {
        setLoading(false);
      }
    };
    verileriGetir();
    return () => unsubscribe();
  }, []);

  const filtrelenmisIlanlar = ilanlar.filter((ilan) => {
    const neredenUygun = ilan.nereden.toLowerCase().includes(filtreNereden.toLowerCase());
    const nereyeUygun = ilan.nereye.toLowerCase().includes(filtreNereye.toLowerCase());
    const tipUygun = filtreTip === "Tümü" || ilan.yukTipi === filtreTip;
    return neredenUygun && nereyeUygun && tipUygun;
  });

  const teklifVerTikla = (ilan) => {
    if (!user) return alert("Teklif vermek için giriş yapmalısınız.");
    if (user.uid === ilan.ekleyen_id) return alert("Kendi ilanınıza teklif veremezsiniz.");
    setSecilenIlan(ilan); // Modalı açar
  };

  const tarihFormatla = (tarihString) => {
    if (!tarihString) return "Hemen";
    return new Date(tarihString).toLocaleDateString('tr-TR');
  };

  if (loading) return <div className="text-center mt-20 font-bold text-gray-500">Yükleniyor...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 relative"> {/* relative eklendi */}

      {/* BAŞLIK VE FİLTRELER (Önceki kodun aynısı - Yer kaplamasın diye kısalttım) */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 border-l-8 border-yellow-500 pl-4">Güncel Yük İlanları</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="bg-slate-100 font-bold px-3 py-1 rounded">{filtrelenmisIlanlar.length} İlan</span>
          <a href="/ilan-ekle" className="bg-yellow-500 text-slate-900 px-5 py-2 rounded-lg font-bold hover:bg-yellow-400 transition shadow-md flex items-center gap-2">
            ➕ Yük İlanı Ver
          </a>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm mb-8 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input type="text" placeholder="Nereden..." value={filtreNereden} onChange={(e) => setFiltreNereden(e.target.value)} className="p-3 border rounded w-full" />
          <input type="text" placeholder="Nereye..." value={filtreNereye} onChange={(e) => setFiltreNereye(e.target.value)} className="p-3 border rounded w-full" />
          <select value={filtreTip} onChange={(e) => setFiltreTip(e.target.value)} className="p-3 border rounded w-full bg-white">
            <option value="Tümü">Tüm Yük Tipleri</option>
            <option value="Paletli">Paletli</option>
            <option value="Dökme">Dökme</option>
            {/* Diğer seçenekler */}
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {filtrelenmisIlanlar.map((ilan) => (
          <div key={ilan.id} className="bg-white p-6 rounded-lg shadow-md border-l-4 border-slate-900 hover:shadow-xl transition group">
            <div className="flex flex-col lg:flex-row justify-between items-start gap-6">

              {/* SOL: DETAYLAR */}
              <div className="flex-1 w-full cursor-pointer" onClick={() => navigate(`/ilan/${ilan.id}`)}>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded">{ilan.yukTipi}</span>
                  <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-1 rounded">📅 {tarihFormatla(ilan.yuklemeTarihi)}</span>
                  {ilan.odemeSekli && <span className="bg-green-50 text-green-700 text-xs font-bold px-2 py-1 rounded">💰 {ilan.odemeSekli}</span>}
                  <span className="bg-gray-100 text-gray-700 text-xs font-bold px-2 py-1 rounded flex items-center gap-1">👤 {ilan.ekleyen_ad || "Kullanıcı"}</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2 mb-2">
                  {ilan.nereden} <span className="text-yellow-500">➜</span> {ilan.nereye}
                </h2>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">"{ilan.aciklama}"</p>
                <div className="flex gap-4 text-sm font-medium text-slate-600">
                  <span>⚖️ {ilan.tonaj} Ton</span>
                  <span>🚛 {ilan.aracTipi}</span>
                </div>
              </div>

              {/* SAĞ: BUTONLAR */}
              <div className="flex flex-col items-end gap-2 min-w-[200px] w-full lg:w-auto mt-4 lg:mt-0">
                <div className="text-right mb-2">
                  <span className="text-lg font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded">Teklif Usulü 🔨</span>
                </div>

                <button
                  onClick={() => teklifVerTikla(ilan)}
                  className="bg-yellow-500 text-slate-900 px-4 py-2 rounded font-bold hover:bg-yellow-400 w-full transition"
                >
                  💬 Teklif Ver
                </button>

                {/* --- İNCELE BUTONU GERİ GELDİ --- */}
                <button
                  onClick={() => navigate(`/ilan/${ilan.id}`)}
                  className="bg-slate-800 text-white px-4 py-2 rounded font-bold hover:bg-slate-700 w-full transition flex items-center justify-center gap-2"
                >
                  📄 İncele & İletişim
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL - Z-INDEX DÜZELTİLDİ */}
      {secilenIlan && (
        <div className="relative z-[9999]">
          <TeklifModal ilan={secilenIlan} kapat={() => setSecilenIlan(null)} user={user} />
        </div>
      )}
    </div>
  );
};

export default YukIlanlari;