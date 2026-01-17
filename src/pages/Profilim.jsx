import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const Profilim = () => {
  const [user, setUser] = useState(null);
  const [ilanlar, setIlanlar] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // --- YENİ EKLENEN FİLTRE STATE'LERİ ---
  const [aramaMetni, setAramaMetni] = useState("");
  const [siralama, setSiralama] = useState("yeniden-eskiye");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        ilanlariGetir(currentUser.uid);
      } else {
        navigate('/giris');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const ilanlariGetir = async (uid) => {
    try {
      // İlanları tarihe göre sıralı çekiyoruz
      const q = query(
        collection(db, "ilanlar"), 
        where("ekleyen_id", "==", uid),
        orderBy("tarih", "desc") // Varsayılan: En yeni en üstte
      );
      
      const querySnapshot = await getDocs(q);
      const ilanVerileri = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setIlanlar(ilanVerileri);
    } catch (error) {
      console.error("İlanlar çekilirken hata:", error);
    } finally {
      setLoading(false);
    }
  };

  const ilanSil = async (id) => {
    if (window.confirm("Bu ilanı silmek istediğinize emin misiniz?")) {
      try {
        await deleteDoc(doc(db, "ilanlar", id));
        // Listeden de silip ekranı güncelleyelim
        setIlanlar(ilanlar.filter(ilan => ilan.id !== id));
      } catch (error) {
        console.error("Silme hatası:", error);
        alert("Silinirken bir hata oluştu.");
      }
    }
  };

  // --- FİLTRELEME MANTIĞI ---
  const filtrelenmisIlanlar = ilanlar
    .filter((ilan) => {
      // Arama metni boşsa hepsini göster, doluysa şehirlerde ara
      if (aramaMetni === "") return true;
      const metin = aramaMetni.toLowerCase();
      return (
        ilan.nereden.toLowerCase().includes(metin) ||
        ilan.nereye.toLowerCase().includes(metin) ||
        ilan.yukTipi.toLowerCase().includes(metin)
      );
    })
    .sort((a, b) => {
      // Tarihe göre sıralama (Firebase Timestamp kontrolü)
      if (!a.tarih || !b.tarih) return 0;
      
      const tarihA = a.tarih.seconds; // Firebase tarih formatı
      const tarihB = b.tarih.seconds;

      if (siralama === "yeniden-eskiye") {
        return tarihB - tarihA;
      } else {
        return tarihA - tarihB;
      }
    });

  if (loading) return <div className="text-center mt-20">Yükleniyor...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Üst Bilgi Kartı */}
      <div className="bg-slate-900 text-white rounded-lg p-6 mb-8 shadow-xl flex flex-col md:flex-row items-center gap-6">
        <div className="w-24 h-24 bg-yellow-500 rounded-full flex items-center justify-center text-4xl text-slate-900 font-bold border-4 border-white shadow-lg">
          {user?.displayName ? user.displayName.charAt(0).toUpperCase() : "U"}
        </div>
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-bold">{user?.displayName}</h1>
          <p className="text-gray-400">{user?.email}</p>
          <div className="mt-2 inline-block bg-yellow-500 text-slate-900 px-3 py-1 rounded text-sm font-bold">
            Toplam İlan: {ilanlar.length}
          </div>
        </div>
      </div>

      {/* İLAN YÖNETİM PANELİ (Filtreler) */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-slate-800 border-l-4 border-yellow-500 pl-3">
          İlan Yönetimi
        </h2>

        <div className="flex gap-2 w-full md:w-auto">
            {/* Arama Kutusu */}
            <input 
              type="text" 
              placeholder="Şehir veya yük tipi ara..." 
              value={aramaMetni}
              onChange={(e) => setAramaMetni(e.target.value)}
              className="border p-2 rounded outline-none focus:border-yellow-500 w-full md:w-64 shadow-sm"
            />

            {/* Sıralama Seçimi */}
            <select 
              value={siralama}
              onChange={(e) => setSiralama(e.target.value)}
              className="border p-2 rounded outline-none focus:border-yellow-500 shadow-sm bg-white"
            >
              <option value="yeniden-eskiye">📅 En Yeni</option>
              <option value="eskiden-yeniye">📅 En Eski</option>
            </select>
        </div>
      </div>

      {/* İlan Listesi Tablosu */}
      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 uppercase text-sm font-bold">
                <th className="p-4 border-b">Tarih</th>
                <th className="p-4 border-b">Nereden</th>
                <th className="p-4 border-b">Nereye</th>
                <th className="p-4 border-b">Yük Tipi</th>
                <th className="p-4 border-b">Fiyat</th>
                <th className="p-4 border-b text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtrelenmisIlanlar.length > 0 ? (
                filtrelenmisIlanlar.map((ilan) => (
                  <tr key={ilan.id} className="hover:bg-yellow-50 transition duration-150">
                    <td className="p-4 text-sm text-gray-500">
                      {ilan.tarih ? new Date(ilan.tarih.seconds * 1000).toLocaleDateString('tr-TR') : '-'}
                    </td>
                    <td className="p-4 font-medium text-slate-800">{ilan.nereden}</td>
                    <td className="p-4 font-medium text-slate-800">{ilan.nereye}</td>
                    <td className="p-4 text-gray-600">{ilan.yukTipi}</td>
                    <td className="p-4 font-bold text-green-600">{ilan.fiyat} ₺</td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => ilanSil(ilan.id)}
                        className="text-red-500 hover:text-red-700 font-medium text-sm border border-red-200 hover:bg-red-50 px-3 py-1 rounded transition"
                      >
                        Sil 🗑️
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-400">
                    {aramaMetni ? `"${aramaMetni}" ile eşleşen ilan bulunamadı.` : "Henüz hiç ilan vermediniz."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Profilim;