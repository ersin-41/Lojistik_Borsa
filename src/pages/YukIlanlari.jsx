import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import YukKarti from '../components/YukKarti';
import { useLocation } from 'react-router-dom';

const YukIlanlari = () => {
  const location = useLocation();
  
  // Veritabanından gelen ham veriler
  const [ilanlar, setIlanlar] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  // Filtreleme Kriterleri (Başlangıçta ana sayfadan gelen varsa onu al, yoksa boş olsun)
  const [filtreler, setFiltreler] = useState({
    nereden: location.state?.nereden || '',
    nereye: location.state?.nereye || '',
    yukTipi: '' // Kategori butonları için
  });

  // Veritabanı Bağlantısı
  useEffect(() => {
    const ilanlarRef = collection(db, "ilanlar");
    const q = query(ilanlarRef, orderBy("tarih_eklenme", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const gelenVeriler = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setIlanlar(gelenVeriler);
      setYukleniyor(false);
    });

    return () => unsubscribe();
  }, []);

  // Kullanıcı bu sayfadaki inputlara yazdıkça filtreyi güncelle
  const handleFilterChange = (e) => {
    setFiltreler({ ...filtreler, [e.target.name]: e.target.value });
  };

  // Kategori butonuna basınca çalışacak fonksiyon
  const kategoriSec = (tip) => {
    // Eğer zaten o seçiliyse seçimi kaldır (toggle), değilse seç
    setFiltreler({ ...filtreler, yukTipi: filtreler.yukTipi === tip ? '' : tip });
  };

  // --- ANA FİLTRELEME MANTIĞI ---
  const filtrelenmisIlanlar = ilanlar.filter(ilan => {
    const arananNereden = filtreler.nereden.toLowerCase();
    const arananNereye = filtreler.nereye.toLowerCase();
    const arananTip = filtreler.yukTipi;
    const yayindaMi = ilan.durum === 1 || ilan.durum === undefined;
    if (!yayindaMi) return false;
    const ilanNereden = ilan.nereden?.toLowerCase() || '';
    const ilanNereye = ilan.nereye?.toLowerCase() || '';
    const ilanTip = ilan.yukTipi || '';
    
    // 1. Şehir kontrolü
    const sehirUyuyorMu = ilanNereden.includes(arananNereden) && ilanNereye.includes(arananNereye);
    
    // 2. Tip kontrolü (Buton seçiliyse kontrol et, seçili değilse hepsi uyar)
    const tipUyuyorMu = arananTip === '' ? true : ilanTip === arananTip;

    return sehirUyuyorMu && tipUyuyorMu;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      
      {/* Üst Başlık ve İlan Ekle Butonu */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Yük İlanları</h1>
        <a href="/ilan-ekle" className="bg-yellow-500 text-slate-900 px-4 py-2 rounded font-bold hover:bg-yellow-400 text-sm whitespace-nowrap">
          + İlan Ekle
        </a>
      </div>

      {/* --- YENİ: SAYFA İÇİ FİLTRELEME ALANI --- */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <h3 className="text-sm font-bold text-gray-500 mb-3 uppercase tracking-wider">Detaylı Filtreleme</h3>
        
        {/* Şehir Arama Inputları */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <div className="relative">
            <span className="absolute left-3 top-3 text-gray-400">📍</span>
            <input 
              name="nereden"
              value={filtreler.nereden}
              onChange={handleFilterChange}
              type="text" 
              placeholder="Nereden..." 
              className="w-full pl-10 p-2 border rounded bg-gray-50 focus:bg-white focus:border-yellow-500 outline-none transition"
            />
          </div>
          <div className="relative">
             <span className="absolute left-3 top-3 text-gray-400">🏁</span>
             <input 
              name="nereye"
              value={filtreler.nereye}
              onChange={handleFilterChange}
              type="text" 
              placeholder="Nereye..." 
              className="w-full pl-10 p-2 border rounded bg-gray-50 focus:bg-white focus:border-yellow-500 outline-none transition"
            />
          </div>
        </div>

        {/* Kategori Butonları (Artık Çalışıyor!) */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
           <button 
             onClick={() => setFiltreler({...filtreler, yukTipi: ''})}
             className={`px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap ${filtreler.yukTipi === '' ? 'bg-slate-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
             Tümü
           </button>
           
           {['Paletli', 'Dökme', 'Frigo', 'Konteyner', 'Evden Eve', 'Oto Taşıma'].map((tip) => (
             <button 
               key={tip}
               onClick={() => kategoriSec(tip)}
               className={`px-4 py-2 rounded-full text-sm font-medium border transition whitespace-nowrap 
                 ${filtreler.yukTipi === tip 
                   ? 'bg-yellow-500 text-slate-900 border-yellow-500' 
                   : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                 }`}>
               {tip}
             </button>
           ))}
        </div>
      </div>
      {/* ---------------------------------------- */}

      {/* Sonuç Listesi */}
      {yukleniyor ? (
        <div className="text-center py-10 text-gray-500">Yükleniyor...</div>
      ) : (
        <div className="grid gap-4">
          {filtrelenmisIlanlar.length > 0 ? (
            filtrelenmisIlanlar.map((ilan) => (
              <YukKarti 
                key={ilan.id} 
                id={ilan.id} 
                {...ilan} // Tüm özellikleri (nereden, nereye, fiyat vs.) otomatik aktarır
              />
            ))
          ) : (
            // İlan bulunamadığında filtreyi temizleme butonu gösterelim
            <div className="text-center p-10 bg-white rounded shadow border border-gray-100">
              <div className="text-4xl mb-4">🔍</div>
              <p className="text-gray-600 font-bold">Bu kriterlere uygun yük bulunamadı.</p>
              <button 
                onClick={() => setFiltreler({nereden: '', nereye: '', yukTipi: ''})}
                className="mt-4 text-blue-600 hover:underline font-medium">
                Filtreleri Temizle ve Tümünü Gör
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default YukIlanlari;