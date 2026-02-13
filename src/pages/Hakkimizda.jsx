import React from 'react';
import SeoManager from '../components/SeoManager';

const Hakkimizda = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-800 mb-6">Hakkımızda</h1>
      <p className="text-gray-600 leading-relaxed mb-4">
        Lojistik365, 2026 yılında lojistik sektöründeki dijitalleşme ihtiyacına çözüm sunmak amacıyla kurulmuştur.
        Amacımız, yük sahipleri ile nakliyecileri en hızlı, güvenli ve şeffaf şekilde bir araya getirmektir.
      </p>
      <p className="text-gray-600 leading-relaxed">
        Dijital platformumuz, Türkiye'nin dört bir yanındaki binlerce tır, kamyon ve yük sahibini tek bir platformda buluşturarak
        lojistik süreçlerini optimize etmektedir.
      </p>
      <div className="...">
      {/* Return'ün hemen altına ekle: */}
      <SeoManager 
        title="Hakkımızda" 
        description="Lojistik365 nedir? Dijital lojistik ağımız, vizyonumuz ve güvenilir taşımacılık çözümlerimiz hakkında bilgi alın." 
      />
      
      {/* ... Sayfanın geri kalanı ... */}
    </div>
    </div>
  );
};
export default Hakkimizda;