import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';

const Profilim = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // --- 4 FARKLI VERİ LİSTESİ ---
  const [yukIlanlari, setYukIlanlari] = useState([]);
  const [aracIlanlari, setAracIlanlari] = useState([]);
  const [soforIlanlari, setSoforIlanlari] = useState([]);
  const [isIlanlari, setIsIlanlari] = useState([]);

  // --- UI STATE'LERİ ---
  const [aktifTab, setAktifTab] = useState('yuk'); 
  const [aramaMetni, setAramaMetni] = useState("");
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        tumVerileriGetir(currentUser.uid);
      } else {
        navigate('/giris');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const tumVerileriGetir = async (uid) => {
    setLoading(true);
    try {
      // 1. Yük İlanları
      const q1 = query(collection(db, "ilanlar"), where("ekleyen_id", "==", uid));
      const s1 = await getDocs(q1);
      setYukIlanlari(s1.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      // 2. Araç İlanları
      const q2 = query(collection(db, "araclar"), where("ekleyen_id", "==", uid));
      const s2 = await getDocs(q2);
      setAracIlanlari(s2.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      // 3. Şoför Arayanlar
      const q3 = query(collection(db, "sofor_ilanlari"), where("ekleyen_id", "==", uid));
      const s3 = await getDocs(q3);
      setSoforIlanlari(s3.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      // 4. İş Arayanlar
      const q4 = query(collection(db, "surucu_is_arama"), where("ekleyen_id", "==", uid));
      const s4 = await getDocs(q4);
      setIsIlanlari(s4.docs.map(doc => ({ id: doc.id, ...doc.data() })));

    } catch (error) {
      console.error("Veri çekme hatası:", error);
    } finally {
      setLoading(false);
    }
  };

  const veriSil = async (id, koleksiyonAdi) => {
    if (window.confirm("Bu ilanı kalıcı olarak silmek istiyor musunuz?")) {
      try {
        await deleteDoc(doc(db, koleksiyonAdi, id));
        if (koleksiyonAdi === 'ilanlar') setYukIlanlari(prev => prev.filter(x => x.id !== id));
        if (koleksiyonAdi === 'araclar') setAracIlanlari(prev => prev.filter(x => x.id !== id));
        if (koleksiyonAdi === 'sofor_ilanlari') setSoforIlanlari(prev => prev.filter(x => x.id !== id));
        if (koleksiyonAdi === 'surucu_is_arama') setIsIlanlari(prev => prev.filter(x => x.id !== id));
      } catch (error) {
        alert("Silinirken hata oluştu.");
      }
    }
  };

  // --- 🛠️ GELİŞTİRİLMİŞ TARİH FORMATLAYICI ---
  const tarihFormatla = (veri) => {
    try {
      // 1. Veri hiç yoksa
      if (!veri) return "-";
      
      // 2. Firebase Timestamp formatı (seconds)
      if (veri?.seconds) {
        return new Date(veri.seconds * 1000).toLocaleDateString('tr-TR');
      }
      
      // 3. JavaScript Date objesi
      if (veri instanceof Date) {
        return veri.toLocaleDateString('tr-TR');
      }

      // 4. String (Yazı) ise
      if (typeof veri === 'string') {
        // Eğer "2026-01-17" gibiyse düzeltmeye çalış
        const denemeTarih = new Date(veri);
        if(!isNaN(denemeTarih.getTime())){
             return denemeTarih.toLocaleDateString('tr-TR');
        }
        return veri; // Düzeltemezse yazıyı olduğu gibi bas
      }

      return "-"; // Tanımsız format
    } catch (error) {
      return "-"; // Hata durumunda boş dön
    }
  };

  const aktifVeriler = () => {
    let hamVeri = [];
    if (aktifTab === 'yuk') hamVeri = yukIlanlari;
    if (aktifTab === 'arac') hamVeri = aracIlanlari;
    if (aktifTab === 'sofor') hamVeri = soforIlanlari;
    if (aktifTab === 'is') hamVeri = isIlanlari;

    if (!aramaMetni) return hamVeri;

    const metin = aramaMetni.toLowerCase();
    return hamVeri.filter(item => {
      // Her tablo için "Tarih Hatası" vermemesi için güvenli arama (opsiyonel chaining)
      if (aktifTab === 'yuk' || aktifTab === 'arac') {
        return (item.nereden?.toLowerCase().includes(metin) || item.nereye?.toLowerCase().includes(metin));
      }
      if (aktifTab === 'sofor') return item.baslik?.toLowerCase().includes(metin);
      if (aktifTab === 'is') return item.adSoyad?.toLowerCase().includes(metin);
      return false;
    });
  };

  const excelIndir = () => {
    const veriler = aktifVeriler().map(item => {
        // Excel için veriyi temizle
        return {
            ...item,
            tarih: tarihFormatla(item.tarih) // Tarihi düzeltip Excel'e koy
        }
    });
    const worksheet = XLSX.utils.json_to_sheet(veriler);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Rapor");
    XLSX.writeFile(workbook, `LojistikBorsa_${aktifTab}_Rapor.xlsx`);
  };

  if (loading) return <div className="text-center mt-20">Veriler Yükleniyor...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      
      {/* ÜST BİLGİ KARTI */}
      <div className="bg-slate-900 text-white rounded-lg p-6 mb-6 flex flex-col md:flex-row items-center gap-6 print:hidden shadow-lg">
        <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center text-2xl text-slate-900 font-bold border-2 border-white">
          {user?.displayName?.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-2xl font-bold">{user?.displayName}</h1>
          <p className="text-gray-400 text-sm">{user?.email}</p>
        </div>
        <div className="flex gap-4 text-center">
             <div><span className="block font-bold text-yellow-500 text-xl">{yukIlanlari.length}</span><span className="text-xs text-gray-400">Yük</span></div>
             <div><span className="block font-bold text-yellow-500 text-xl">{aracIlanlari.length}</span><span className="text-xs text-gray-400">Araç</span></div>
             <div><span className="block font-bold text-yellow-500 text-xl">{soforIlanlari.length + isIlanlari.length}</span><span className="text-xs text-gray-400">Diğer</span></div>
        </div>
      </div>

      {/* SEKMELER */}
      <div className="flex flex-wrap gap-2 mb-4 print:hidden border-b border-gray-200 pb-2">
        <button onClick={() => setAktifTab('yuk')} className={`px-4 py-2 rounded-t font-bold transition ${aktifTab === 'yuk' ? 'bg-yellow-500 text-slate-900' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>📦 Yük İlanları</button>
        <button onClick={() => setAktifTab('arac')} className={`px-4 py-2 rounded-t font-bold transition ${aktifTab === 'arac' ? 'bg-yellow-500 text-slate-900' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>🚛 Araç İlanları</button>
        <button onClick={() => setAktifTab('sofor')} className={`px-4 py-2 rounded-t font-bold transition ${aktifTab === 'sofor' ? 'bg-yellow-500 text-slate-900' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>📢 Şoför Arıyorum</button>
        <button onClick={() => setAktifTab('is')} className={`px-4 py-2 rounded-t font-bold transition ${aktifTab === 'is' ? 'bg-yellow-500 text-slate-900' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>📄 İş Arıyorum</button>
      </div>

      {/* ARAÇ ÇUBUĞU */}
      <div className="bg-white p-4 rounded shadow mb-4 border flex flex-col md:flex-row justify-between items-center gap-4 print:hidden">
        <input 
          type="text" 
          placeholder="🔍 Listede ara..." 
          value={aramaMetni}
          onChange={(e) => setAramaMetni(e.target.value)}
          className="border p-2 rounded w-full md:w-64 outline-none focus:border-yellow-500"
        />
        <div className="flex gap-2">
            <button onClick={excelIndir} className="bg-green-600 text-white px-3 py-2 rounded text-sm font-bold hover:bg-green-700">📊 Excel</button>
            <button onClick={() => window.print()} className="bg-slate-700 text-white px-3 py-2 rounded text-sm font-bold hover:bg-slate-800">🖨️ Yazdır</button>
        </div>
      </div>

      {/* TABLOLAR */}
      <div className="bg-white rounded shadow overflow-hidden border print:border-none print:shadow-none min-h-[300px]">
        <div className="overflow-x-auto">
          
          {/* YÜK İLANLARI */}
          {aktifTab === 'yuk' && (
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100 text-gray-700 uppercase font-bold text-xs">
                <tr><th className="p-3">Tarih</th><th className="p-3">Nereden</th><th className="p-3">Nereye</th><th className="p-3">Yük</th><th className="p-3 text-right">Fiyat</th><th className="p-3 text-center print:hidden">İşlem</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {aktifVeriler().map(ilan => (
                  <tr key={ilan.id} className="hover:bg-yellow-50">
                    <td className="p-3 whitespace-nowrap text-gray-500">{tarihFormatla(ilan.tarih)}</td>
                    <td className="p-3 font-medium">{ilan.nereden}</td>
                    <td className="p-3 font-medium">{ilan.nereye}</td>
                    <td className="p-3">{ilan.yukTipi}</td>
                    <td className="p-3 text-right font-bold text-green-600">{ilan.fiyat} ₺</td>
                    <td className="p-3 text-center print:hidden"><button onClick={() => veriSil(ilan.id, 'ilanlar')} className="text-red-500 border border-red-200 px-2 py-1 rounded text-xs font-bold hover:bg-red-50">Sil</button></td>
                  </tr>
                ))}
                {aktifVeriler().length === 0 && <tr><td colSpan="6" className="p-6 text-center text-gray-400">Kayıt yok.</td></tr>}
              </tbody>
            </table>
          )}

          {/* ARAÇ İLANLARI */}
          {aktifTab === 'arac' && (
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100 text-gray-700 uppercase font-bold text-xs">
                <tr><th className="p-3">Tarih</th><th className="p-3">Konum</th><th className="p-3">İstikamet</th><th className="p-3">Araç</th><th className="p-3">Kasa</th><th className="p-3 text-center print:hidden">İşlem</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {aktifVeriler().map(ilan => (
                  <tr key={ilan.id} className="hover:bg-yellow-50">
                    <td className="p-3 whitespace-nowrap text-gray-500">{tarihFormatla(ilan.tarih)}</td>
                    <td className="p-3 font-medium">{ilan.nereden}</td>
                    <td className="p-3 font-medium">{ilan.nereye}</td>
                    <td className="p-3">{ilan.aracTipi}</td>
                    <td className="p-3">{ilan.kasaTipi}</td>
                    <td className="p-3 text-center print:hidden"><button onClick={() => veriSil(ilan.id, 'araclar')} className="text-red-500 border border-red-200 px-2 py-1 rounded text-xs font-bold hover:bg-red-50">Sil</button></td>
                  </tr>
                ))}
                {aktifVeriler().length === 0 && <tr><td colSpan="6" className="p-6 text-center text-gray-400">Kayıt yok.</td></tr>}
              </tbody>
            </table>
          )}

          {/* ŞOFÖR İLANLARI */}
          {aktifTab === 'sofor' && (
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100 text-gray-700 uppercase font-bold text-xs">
                <tr><th className="p-3">Tarih</th><th className="p-3">Başlık</th><th className="p-3">Şehir</th><th className="p-3">Maaş/Şartlar</th><th className="p-3 text-center print:hidden">İşlem</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {aktifVeriler().map(ilan => (
                  <tr key={ilan.id} className="hover:bg-yellow-50">
                    <td className="p-3 whitespace-nowrap text-gray-500">{tarihFormatla(ilan.tarih)}</td>
                    <td className="p-3 font-medium">{ilan.baslik}</td>
                    <td className="p-3">{ilan.sehir}</td>
                    <td className="p-3">{ilan.maas}</td>
                    <td className="p-3 text-center print:hidden"><button onClick={() => veriSil(ilan.id, 'sofor_ilanlari')} className="text-red-500 border border-red-200 px-2 py-1 rounded text-xs font-bold hover:bg-red-50">Sil</button></td>
                  </tr>
                ))}
                {aktifVeriler().length === 0 && <tr><td colSpan="5" className="p-6 text-center text-gray-400">Kayıt yok.</td></tr>}
              </tbody>
            </table>
          )}

          {/* İŞ ARAYAN */}
          {aktifTab === 'is' && (
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100 text-gray-700 uppercase font-bold text-xs">
                <tr><th className="p-3">Tarih</th><th className="p-3">Ad Soyad</th><th className="p-3">Ehliyet</th><th className="p-3">Tecrübe</th><th className="p-3 text-center print:hidden">İşlem</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {aktifVeriler().map(ilan => (
                  <tr key={ilan.id} className="hover:bg-yellow-50">
                    <td className="p-3 whitespace-nowrap text-gray-500">{tarihFormatla(ilan.tarih)}</td>
                    <td className="p-3 font-medium">{ilan.adSoyad}</td>
                    <td className="p-3">{ilan.ehliyet}</td>
                    <td className="p-3">{ilan.tecrube}</td>
                    <td className="p-3 text-center print:hidden"><button onClick={() => veriSil(ilan.id, 'surucu_is_arama')} className="text-red-500 border border-red-200 px-2 py-1 rounded text-xs font-bold hover:bg-red-50">Sil</button></td>
                  </tr>
                ))}
                {aktifVeriler().length === 0 && <tr><td colSpan="5" className="p-6 text-center text-gray-400">Kayıt yok.</td></tr>}
              </tbody>
            </table>
          )}

        </div>
      </div>
    </div>
  );
};

export default Profilim;