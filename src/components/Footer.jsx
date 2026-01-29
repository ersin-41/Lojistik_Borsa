import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* 1. SÜTUN: Marka ve Slogan */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-white p-1.5 rounded group-hover:scale-105 transition">
                <span className="text-2xl">🚛</span>
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">
                Lojistik<span className="text-yellow-500">365</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Yükünüz yolda, işiniz yolunda. Türkiye'nin 81 iline uzanan dijital lojistik ağı ile yük ve araç bulmak artık çok kolay.
            </p>
          </div>

          {/* 2. SÜTUN: Hızlı Linkler */}
          <div>
            <h3 className="text-white font-bold mb-4 border-l-4 border-yellow-500 pl-2">Platform</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/ilanlar" className="hover:text-yellow-500 transition">📦 Yük İlanları</Link></li>
              <li><Link to="/araclar" className="hover:text-yellow-500 transition">🚛 Boş Araçlar</Link></li>
              <li><Link to="/surucu-ilanlari" className="hover:text-yellow-500 transition">📢 Şoför İlanları</Link></li>
              <li><Link to="/surucu-is-arayanlar" className="hover:text-yellow-500 transition">📄 İş Arayanlar</Link></li>
            </ul>
          </div>

          {/* 3. SÜTUN: Kurumsal */}
          <div>
            <h3 className="text-white font-bold mb-4 border-l-4 border-yellow-500 pl-2">Kurumsal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/hakkimizda" className="hover:text-yellow-500 transition">Hakkımızda</Link></li>
              <li><Link to="/iletisim" className="hover:text-yellow-500 transition">İletişim</Link></li>
              <li><Link to="/gizlilik" className="hover:text-yellow-500 transition">Gizlilik Politikası</Link></li>
              <li><Link to="/kullanim-sartlari" className="hover:text-yellow-500 transition">Kullanım Şartları</Link></li>
            </ul>
          </div>

          {/* 4. SÜTUN: İletişim */}
          <div>
            <h3 className="text-white font-bold mb-4 border-l-4 border-yellow-500 pl-2">Bize Ulaşın</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <span className="text-yellow-500">📍</span>
                <span>Türkiye Geneli<br />Dijital Lojistik Platformu</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-yellow-500">✉️</span>
                <a href="mailto:info@lojistik365.com.tr" className="hover:text-white">info@lojistik365.com.tr</a>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-yellow-500">📞</span>
                <span>0538 767 91 95</span>
              </li>
            </ul>

            <div className="flex gap-4 mt-6">
              <a href="https://www.facebook.com/profile.php?id=61587067018884" target="_blank" rel="noreferrer" className="bg-slate-800 p-2 rounded-full hover:bg-blue-600 transition group">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" viewBox="0 0 448 512">
                  <path d="M64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64h98.2V320h-61v-76h61V192c0-40.5 24.8-62.5 60.8-62.5 17.1 0 31.8 1.3 36.1 1.7v42.1h-24.8c-19.6 0-23.4 9.3-23.4 23v37.8h46.7l-6 76h-40.7v160H392c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64z" />
                </svg>
              </a>
              <a href="https://www.instagram.com/lojistik365/" target="_blank" rel="noreferrer" className="bg-slate-800 p-2 rounded-full hover:bg-pink-600 transition group">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" viewBox="0 0 448 512">
                  <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z" />
                </svg>
              </a>
              <a href="https://www.linkedin.com/company/111431308/" target="_blank" rel="noreferrer" className="bg-slate-800 p-2 rounded-full hover:bg-blue-700 transition group">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" viewBox="0 0 448 512">
                  <path d="M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3c0-17.8-14.4-32.3-32-32.3zM135.4 416H69V202.2h66.5V416zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5zm282.1 243h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9V416z" />
                </svg>
              </a>
            </div>
          </div>

        </div>

        {/* ALT ÇİZGİ ve TELİF */}
        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500">
          <p>&copy; 2026 Lojistik365 Platformu. Tüm hakları saklıdır.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <span>Design by Lojistik365</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;