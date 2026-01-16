import React from 'react';
import { useNavigate } from 'react-router-dom';

const YukKarti = ({ id, nereden, nereye, tarih, yukTipi, fiyat, puan }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow border-l-4 border-yellow-500 mb-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            {nereden} <span className="text-gray-400">➝</span> {nereye}
          </h3>
          <p className="text-gray-500 text-sm mt-1">📅 {tarih}</p>
        </div>
        <div className="text-right">
          <span className="block text-xl font-bold text-green-600">{fiyat} ₺</span>
          <span className="text-xs text-gray-400">KDV Dahil</span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex gap-2">
          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-semibold">{yukTipi}</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-600">
          <span className="text-yellow-500 mr-1">★</span>
          <span className="font-bold">{puan}</span>
        </div>
      </div>
      
     
      <button 
        onClick={() => navigate(`/ilan/${id}`)}
        className="w-full mt-4 bg-slate-800 text-white py-2 rounded hover:bg-slate-700 transition text-sm font-bold tracking-wide flex items-center justify-center gap-2">
     <span>🔍</span>
        {/* translate="no" özelliği Google'ın burayı çevirmesini engeller */}
     <span translate="no" className="notranslate">İlanı İncele</span>
      </button>
    </div>
  );
};

export default YukKarti;