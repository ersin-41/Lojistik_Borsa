import React from 'react';

const Gizlilik = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-900 mb-6 border-l-8 border-yellow-500 pl-4">
        Gizlilik Politikası
      </h1>
      <p className="text-sm text-gray-500 mb-8">Son Güncelleme: 17 Ocak 2026</p>

      <div className="space-y-6 text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-2">1. Veri Toplama</h2>
          <p>
            Lojistik365 olarak, hizmetlerimizi kullanırken sizden ad, soyad, e-posta adresi, telefon numarası gibi kişisel verileri talep edebiliriz. Bu veriler, ilan verme ve iletişim kurma süreçleri için gereklidir.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-2">2. Verilerin Kullanımı</h2>
          <p>
            Toplanan veriler şu amaçlarla kullanılır:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Kullanıcı hesaplarının oluşturulması ve yönetilmesi.</li>
            <li>Yük ve araç ilanlarının yayınlanması.</li>
            <li>Kullanıcılar arası (Şoför-Firma) iletişimin sağlanması.</li>
            <li>Hizmet kalitesinin artırılması ve teknik sorunların çözümü.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-2">3. Üçüncü Taraflarla Paylaşım</h2>
          <p>
            Kişisel verileriniz, yasal zorunluluklar haricinde ve sizin açık rızanız olmadan üçüncü taraf pazarlama şirketleriyle asla paylaşılmaz. Ancak, ilanlarınızdaki iletişim bilgileri (Telefon vb.) platformun doğası gereği diğer kullanıcılara açıktır.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-2">4. Veri Güvenliği</h2>
          <p>
            Verileriniz, Google Firebase altyapısı üzerinde güvenli sunucularda saklanmaktadır. Yetkisiz erişimi engellemek için endüstri standardı güvenlik önlemleri uygulanmaktadır.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-2">5. İletişim</h2>
          <p>
            Gizlilik politikamızla ilgili sorularınız için <a href="mailto:destek@lojistik365.com" className="text-yellow-600 font-bold">destek@lojistik365.com</a> adresinden bize ulaşabilirsiniz.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Gizlilik;