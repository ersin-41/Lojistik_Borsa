import React from 'react';

const KullanimSartlari = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-900 mb-6 border-l-8 border-yellow-500 pl-4">
        Kullanım Şartları
      </h1>
      <p className="text-sm text-gray-500 mb-8">Yürürlük Tarihi: 17 Ocak 2026</p>

      <div className="space-y-6 text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-2">1. Genel Hükümler</h2>
          <p>
            Lojistik365, yük sahipleri ile nakliyecileri bir araya getiren dijital bir pazar yeridir. Platformumuz, taraflar arasındaki ticari anlaşmanın doğrudan tarafı değildir. Nakliye hizmetinin kalitesi, güvenliği ve ödemesi konusunda sorumluluk taraflara aittir.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-2">2. Üyelik ve Hesap Güvenliği</h2>
          <p>
            Siteye üye olurken verdiğiniz bilgilerin doğruluğunu taahhüt edersiniz. Yanıltıcı bilgi (sahte isim, yanlış ehliyet beyanı vb.) durumunda hesabınız kalıcı olarak kapatılabilir. Hesap şifrenizin güvenliği sizin sorumluluğunuzdadır.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-2">3. İlan Verme Kuralları</h2>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Yasal olmayan yüklerin (uyuşturucu, kaçak mal vb.) ilanı kesinlikle yasaktır.</li>
            <li>Aynı ilanın tekrar tekrar girilmesi (spam) yasaktır.</li>
            <li>İlanlarda hakaret, küfür veya ayrımcılık içeren ifadeler kullanılamaz.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-2">4. Sorumluluk Reddi</h2>
          <p>
            Lojistik365, platformda yayınlanan ilanların doğruluğunu garanti etmez. Kullanıcılar, anlaştıkları karşı tarafı (Firma veya Sürücü) kendi imkanlarıyla doğrulamakla yükümlüdür. Olası maddi kayıplardan Lojistik365 sorumlu tutulamaz.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-2">5. Değişiklik Hakkı</h2>
          <p>
            Lojistik365, bu kullanım şartlarını önceden bildirmeksizin değiştirme hakkını saklı tutar. Sitenin kullanımı, güncel şartların kabul edildiği anlamına gelir.
          </p>
        </section>
      </div>
    </div>
  );
};

export default KullanimSartlari;