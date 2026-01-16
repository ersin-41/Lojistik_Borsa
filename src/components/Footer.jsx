import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-gray-300 pt-12 pb-6 border-t border-slate-800 mt-auto no-print">
      <div className="max-w-6xl mx-auto px-4">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Logo ve Slogan */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 text-white font-bold text-xl mb-4">
               <span className="text-2xl">🚛</span> LojistikBorsa
            </div>
            <p className="text-sm text-gray-500">
              Türkiye'nin lider dijital lojistik platformu. Yükünüzü güvenle taşıyın.
            </p>
          </div>

          {/* Hızlı Linkler */}
          <div>
            <h4 className="text-white font-bold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/ilanlar" className="hover:text-yellow-500 transition">Yük İlanları</Link></li>
              <li><Link to="/araclar" className="hover:text-yellow-500 transition">Boş Araçlar</Link></li>
              <li><Link to="/surucu-ilanlari" className="hover:text-yellow-500 transition">Sürücü İş İlanları</Link></li>
              <li><Link to="/surucu-is-arayanlar" className="hover:text-yellow-500 transition">İş Arayanlar</Link></li>
            </ul>
          </div>

          {/* Kurumsal */}
          <div>
            <h4 className="text-white font-bold mb-4">Kurumsal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/hakkimizda" className="hover:text-yellow-500 transition">Hakkımızda</Link></li>
              <li><Link to="/kvkk" className="hover:text-yellow-500 transition">Kişisel Verilerin Korunması</Link></li>
              <li><Link to="/iletisim" className="hover:text-yellow-500 transition">İletişim</Link></li>
            </ul>
          </div>

          {/* İletişim Bilgisi */}
          <div>
            <h4 className="text-white font-bold mb-4">Bize Ulaşın</h4>
            <p className="text-sm text-gray-500 mb-2">📍 İzmit, Kocaeli, Türkiye</p>
            <p className="text-sm text-gray-500 mb-2">✉️ info@lojistikborsa.com</p>
            <p className="text-sm text-gray-500">📞 0850 123 45 67</p>
          </div>
        </div>

        {/* Alt Çizgi ve Telif Hakkı */}
        <div className="border-t border-slate-800 pt-6 text-center md:text-left flex flex-col md:flex-row justify-between items-center text-xs text-gray-600">
          <p>© 2026 LojistikBorsa. Tüm hakları saklıdır.</p>
          <div className="flex gap-4 mt-2 md:mt-0">
             <span>Gizlilik Politikası</span>
             <span>Kullanım Koşulları</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;