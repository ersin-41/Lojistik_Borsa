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
                <span>İzmit, Kocaeli<br/>Türkiye</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-yellow-500">✉️</span>
                <a href="mailto:destek@lojistik365.com" className="hover:text-white">info@lojistik365.com.tr</a>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-yellow-500">📞</span>
                <span>0850 123 45 67</span>
              </li>
            </ul>
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