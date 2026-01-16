import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Helmet } from 'react-helmet-async';

const IlanDetay = () => {
  const { id } = useParams(); // URL'deki :id kısmını yakalar
  const navigate = useNavigate();
  
  const [ilan, setIlan] = useState(null);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    const veriGetir = async () => {
      try {
        const docRef = doc(db, "ilanlar", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setIlan(docSnap.data());
        } else {
          alert("Böyle bir ilan bulunamadı!");
          navigate('/ilanlar');
        }
      } catch (error) {
        console.error("Hata:", error);
      } finally {
        setYukleniyor(false);
      }
    };

    veriGetir();
  }, [id, navigate]);

  if (yukleniyor) return <div className="text-center mt-20">Yükleniyor...</div>;
  if (!ilan) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {ilan && (
      <Helmet>
        <title>{ilan.nereden} - {ilan.nereye} | LojistikBorsa</title>
        <meta name="description" content={`${ilan.yukTipi} yükü, ${ilan.fiyat} TL. Hemen incele!`} />
      </Helmet>
    )}
      {/* Geri Dön Butonu */}
      <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-slate-800 mb-4 flex items-center gap-2">
        ← Listeye Dön
      </button>

      <div className="bg-white rounded-lg shadow-xl overflow-hidden border-t-4 border-yellow-500">
        
        {/* Başlık Kısmı */}
        <div className="bg-slate-50 p-6 border-b">
          <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center gap-2">
                {ilan.nereden} <span className="text-gray-400">➝</span> {ilan.nereye}
              </h1>
              <p className="text-gray-500 mt-2">📅 Yükleme Tarihi: {ilan.tarih}</p>
            </div>
            <div className="text-right">
              <span className="block text-3xl font-bold text-green-600">{ilan.fiyat} ₺</span>
              <span className="text-sm text-gray-500">+ KDV</span>
            </div>
          </div>
        </div>

        {/* Detaylar Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Sol Taraf: Yük Bilgileri */}
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Yük Bilgileri</h3>
            <ul className="space-y-3">
              <li className="flex justify-between">
                <span className="text-gray-600">Yük Tipi:</span>
                <span className="font-semibold">{ilan.yukTipi}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-600">Araç İsteği:</span>
                <span className="font-semibold">Tır / Kırkayak</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-600">Tonaj:</span>
                <span className="font-semibold">24-26 Ton</span>
              </li>
            </ul>

            <div className="mt-6">
              <h4 className="font-bold text-slate-800 mb-2">Açıklama:</h4>
              <p className="text-gray-600 bg-gray-50 p-3 rounded text-sm">
                {ilan.aciklama || "Ek açıklama belirtilmemiş."}
              </p>
            </div>
          </div>

          {/* Sağ Taraf: Firma & İletişim */}
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Firma Bilgileri</h3>
            <div className="flex items-center gap-3 mb-4">
              {/* Profil Fotoğrafı Kontrolü */}
{ilan.ekleyen_foto ? (
  <img src={ilan.ekleyen_foto} alt="Firma" className="w-12 h-12 rounded-full border-2 border-yellow-500 object-cover" />
) : (
  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-xl">🏢</div>
)}

<div>
  {/* Eğer isim varsa onu yaz, yoksa anonim yaz */}
  <p className="font-bold">{ilan.ekleyen_isim || "Lojistik Firması"}</p>
  <div className="flex text-yellow-500 text-sm">
    {'★'.repeat(Math.floor(ilan.puan || 4))} 
    <span className="text-gray-400 ml-1">({ilan.puan || 4.5})</span>
  </div>
</div>
            </div>

             {/* Aksiyon Butonları */}
             <div className="space-y-3 mt-6">
             {/* ARAMA BUTONU */}
             <a 
             href={`tel:${ilan.telefon}`} 
             className="w-full bg-green-600 text-white py-3 rounded font-bold hover:bg-green-700 transition flex justify-center items-center gap-2">
             📞 Hemen Ara
             </a>

             {/* WHATSAPP BUTONU */}
             <a 
             href={`https://wa.me/90${ilan.telefon?.replace(/\D/g,'').slice(-10)}?text=Merhaba, ${ilan.nereden}-${ilan.nereye} ilanı için yazıyorum.`}
             target="_blank"
             rel="noreferrer"
             className="w-full bg-green-500 text-white py-3 rounded font-bold hover:bg-green-600 transition flex justify-center items-center gap-2">
             💬 WhatsApp'tan Yaz
             </a>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default IlanDetay;