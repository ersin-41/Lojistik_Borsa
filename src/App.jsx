import React from 'react';
// DÜZELTME 1: BrowserRouter'ı 'Router' olarak kullanabilmek için 'as Router' ekledik
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import YukIlanlari from './pages/YukIlanlari';
import IlanEkle from './pages/IlanEkle'; 
import IlanDetay from './pages/IlanDetay';
import GirisYap from './pages/GirisYap';
import AracEkle from './pages/AracEkle';
import AracIlanlari from './pages/AracIlanlari';
import SoforIlaniEkle from './pages/SoforIlaniEkle';
import SoforIlanlari from './pages/SoforIlanlari';
import SurucuIsAramaEkle from './pages/SurucuIsAramaEkle';
import SurucuIsArayanlar from './pages/SurucuIsArayanlar';
import Profilim from './pages/Profilim';
import Footer from './components/Footer';
import Hakkimizda from './pages/Hakkimizda';
import Kvkk from './pages/Kvkk';
import Iletisim from './pages/Iletisim';
import Gizlilik from './pages/Gizlilik';
import KullanimSartlari from './pages/KullanimSartlari';
import KayitOl from './pages/KayitOl'
import SifremiUnuttum from './pages/SifremiUnuttum';


function App() {
  return (
    <Router>
      {/* DÜZELTME 2: Footer'ın en alta yapışması için Flex yapısını buraya kuruyoruz */}
      <div className="flex flex-col min-h-screen">
        <ScrollToTop />
        <Navbar />

        {/* İçerik alanı: flex-grow ile boşluğu doldurur ve footer'ı aşağı iter */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/ilanlar" element={<YukIlanlari />} />
            <Route path="/ilan-ekle" element={<IlanEkle />} />
            <Route path="/ilan/:id" element={<IlanDetay />} />
            <Route path="/giris" element={<GirisYap />} />
            <Route path="/kayit" element={<KayitOl />} />
            <Route path="/sifremi-unuttum" element={<SifremiUnuttum />} />
            <Route path="/araclar" element={<AracIlanlari />} />
            <Route path="/arac-ekle" element={<AracEkle />} />
            <Route path="/surucu-ilanlari" element={<SoforIlanlari />} />
            <Route path="/sofor-ilani-ver" element={<SoforIlaniEkle />} />
            <Route path="/surucu-is-arayanlar" element={<SurucuIsArayanlar />} />
            <Route path="/surucu-is-arama-ekle" element={<SurucuIsAramaEkle />} />
            <Route path="/profilim" element={<Profilim />} />
            <Route path="/hakkimizda" element={<Hakkimizda />} />
            <Route path="/kvkk" element={<Kvkk />} />
            <Route path="/iletisim" element={<Iletisim />} />
            <Route path="/gizlilik" element={<Gizlilik />} />
            <Route path="/kullanim-sartlari" element={<KullanimSartlari />} />
          </Routes>
        </main>

        <Footer />
        
      </div>
    </Router>
  );
}

export default App;