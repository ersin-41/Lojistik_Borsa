import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  const [arama, setArama] = useState({ nereden: '', nereye: '' });

  const handleChange = (e) => {
    setArama({ ...arama, [e.target.name]: e.target.value });
  };

  const handleSearch = () => {
    navigate('/ilanlar', { state: arama });
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section (Üst Bölüm) */}
      <div className="bg-slate-900 py-20 px-4 text-center">
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-6">
          Yükün Hazır, Aracın Boş Kalmasın
        </h1>
        <p className="text-gray-400 mb-10 text-lg max-w-2xl mx-auto">
          Türkiye'nin en gelişmiş dijital lojistik ağı. Yük arayanlar ve araç sahipleri için güvenli, hızlı ve şeffaf buluşma noktası.
        </p>

        {/* Arama Kutusu */}
        <div className="max-w-4xl mx-auto bg-white p-4 rounded-lg shadow-2xl flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <span className="absolute left-4 top-4 text-gray-400">📍</span>
            <input
              name="nereden"
              onChange={handleChange}
              type="text"
              placeholder="Nereden (İl, İlçe)..."
              className="w-full p-4 pl-10 border border-gray-200 rounded outline-none focus:border-yellow-500 text-gray-700 font-medium"
            />
          </div>
          <div className="flex-1 relative">
            <span className="absolute left-4 top-4 text-gray-400">🏁</span>
            <input
              name="nereye"
              onChange={handleChange}
              type="text"
              placeholder="Nereye..."
              className="w-full p-4 pl-10 border border-gray-200 rounded outline-none focus:border-yellow-500 text-gray-700 font-medium"
            />
          </div>
          <button
            onClick={handleSearch}
            className="bg-yellow-500 text-slate-900 font-bold py-4 px-10 rounded hover:bg-yellow-400 transition shadow-md whitespace-nowrap">
            Yük Bul 🚚
          </button>
        </div>
      </div>

      {/* --- YENİ EKLENEN KURUMSAL BÖLÜM (Vitrin Yerine) --- */}
      <div className="bg-gray-50 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800">Neden Lojistik365?</h2>
            <p className="text-gray-500 mt-2">İşinizi büyütmek için ihtiyacınız olan her şey tek platformda.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Kart 1 */}
            <div className="bg-white p-8 rounded-lg shadow hover:shadow-lg transition text-center border-t-4 border-yellow-500">
              <div className="text-4xl mb-4">🛡️</div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Güvenilir Ağ</h3>
              <p className="text-gray-600 text-sm">
                Onaylanmış kurumsal firmalar ve puanlanmış güvenilir sürücülerle çalışın. Sürprizlere yer yok.
              </p>
            </div>

            {/* Kart 2 */}
            <div className="bg-white p-8 rounded-lg shadow hover:shadow-lg transition text-center border-t-4 border-blue-500">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Hızlı Operasyon</h3>
              <p className="text-gray-600 text-sm">
                Yükünüzü dakikalar içinde yayınlayın, boş aracınızı anında doldurun. Zaman nakittir.
              </p>
            </div>

            {/* Kart 3 */}
            <div className="bg-white p-8 rounded-lg shadow hover:shadow-lg transition text-center border-t-4 border-green-500">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Her Yerden Erişim</h3>
              <p className="text-gray-600 text-sm">
                Mobil uyumlu altyapımız sayesinde ofiste, evde veya yolda; işiniz her zaman cebinizde.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Çağrı (Call to Action) */}
      <div className="bg-slate-800 text-white py-16 text-center px-4">
        <h2 className="text-3xl font-bold mb-4">Hemen Ücretsiz Katılın</h2>
        <p className="text-gray-400 mb-8">Binlerce lojistik profesyonelinin arasına katılmak için daha ne bekliyorsunuz?</p>
        <a href="/giris" className="bg-yellow-500 text-slate-900 px-8 py-3 rounded-full font-bold hover:bg-yellow-400 transition transform hover:scale-105 inline-block">
          Hesap Oluştur 🚀
        </a>
      </div>
    </div>
  );
};

export default Home;