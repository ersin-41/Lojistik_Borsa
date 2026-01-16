import React from 'react';

const Kvkk = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-800 mb-6">Kişisel Verilerin Korunması (KVKK)</h1>
      <div className="text-gray-600 text-sm space-y-4">
        <p>LojistikBorsa olarak kişisel verilerinizin güvenliğine büyük önem veriyoruz.</p>
        <h3 className="font-bold text-slate-800 text-lg">1. Veri Sorumlusu</h3>
        <p>6698 sayılı Kişisel Verilerin Korunması Kanunu uyarınca, kişisel verileriniz veri sorumlusu sıfatıyla şirketimiz tarafından işlenmektedir.</p>
        <h3 className="font-bold text-slate-800 text-lg">2. İşlenen Veriler</h3>
        <p>Ad, soyad, telefon numarası, e-posta adresi ve konum bilgileri hizmetlerimizin sunulması amacıyla işlenmektedir.</p>
        {/* Burası uzatılabilir */}
      </div>
    </div>
  );
};
export default Kvkk;