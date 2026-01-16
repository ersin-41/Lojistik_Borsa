import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import SurucuAdayKarti from '../components/SurucuAdayKarti';
import { Link } from 'react-router-dom';

const SurucuIsArayanlar = () => {
  const [adaylar, setAdaylar] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  
  // Sadece Arama Yapmak İçin Filtre State'i
  const [filtre, setFiltre] = useState({ sehir: '', ehliyet: '' });

  useEffect(() => {
    // Veritabanından verileri çekiyoruz
    const q = query(collection(db, "surucu_is_arama"), orderBy("tarih_eklenme", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAdaylar(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setYukleniyor(false);
    });
    return () => unsubscribe();
  }, []);

  // Arama kutusuna yazılanlara göre listeyi daralt
  const filtrelenmis = adaylar.filter(aday => {
    // YENİ: İş bulmuş sürücüleri gizle
    if (aday.durum === 2) return false;
    return aday.sehir.toLowerCase().includes(filtre.sehir.toLowerCase()) &&
           (filtre.ehliyet === '' || aday.ehliyet === filtre.ehliyet);
});

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Üst Başlık ve İlan Ekleme Butonu */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">İş Arayan Sürücüler</h1>
        
        {/* Bu buton kullanıcıyı FORMA götürür */}
        <Link to="/surucu-is-arama-ekle" className="bg-red-600 text-white px-4 py-2 rounded font-bold hover:bg-red-700 text-sm flex items-center gap-2">
          <span>+</span> İş Arıyorum İlanı Ver
        </Link>
      </div>

      {/* --- BURASI SADECE ARAMA ALANI (VERİ GİRİŞİ DEĞİL) --- */}
      <div className="bg-white p-4 rounded shadow-sm mb-6 border border-gray-200">
         <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Sürücü Ara / Filtrele</h3>
         <div className="flex gap-3 flex-col md:flex-row">
            <input 
              type="text" 
              placeholder="Şehir ara (Örn: İstanbul)..." 
              className="flex-1 p-2 border rounded outline-none focus:border-red-500 bg-gray-50"
              onChange={(e) => setFiltre({...filtre, sehir: e.target.value})}
            />
            <select 
                className="p-2 border rounded outline-none focus:border-red-500 bg-white"
                onChange={(e) => setFiltre({...filtre, ehliyet: e.target.value})}
            >
                <option value="">Tüm Ehliyetler</option>
                <option value="CE Sınıfı (Tır)">CE Sınıfı (Tır)</option>
                <option value="C Sınıfı (Kamyon)">C Sınıfı (Kamyon)</option>
                <option value="B Sınıfı (Kamyonet)">B Sınıfı (Kamyonet)</option>
            </select>
         </div>
      </div>
      {/* ---------------------------------------------------- */}

      {/* LİSTELEME ALANI */}
      {yukleniyor ? <div className="text-center py-10">Yükleniyor...</div> : (
        <div className="grid gap-4">
           {filtrelenmis.map(aday => (
             <SurucuAdayKarti key={aday.id} {...aday} />
           ))}
           
           {filtrelenmis.length === 0 && (
             <div className="text-center p-8 bg-gray-50 rounded border border-dashed border-gray-300">
               <p className="text-gray-500">Aradığınız kriterde sürücü bulunamadı.</p>
             </div>
           )}
        </div>
      )}
    </div>
  );
};

export default SurucuIsArayanlar;