import React from 'react';

const SurucuAdayKarti = ({ adSoyad, sehir, ehliyet, tecrubeYili, arananIs, calismaTercihi, telefon, ekleyen_foto, aciklama }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow border-l-4 border-red-500 mb-4">
      <div className="flex items-start gap-4">
        {/* Fotoğraf */}
        <img src={ekleyen_foto || 'https://via.placeholder.com/150'} alt={adSoyad} className="w-16 h-16 rounded-full border-2 border-red-500 object-cover" />
        
        <div className="flex-1">
          <div className="flex justify-between items-start">
             <div>
                <h3 className="text-xl font-bold text-slate-800">{adSoyad}</h3>
                <p className="text-gray-500 text-sm mt-1">
                  📍 {sehir} | Aradığı İş: <span className="font-bold text-red-600">{arananIs}</span>
                </p>
             </div>
             <div className="text-right">
               <span className="bg-red-100 text-red-800 px-3 py-1 rounded font-bold text-sm block mb-1">{calismaTercihi}</span>
             </div>
          </div>

          <div className="mt-4 flex gap-2 flex-wrap">
             <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded border">🪪 {ehliyet}</span>
             <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded border">⭐ {tecrubeYili} Yıl Tecrübe</span>
          </div>

          <p className="mt-3 text-gray-600 text-sm italic bg-gray-50 p-2 rounded border border-gray-100">
             "{aciklama}"
          </p>

          <div className="mt-4 pt-3 border-t flex justify-end">
            {/* Firmalar için Ara Butonu */}
            <a href={`tel:${telefon}`} className="bg-red-600 text-white px-6 py-2 rounded text-sm font-bold hover:bg-red-700 transition flex items-center gap-2">
               📞 Sürücüyü Ara
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurucuAdayKarti;