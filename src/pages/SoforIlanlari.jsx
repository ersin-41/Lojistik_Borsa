import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import SoforKarti from '../components/SoforKarti';

const SoforIlanlari = () => {
  const [ilanlar, setIlanlar] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [filtreSehir, setFiltreSehir] = useState('');

  useEffect(() => {
    // "sofor_ilanlari" koleksiyonu
    const q = query(collection(db, "sofor_ilanlari"), orderBy("tarih_eklenme", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setIlanlar(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setYukleniyor(false);
    });
    return () => unsubscribe();
  }, []);

  const filtrelenmis = ilanlar.filter(ilan => {
    if (ilan.durum === 2) return false;
    return ilan.sehir.toLowerCase().includes(filtreSehir.toLowerCase()) || 
           ilan.baslik.toLowerCase().includes(filtreSehir.toLowerCase())
});

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Sürücü İş İlanları</h1>
        <a href="/sofor-ilani-ver" className="bg-green-600 text-white px-4 py-2 rounded font-bold hover:bg-green-700 text-sm">
          + İlan Ver
        </a>
      </div>

      <div className="bg-white p-4 rounded shadow-sm mb-6">
         <input 
           type="text" 
           placeholder="Şehir veya pozisyon ara..." 
           className="w-full p-2 border rounded outline-none focus:border-green-500"
           onChange={(e) => setFiltreSehir(e.target.value)}
         />
      </div>

      {yukleniyor ? <div className="text-center">Yükleniyor...</div> : (
        <div className="grid gap-4">
           {filtrelenmis.map(ilan => <SoforKarti key={ilan.id} {...ilan} />)}
           {filtrelenmis.length === 0 && <p className="text-center text-gray-500">Uygun ilan bulunamadı.</p>}
        </div>
      )}
    </div>
  );
};

export default SoforIlanlari;