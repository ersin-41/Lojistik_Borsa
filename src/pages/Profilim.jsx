import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';

const Profilim = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Aktif Sekme (Varsayılan: Yükler)
  const [aktifSekme, setAktifSekme] = useState('yukler'); 

  // Veri State'leri
  const [yukIlanlarim, setYukIlanlarim] = useState([]);
  const [aracIlanlarim, setAracIlanlarim] = useState([]);
  const [soforIlanlarim, setSoforIlanlarim] = useState([]);
  const [isAramaKaydim, setIsAramaKaydim] = useState([]);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        navigate('/giris');
      } else {
        setUser(currentUser);
        verileriGetir(currentUser.uid);
      }
    });
    return () => unsubscribeAuth();
  }, [navigate]);

  const verileriGetir = (uid) => {
    sorguCalistir("ilanlar", uid, setYukIlanlarim);
    sorguCalistir("araclar", uid, setAracIlanlarim);
    sorguCalistir("sofor_ilanlari", uid, setSoforIlanlarim);
    sorguCalistir("surucu_is_arama", uid, setIsAramaKaydim);
  };

  const sorguCalistir = (koleksiyonAdi, uid, setFonksiyonu) => {
    const q = query(collection(db, koleksiyonAdi), where("ekleyen_id", "==", uid));
    onSnapshot(q, (snapshot) => {
      const veriler = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      veriler.sort((a, b) => b.tarih_eklenme - a.tarih_eklenme);
      setFonksiyonu(veriler);
    });
  };

  const durumGuncelle = async (koleksiyon, ilanId, yeniDurum) => {
    try {
      const ilanRef = doc(db, koleksiyon, ilanId);
      await updateDoc(ilanRef, { durum: yeniDurum });
    } catch (error) {
      console.error("Hata:", error);
      alert("Durum güncellenemedi.");
    }
  };

  // --- RAPOR HESAPLAMA MANTIĞI ---
  const raporHesapla = () => {
    const toplamYuk = yukIlanlarim.length;
    const tamamlananYuk = yukIlanlarim.filter(i => i.durum === 2).length;
    const aktifYuk = yukIlanlarim.filter(i => i.durum === 1 || i.durum === undefined).length;
    
    const basariOrani = toplamYuk > 0 ? Math.round((tamamlananYuk / toplamYuk) * 100) : 0;

    const toplamHacim = yukIlanlarim
        .filter(i => i.durum === 2)
        .reduce((toplam, ilan) => {
            const fiyatSayi = parseFloat(ilan.fiyat) || 0; 
            return toplam + fiyatSayi;
        }, 0);

    return { toplamYuk, tamamlananYuk, aktifYuk, basariOrani, toplamHacim };
  };

  const rapor = raporHesapla();

  // --- EXCEL İNDİRME FONKSİYONU ---
  const excelIndir = () => {
    const excelVerisi = yukIlanlarim.map(ilan => ({
      "İlan Tarihi": ilan.tarih || '-',
      "Durum": ilan.durum === 2 ? "Tamamlandı (İş Verildi)" : "Yayında",
      "Yük Tipi": ilan.yukTipi,
      "Nereden": ilan.nereden,
      "Nereye": ilan.nereye,
      "Fiyat (TL)": parseFloat(ilan.fiyat) || 0,
      "Tonaj / Araç": ilan.tonaj || ilan.aracIstegi || '-'
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelVerisi);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Rapor");
    XLSX.writeFile(workbook, "LojistikBorsa_Faaliyet_Raporu.xlsx");
  };

  // Sekme Butonu Bileşeni
  const SekmeButonu = ({ id, baslik, sayi, icon }) => (
    <button 
      onClick={() => setAktifSekme(id)}
      className={`pb-2 px-4 font-bold text-sm transition border-b-4 flex items-center gap-2 whitespace-nowrap
      ${aktifSekme === id ? 'border-yellow-500 text-slate-800' : 'border-transparent text-gray-400 hover:text-slate-600'}`}
    >
      <span>{icon}</span> {baslik} {sayi !== undefined && <span className="bg-gray-200 px-2 rounded-full text-xs ml-1">{sayi}</span>}
    </button>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Profil Header */}
      <div className="bg-slate-900 text-white p-6 rounded-lg shadow-lg mb-8 flex flex-col md:flex-row items-center gap-6 no-print">
        {user?.photoURL ? (
            <img src={user.photoURL} alt="Profil" className="w-16 h-16 rounded-full border-2 border-yellow-500" />
        ) : (
            <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center text-xl font-bold text-slate-900">{user?.displayName?.charAt(0)}</div>
        )}
        <div className="text-center md:text-left">
          <h1 className="text-2xl font-bold">{user?.displayName}</h1>
          <p className="text-gray-400 text-sm">{user?.email}</p>
          {/* Üye ID Kısmı Kaldırıldı */}
        </div>
      </div>

      {/* SEKMELER */}
      <div className="flex gap-2 overflow-x-auto border-b border-gray-200 mb-6 no-print scrollbar-hide">
        <SekmeButonu id="raporlar" baslik="Performans Raporu" icon="📊" />
        <SekmeButonu id="yukler" baslik="Yük İlanlarım" sayi={yukIlanlarim.length} icon="📦" />
        <SekmeButonu id="araclar" baslik="Araçlarım" sayi={aracIlanlarim.length} icon="🚛" />
        <SekmeButonu id="isveren" baslik="İş İlanlarım" sayi={soforIlanlarim.length} icon="📢" />
        <SekmeButonu id="isarayan" baslik="İş Başvurum" sayi={isAramaKaydim.length} icon="📄" />
      </div>

      {/* --- RAPORLAR SEKMESİ --- */}
      {aktifSekme === 'raporlar' && (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800">Şirket Faaliyet Özeti</h2>
                <div className="flex gap-2">
                    <button 
                    onClick={excelIndir} 
                    className="bg-green-700 text-white px-4 py-2 rounded text-sm hover:bg-green-800 transition flex items-center gap-2 shadow-sm">
                    <span>📥</span> Excel İndir
                    </button>
                    <button onClick={() => window.print()} className="bg-slate-800 text-white px-4 py-2 rounded text-sm hover:bg-slate-700 transition no-print flex items-center gap-2">
                        <span>🖨️</span> Yazdır
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
                    <p className="text-gray-500 text-sm font-bold uppercase">Toplam Yük İlanı</p>
                    <p className="text-3xl font-bold text-slate-800 mt-2">{rapor.toplamYuk}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
                    <p className="text-gray-500 text-sm font-bold uppercase">Başarıyla Taşınan</p>
                    <p className="text-3xl font-bold text-green-600 mt-2">{rapor.tamamlananYuk}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-500">
                    <p className="text-gray-500 text-sm font-bold uppercase">İşlem Hacmi</p>
                    <p className="text-3xl font-bold text-slate-800 mt-2">{rapor.toplamHacim.toLocaleString('tr-TR')} ₺</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
                    <p className="text-gray-500 text-sm font-bold uppercase">Doluluk Oranı</p>
                    <div className="flex items-end gap-2">
                        <p className="text-3xl font-bold text-slate-800 mt-2">%{rapor.basariOrani}</p>
                    </div>
                    <div className="w-full bg-gray-200 h-2 rounded-full mt-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{width: `${rapor.basariOrani}%`}}></div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
                <div className="bg-gray-50 p-4 border-b">
                    <h3 className="font-bold text-gray-700">Son Hareketler</h3>
                </div>
                <table className="w-full text-sm text-left">
                    <thead className="text-gray-500 bg-gray-50 border-b">
                        <tr>
                            <th className="p-3">Tarih</th>
                            <th className="p-3">İşlem / İlan</th>
                            <th className="p-3">Durum</th>
                            <th className="p-3 text-right">Tutar</th>
                        </tr>
                    </thead>
                    <tbody>
                        {yukIlanlarim.slice(0, 5).map(ilan => (
                            <tr key={ilan.id} className="border-b hover:bg-gray-50">
                                <td className="p-3 text-gray-600">{ilan.tarih}</td>
                                <td className="p-3 font-medium text-slate-800">{ilan.nereden} ➝ {ilan.nereye} <span className="text-gray-400 text-xs">({ilan.yukTipi})</span></td>
                                <td className="p-3">
                                    {ilan.durum === 2 ? 
                                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">Tamamlandı</span> : 
                                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-bold">Yayında</span>
                                    }
                                </td>
                                <td className="p-3 text-right font-bold text-slate-700">{ilan.fiyat} ₺</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      )}

      {/* --- DİĞER LİSTELER --- */}
      <div className="space-y-4">
        {aktifSekme === 'yukler' && yukIlanlarim.map(ilan => (
           <Kart 
             key={ilan.id} 
             baslik={`${ilan.nereden} ➝ ${ilan.nereye}`} 
             detay={`${ilan.yukTipi} - ${ilan.fiyat} TL`}
             tarih={ilan.tarih}
             durum={ilan.durum}
             onDurumDegis={() => durumGuncelle("ilanlar", ilan.id, ilan.durum === 1 ? 2 : 1)}
             link={`/ilan/${ilan.id}`}
           />
        ))}

        {aktifSekme === 'araclar' && aracIlanlarim.map(ilan => (
           <Kart 
             key={ilan.id} 
             baslik={`🚛 ${ilan.nereden} (Müsait)`} 
             detay={`${ilan.aracTipi} - ${ilan.kasaTipi} ${ilan.nereye ? '-> '+ilan.nereye : ''}`}
             tarih={ilan.tarih}
             durum={ilan.durum}
             onDurumDegis={() => durumGuncelle("araclar", ilan.id, ilan.durum === 1 ? 2 : 1)}
             link="/araclar" 
           />
        ))}

        {aktifSekme === 'isveren' && soforIlanlarim.map(ilan => (
           <Kart 
             key={ilan.id} 
             baslik={`📢 ${ilan.baslik}`} 
             detay={`${ilan.sehir} - ${ilan.ehliyet}`}
             tarih="Süresiz"
             durum={ilan.durum}
             onDurumDegis={() => durumGuncelle("sofor_ilanlari", ilan.id, ilan.durum === 1 ? 2 : 1)}
             link="/surucu-ilanlari"
           />
        ))}

        {aktifSekme === 'isarayan' && isAramaKaydim.map(ilan => (
           <Kart 
             key={ilan.id} 
             baslik={`📄 ${ilan.arananIs} İş Arıyorum`} 
             detay={`${ilan.sehir} - ${ilan.ehliyet} (${ilan.tecrubeYili} Yıl)`}
             tarih="Aktif"
             durum={ilan.durum}
             aktifMetin="İş Arıyorum"
             pasifMetin="Pasif (İş Buldum)"
             onDurumDegis={() => durumGuncelle("surucu_is_arama", ilan.id, ilan.durum === 1 ? 2 : 1)}
             link="/surucu-is-arayanlar"
           />
        ))}

         {((aktifSekme === 'yukler' && yukIlanlarim.length === 0) ||
          (aktifSekme === 'araclar' && aracIlanlarim.length === 0) ||
          (aktifSekme === 'isveren' && soforIlanlarim.length === 0) ||
          (aktifSekme === 'isarayan' && isAramaKaydim.length === 0)) && aktifSekme !== 'raporlar' && (
            <div className="text-center py-10 text-gray-400 bg-gray-50 rounded border border-dashed">
                Kayıt bulunamadı.
            </div>
        )}
      </div>
    </div>
  );
};

const Kart = ({ baslik, detay, tarih, durum, onDurumDegis, link, aktifMetin = "Yayında", pasifMetin = "Pasif / Tamamlandı" }) => {
  const aktifMi = durum === 1 || durum === undefined;
  return (
    <div className={`bg-white p-4 rounded-lg shadow border flex flex-col md:flex-row justify-between items-center gap-4 transition no-print-break ${!aktifMi ? 'opacity-60 bg-gray-100' : ''}`}>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-xs font-bold px-2 py-1 rounded text-white ${aktifMi ? 'bg-green-500' : 'bg-gray-500'}`}>
            {aktifMi ? aktifMetin : pasifMetin}
          </span>
          <span className="text-gray-400 text-xs">{tarih}</span>
        </div>
        <h3 className="font-bold text-lg text-slate-800">{baslik}</h3>
        <p className="text-sm text-gray-600">{detay}</p>
      </div>
      <div className="flex gap-2 w-full md:w-auto">
        <button onClick={onDurumDegis} className={`flex-1 md:flex-none px-4 py-2 rounded font-bold transition text-sm flex items-center justify-center gap-2 ${aktifMi ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}>
          {aktifMi ? '⛔ Pasife Al' : '🔄 Aktifleştir'}
        </button>
        {link && <a href={link} className="bg-gray-100 text-gray-600 px-3 py-2 rounded hover:bg-gray-200 text-sm flex items-center">👁️</a>}
      </div>
    </div>
  );
};

export default Profilim;