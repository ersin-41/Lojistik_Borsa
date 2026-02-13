import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import AracKarti from '../components/AracKarti';
import SeoManager from '../components/SeoManager';

const AracIlanlari = () => {
  const [araclar, setAraclar] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  // Filtreleme State'i
  const [filtre, setFiltre] = useState({ nereden: '', kasaTipi: '' });

  useEffect(() => {
    // "araclar" koleksiyonundan çekiyoruz
    const q = query(collection(db, "araclar"), orderBy("tarih_eklenme", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAraclar(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setYukleniyor(false);
    });
    return () => unsubscribe();
  }, []);

  // Basit Filtreleme
  const filtrelenmisAraclar = araclar.filter(arac => {
            if (arac.durum === 2) return false;
            return arac.nereden.toLowerCase().includes(filtre.nereden.toLowerCase()) &&
            (filtre.kasaTipi === '' || arac.kasaTipi === filtre.kasaTipi);
           });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Boş Araçlar</h1>
        <a href="/arac-ekle" className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700 text-sm">
          + Araç Ekle
        </a>
        <div className="...">
      {/* Return'ün hemen altına ekle: */}
      <SeoManager 
        title="Boş Araç İlanları" 
        description="81 ile anlık tır, kamyon, kamyonet ve panelvan ilanları. Yükünüzü taşıyacak boş aracı hemen bulun." 
      />

      {/* ... Sayfanın geri kalanı ... */}
    </div>
      </div>

      {/* Filtre Alanı */}
      <div className="bg-white p-4 rounded shadow-sm mb-6 flex gap-3 flex-col md:flex-row">
         <input 
           type="text" 
           placeholder="Hangi şehirde araç arıyorsun?" 
           className="flex-1 p-2 border rounded outline-none focus:border-blue-500"
           onChange={(e) => setFiltre({...filtre, nereden: e.target.value})}
         />
         <select 
            className="p-2 border rounded outline-none focus:border-blue-500 bg-white"
            onChange={(e) => setFiltre({...filtre, kasaTipi: e.target.value})}
         >
            <option value="">Tüm Kasa Tipleri</option>
            <option value="Tenteli">Tenteli</option>
            <option value="Frigo">Frigo</option>
            <option value="Damperli">Damperli</option>
            <option value="Oto Taşıyıcı (Lohir)">Çoklu Oto Taşıyıcı</option>
            <option value="Tekli Kurtarıcı">Tekli Kurtarıcı</option>
         </select>
      </div>

      {yukleniyor ? <div className="text-center">Yükleniyor...</div> : (
        <div className="grid gap-4">
           {filtrelenmisAraclar.map(arac => <AracKarti key={arac.id} {...arac} />)}
           {filtrelenmisAraclar.length === 0 && <p className="text-center text-gray-500">Araç bulunamadı.</p>}
        </div>
      )}
    </div>
  );
};

export default AracIlanlari;