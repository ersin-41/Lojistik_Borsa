import React, { useState, useEffect } from 'react';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useNavigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';

const SoforIlaniEkle = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [kurumsalMod, setKurumsalMod] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [duzenlemeModu, setDuzenlemeModu] = useState(false);
  const [duzenlenecekId, setDuzenlenecekId] = useState(null);

  const [formData, setFormData] = useState({
    sehir: '',
    baslik: '',
    ehliyet: '',
    tecrube: '',
    calismaBolgesi: '',
    maas: '',
    telefon: '',
    aciklama: '',
    firmaAdi: ''
  });

  useEffect(() => {
    // 1. Düzenleme verisi kontrolü
    if (location.state) {
      const { id, tarih, tarih_eklenme, ekleyen_id, ekleyen_isim, ekleyen_foto, puan, durum, ...gelenVeri } = location.state;
      setFormData(gelenVeri);
      setDuzenlenecekId(id);
      setDuzenlemeModu(true);
      if (gelenVeri.firmaAdi) setKurumsalMod(true);
    }

    // 2. Oturum Kontrolü
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        alert("İlan vermek için giriş yapmalısınız.");
        navigate('/giris');
      } else {
        setUser(currentUser);
      }
    });
    return () => unsubscribe();
  }, [navigate, location.state]);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    if (e.target.name === 'kurumsalMod') setKurumsalMod(value);
    else setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setYukleniyor(true);

    try {
      const gorunenIsim = kurumsalMod ? formData.firmaAdi : user.displayName;
      const gorunenFoto = kurumsalMod ? null : user.photoURL;

      if (kurumsalMod && !formData.firmaAdi) {
        alert("Lütfen firma ünvanını giriniz.");
        setYukleniyor(false);
        return;
      }

      const kayitVerisi = {
        ...formData,
        ekleyen_id: user.uid,
        ekleyen_isim: gorunenIsim,
        ekleyen_foto: gorunenFoto,
        durum: 1 // Yayında
      };

      if (duzenlemeModu && duzenlenecekId) {
        // GÜNCELLEME
        await updateDoc(doc(db, "sofor_ilanlari", duzenlenecekId), kayitVerisi);
        alert("İlan başarıyla güncellendi! ✅");
      } else {
        // EKLEME
        kayitVerisi.tarih = new Date();
        kayitVerisi.tarih_eklenme = new Date();
        kayitVerisi.puan = 4.8;
        await addDoc(collection(db, "sofor_ilanlari"), kayitVerisi);
        alert("İş ilanı başarıyla yayınlandı! 📢");
      }

      // Profil sayfasına dön
      navigate('/profilim');
    } catch (error) {
      console.error("Hata:", error);
      alert("Hata: " + error.message);
    } finally {
      setYukleniyor(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white p-8 rounded-lg shadow-lg border-t-4 border-green-600 relative">
        <button
          onClick={() => navigate('/profilim')}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 font-medium text-sm flex items-center gap-1"
        >
          ⬅️ İptal / Geri Dön
        </button>
        <h2 className="text-2xl font-bold mb-6 text-slate-800">
          {duzenlemeModu ? "Şoför İlanını Düzenle" : "Sürücü / Şoför İlanı Ver"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Kurumsal Mod */}
          <div className="bg-slate-50 p-4 rounded border border-slate-200 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <input type="checkbox" id="kurumsalCheck" name="kurumsalMod" checked={kurumsalMod} onChange={handleChange} className="w-5 h-5 text-green-600 rounded cursor-pointer" />
              <label htmlFor="kurumsalCheck" className="font-bold text-slate-700 cursor-pointer select-none">Firma Olarak Yayınla</label>
            </div>
            {kurumsalMod && (
              <input required={kurumsalMod} name="firmaAdi" value={formData.firmaAdi} onChange={handleChange} type="text" placeholder="Firma Ünvanı" className="w-full p-3 border border-green-300 rounded outline-none bg-green-50" />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">İlan Başlığı</label>
            <input required name="baslik" value={formData.baslik} onChange={handleChange} type="text" placeholder="Örn: Uluslararası Tır Şoförü Aranıyor" className="w-full p-3 border rounded focus:border-green-500 outline-none" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Şehir</label>
              <input required name="sehir" value={formData.sehir} onChange={handleChange} type="text" placeholder="Hangi şehirde ikamet etmeli?" className="w-full p-3 border rounded focus:border-green-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Çalışma Bölgesi</label>
              <select name="calismaBolgesi" value={formData.calismaBolgesi} onChange={handleChange} className="w-full p-3 border rounded focus:border-green-500 outline-none bg-white">
                <option value="">Seçiniz...</option>
                <option value="Şehir İçi">Sehir Ici</option>
                <option value="Yurtiçi (Şehirler Arası)">Yurtici (Sehirler Arasi)</option>
                <option value="Uluslararası">Uluslararasi</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gerekli Ehliyet</label>
              <select name="ehliyet" value={formData.ehliyet} onChange={handleChange} className="w-full p-3 border rounded focus:border-green-500 outline-none bg-white">
                <option value="">Seçiniz...</option>
                <option value="B Sınıfı">B Sınıfı (Kamyonet/Ticari)</option>
                <option value="C Sınıfı">C Sınıfı (Kamyon)</option>
                <option value="CE Sınıfı">CE Sınıfı (Tır)</option>
                <option value="SRC 5 (ADR)">🔥 SRC 5 (Tehlikeli Madde)</option>
                <option value="Silobas">🏗️ Silobas Tecrübeli</option>
                <option value="D Sınıfı">D Sınıfı (Servis/Otobüs)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tecrube (Yil)</label>
              <select name="tecrube" value={formData.tecrube} onChange={handleChange} className="w-full p-3 border rounded focus:border-green-500 outline-none bg-white">
                <option value="">Seçiniz...</option>
                <option value="Tecrubesiz">Tecrubesiz / Yetistirilmek Uzere</option>
                <option value="1-3 Yil">1-3 Yil</option>
                <option value="3-5 Yil">3-5 Yil</option>
                <option value="5 Yil+">5 Yil ve Uzeri</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Maaş / Olanaklar (Opsiyonel)</label>
              <input name="maas" value={formData.maas} onChange={handleChange} type="text" placeholder="Örn: 40.000 TL + Harcırah" className="w-full p-3 border rounded focus:border-green-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">İletişim Numarası</label>
              <input required name="telefon" value={formData.telefon} onChange={handleChange} type="tel" placeholder="0555..." className="w-full p-3 border rounded focus:border-green-500 outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">İş Tanımı ve Şartlar</label>
            <textarea name="aciklama" value={formData.aciklama} onChange={handleChange} rows="4" className="w-full p-3 border rounded focus:border-green-500 outline-none" placeholder="Detaylar..."></textarea>
          </div>

          <button disabled={yukleniyor} type="submit" className="w-full bg-green-700 text-white font-bold py-4 rounded hover:bg-green-800 transition shadow-lg mt-4 disabled:bg-gray-400">
            {yukleniyor ? 'Yayınlanıyor...' : 'İlanı Yayınla 📢'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SoforIlaniEkle;