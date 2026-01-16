import React, { useState, useEffect } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';

const AracEkle = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [kurumsalMod, setKurumsalMod] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(false);

  const [formData, setFormData] = useState({
    nereden: '',
    nereye: '',
    tarih: '',
    aracTipi: '', // Yük Tipi yerine Araç Tipi
    kasaTipi: '', // Yeni alan
    telefon: '',
    aciklama: '',
    firmaAdi: ''
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        alert("Araç ilanı vermek için giriş yapmalısınız.");
        navigate('/giris');
      } else {
        setUser(currentUser);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

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

      // DİKKAT: Koleksiyon adı "araclar" oldu
      await addDoc(collection(db, "araclar"), {
  ...formData,
  tarih_eklenme: new Date(),
  ekleyen_id: user.uid,
  ekleyen_isim: gorunenIsim,
  ekleyen_foto: gorunenFoto,
  puan: 4.8,
  
  durum: 1 // <--- YENİ SATIR: 1 = Yayında (Aktif)
});
      
      alert("Araç ilanı başarıyla eklendi! 🚛");
      navigate('/araclar'); // Araç listesine yönlendir
    } catch (error) {
      console.error("Hata:", error);
      alert("Hata: " + error.message);
    } finally {
      setYukleniyor(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Renk temasını ayırt etmek için Mavi (Blue) yapalım */}
      <div className="bg-white p-8 rounded-lg shadow-lg border-t-4 border-blue-500">
        <h2 className="text-2xl font-bold mb-6 text-slate-800">
          Boş Araç İlanı Ver
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
           {/* Kurumsal Mod Alanı (Aynı) */}
           <div className="bg-slate-50 p-4 rounded border border-slate-200 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <input type="checkbox" id="kurumsalCheck" name="kurumsalMod" checked={kurumsalMod} onChange={handleChange} className="w-5 h-5 text-blue-500 rounded cursor-pointer" />
              <label htmlFor="kurumsalCheck" className="font-bold text-slate-700 cursor-pointer select-none">Firma Olarak Yayınla</label>
            </div>
            {kurumsalMod && (
              <input required={kurumsalMod} name="firmaAdi" onChange={handleChange} type="text" placeholder="Firma Ünvanı" className="w-full p-3 border border-blue-300 rounded outline-none bg-blue-50" />
            )}
          </div>

          {/* Form Alanları */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bulunduğu Yer</label>
              <input required name="nereden" onChange={handleChange} type="text" placeholder="Şehir/İlçe" className="w-full p-3 border rounded focus:border-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gidecegi Yer (Opsiyonel)</label>
              <input name="nereye" onChange={handleChange} type="text" placeholder="Farketmez / Şehir" className="w-full p-3 border rounded focus:border-blue-500 outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Müsaitlik Tarihi</label>
              <input required name="tarih" onChange={handleChange} type="date" className="w-full p-3 border rounded focus:border-blue-500 outline-none" />
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Araç Tipi</label>
              <select name="aracTipi" onChange={handleChange} className="...">
                <option value="">Seçiniz...</option>
                <option value="Tır">Tır</option>
                <option value="Kırkayak">Kırkayak</option>
                <option value="10 Teker">10 Teker</option>
                <option value="Kamyonet">Kamyonet</option>
                {/* YENİ EKLENEN */}
                <option value="Çekici / Kurtarıcı">Çekici / Kurtarıcı</option>
                {/* ------------ */}
              </select>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kasa/Dorse Tipi</label>
              <select name="kasaTipi" onChange={handleChange} className="...">
                <option value="">Seçiniz...</option>
                <option value="Tenteli">Tenteli</option>
                <option value="Frigo">Frigo (Soğuk Zincir)</option>
                <option value="Damperli">Damperli</option>
                <option value="Açık Kasa">Açık Kasa</option>
                <option value="Konteyner Taşıyıcı">Konteyner Taşıyıcı</option>
                {/* YENİ EKLENENLER */}
                <option value="Oto Taşıyıcı (Lohir)">Çoklu Oto Taşıyıcı (Lohr)</option>
                <option value="Tekli Kurtarıcı">Tekli Kurtarıcı (Kayar Kasa)</option>
               {/* ---------------- */}
              </select>
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">İletişim</label>
                <input required name="telefon" onChange={handleChange} type="tel" placeholder="0555..." className="w-full p-3 border rounded focus:border-blue-500 outline-none" />
             </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
             <textarea name="aciklama" onChange={handleChange} rows="3" className="w-full p-3 border rounded focus:border-blue-500 outline-none"></textarea>
          </div>

          <button disabled={yukleniyor} type="submit" className="w-full bg-blue-600 text-white font-bold py-4 rounded hover:bg-blue-700 transition shadow-lg mt-4 disabled:bg-gray-400">
            {yukleniyor ? 'Kaydediliyor...' : 'Aracı Yayınla 🚛'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AracEkle;