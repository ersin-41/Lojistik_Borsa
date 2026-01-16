import React, { useState, useEffect } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';

const IlanEkle = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Kurumsal Mod Kontrolü (Checkbox için)
  const [kurumsalMod, setKurumsalMod] = useState(false);

  const [formData, setFormData] = useState({
    nereden: '',
    nereye: '',
    tarih: '',
    yukTipi: '',
    fiyat: '',
    telefon: '',
    aciklama: '',
    firmaAdi: '' // Yeni alan: Firma Ünvanı
  });

  const [yukleniyor, setYukleniyor] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        alert("İlan vermek için önce giriş yapmalısınız.");
        navigate('/giris');
      } else {
        setUser(currentUser);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    
    // Eğer checkbox değiştiyse state'i güncelle
    if (e.target.name === 'kurumsalMod') {
      setKurumsalMod(value);
    } else {
      setFormData({ ...formData, [e.target.name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setYukleniyor(true);

    try {
      // KARAR ANI: İsim ve Foto ne olacak?
      // Kurumsal ise: Formdaki firma adını al, fotoyu boş bırak (Bina ikonu çıksın diye)
      // Şahıs ise: Google adını ve fotosunu al.
      
      const gorunenIsim = kurumsalMod ? formData.firmaAdi : user.displayName;
      const gorunenFoto = kurumsalMod ? null : user.photoURL;

      // Eğer kurumsal seçili ama isim yazmamışsa uyar
      if (kurumsalMod && !formData.firmaAdi) {
        alert("Lütfen firma ünvanını giriniz.");
        setYukleniyor(false);
        return;
      }

      await addDoc(collection(db, "ilanlar"), {
      ...formData,
      tarih_eklenme: new Date(),
      ekleyen_id: user.uid,
      ekleyen_isim: gorunenIsim,
      ekleyen_foto: gorunenFoto,
      puan: 4.8,
  
      durum: 1 // <--- YENİ SATIR: 1 = Yayında (Aktif)
    });
      
      alert("İlan başarıyla eklendi! 🚛");
      navigate('/ilanlar');
    } catch (error) {
      console.error("Hata:", error);
      alert("Hata: " + error.message);
    } finally {
      setYukleniyor(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white p-8 rounded-lg shadow-lg border-t-4 border-yellow-500">
        <h2 className="text-2xl font-bold mb-6 text-slate-800">
          Yeni Yük İlanı Oluştur
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* --- YENİ ALAN: Kurumsal Seçimi --- */}
          <div className="bg-slate-50 p-4 rounded border border-slate-200 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <input 
                type="checkbox" 
                id="kurumsalCheck" 
                name="kurumsalMod"
                checked={kurumsalMod}
                onChange={handleChange}
                className="w-5 h-5 text-yellow-500 rounded focus:ring-yellow-500 cursor-pointer" 
              />
              <label htmlFor="kurumsalCheck" className="font-bold text-slate-700 cursor-pointer select-none">
                Bu ilanı Firma/Şirket olarak yayınla
              </label>
            </div>
            
            {/* Sadece kutucuk seçiliyse bu input açılır */}
            {kurumsalMod && (
              <div className="mt-2 animate-pulse-once">
                <input 
                  required={kurumsalMod} // Eğer seçiliyse zorunlu olsun
                  name="firmaAdi" 
                  onChange={handleChange} 
                  type="text" 
                  placeholder="Örn: Ersin Lojistik Ltd. Şti." 
                  className="w-full p-3 border border-yellow-300 rounded focus:border-yellow-500 outline-none bg-yellow-50" 
                />
                <p className="text-xs text-gray-500 mt-1">* Firma adı girildiğinde profil fotoğrafınız gizlenecektir.</p>
              </div>
            )}
          </div>
          {/* ---------------------------------- */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nereden</label>
              <input required name="nereden" onChange={handleChange} type="text" placeholder="Şehir/İlçe" className="w-full p-3 border rounded focus:border-yellow-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nereye</label>
              <input required name="nereye" onChange={handleChange} type="text" placeholder="Şehir/İlçe" className="w-full p-3 border rounded focus:border-yellow-500 outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Yükleme Tarihi</label>
              <input required name="tarih" onChange={handleChange} type="date" className="w-full p-3 border rounded focus:border-yellow-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fiyat (TL)</label>
              <input required name="fiyat" onChange={handleChange} type="number" placeholder="Örn: 25000" className="w-full p-3 border rounded focus:border-yellow-500 outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Yük Tipi</label>
              <select name="yukTipi" onChange={handleChange} className="...">
                <option value="">Seçiniz...</option>
                <option value="Paletli">Paletli Yük</option>
                <option value="Dökme">Dökme Yük</option>
                {/* YENİ EKLENEN */}
                <option value="Oto Taşıma">Oto Taşıma (Araç Lojistiği)</option> 
                {/* ------------ */}
                <option value="Konteyner">Konteyner</option>
                <option value="Evden Eve">Evden Eve</option>
                <option value="Frigo">Frigo (Soğuk Zincir)</option>
              </select>
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">İletişim Numarası</label>
                <input required name="telefon" onChange={handleChange} type="tel" placeholder="0555 123 45 67" className="w-full p-3 border rounded focus:border-yellow-500 outline-none" />
             </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
             <textarea name="aciklama" onChange={handleChange} rows="3" className="w-full p-3 border rounded focus:border-yellow-500 outline-none"></textarea>
          </div>

          <button 
            disabled={yukleniyor}
            type="submit" 
            className="w-full bg-slate-900 text-white font-bold py-4 rounded hover:bg-slate-800 transition shadow-lg mt-4 disabled:bg-gray-400">
            {yukleniyor ? 'Kaydediliyor...' : 'İlanı Yayınla 🚀'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default IlanEkle;