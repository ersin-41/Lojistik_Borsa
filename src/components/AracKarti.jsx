import React from 'react';

const AracKarti = ({ id, nereden, nereye, tarih, aracTipi, kasaTipi, telefon, ekleyen_isim, puan }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow border-l-4 border-blue-500 mb-4 relative">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            📍 {nereden} <span className="text-gray-400">➝</span> {nereye || 'Farketmez'}
          </h3>
          <p className="text-gray-500 text-sm mt-1">📅 Müsaitlik: {tarih}</p>
        </div>
        <div className="text-right">
           <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-semibold block mb-1">{aracTipi}</span>
           <span className="text-xs text-gray-500">{kasaTipi}</span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t pt-3">
        <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">
                {ekleyen_isim?.charAt(0) || 'U'}
             </div>
             <div className="text-sm">
                <p className="font-bold text-slate-700">{ekleyen_isim}</p>
                <p className="text-xs text-yellow-500">★ {puan}</p>
             </div>
        </div>
        
        {/* Direkt Arama Butonu */}
        <a href={`tel:${telefon}`} className="bg-green-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-green-700 transition flex items-center gap-1">
           📞 Ara
        </a>
      </div>
    </div>
  );
};

export default AracKarti;