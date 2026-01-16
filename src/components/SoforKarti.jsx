import React from 'react';

const SoforKarti = ({ baslik, sehir, ehliyet, tecrube, maas, calismaBolgesi, telefon, ekleyen_isim, aciklama }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow border-l-4 border-green-600 mb-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold text-slate-800">{baslik}</h3>
          <p className="text-gray-500 text-sm mt-1 flex items-center gap-1">
            📍 {sehir} <span className="text-gray-300">|</span> 🌍 {calismaBolgesi}
          </p>
        </div>
        {maas && (
          <div className="bg-green-50 text-green-800 px-3 py-1 rounded font-bold text-sm">
            {maas}
          </div>
        )}
      </div>

      <div className="mt-4 flex gap-2 flex-wrap">
          <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded border">🪪 {ehliyet}</span>
          <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded border flex items-center gap-1">
       ⭐ <span dangerouslySetInnerHTML={{ __html: tecrube }}></span></span>
      </div>

      <p className="mt-3 text-gray-600 text-sm line-clamp-2">
        {aciklama}
      </p>

      <div className="mt-4 flex items-center justify-between border-t pt-3">
        <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">
                🏢
             </div>
             <div className="text-sm">
                <p className="font-bold text-slate-700">{ekleyen_isim}</p>
             </div>
        </div>
        
        {/* İş Başvurusu İçin Ara */}
        <a href={`tel:${telefon}`} className="bg-green-600 text-white px-6 py-2 rounded text-sm font-bold hover:bg-green-700 transition flex items-center gap-2">
           📞 Başvur
        </a>
      </div>
    </div>
  );
};

export default SoforKarti;