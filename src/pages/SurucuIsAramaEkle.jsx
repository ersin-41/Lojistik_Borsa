import React, { useState, useEffect } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';

const SurucuIsAramaEkle = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [yukleniyor, setYukleniyor] = useState(false);

  // Form verileri: Referans alanlarını buraya ekledik
  const [formData, setFormData] = useState({
    adSoyad: '',
    sehir: '',
    ehliyet: '',
    tecrubeYili: '',
    arananIs: '',
    calismaTercihi: '',
    telefon: '',
    email: '',           // Opsiyonel
    referansAdSoyad: '', // Zorunlu
    referansTel: '',     // Zorunlu
    aciklama: ''
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        alert("İlan vermek için giriş yapmalısınız.");
        navigate('/giris');
      } else {
        setUser(currentUser);
        // Kullanıcı adını otomatik çek
        setFormData(prev => ({ ...prev, adSoyad: currentUser.displayName || '' }));
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setYukleniyor(true);

    try {
      await addDoc(collection(db, "surucu_is_arama"), {
        ...formData,
        tarih_eklenme: new Date(),
        ekleyen_id: user.uid,
        ekleyen_foto: user.photoURL
      });
      
      alert("İş arama kaydınız başarıyla oluşturuldu! 🍀");
      navigate('/surucu-is-arayanlar');
    } catch (error) {
      console.error("Hata:", error);
      alert("Hata: " + error.message);
    } finally {
      setYukleniyor(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white p-8 rounded-lg shadow-lg border-t-4 border-red-500">
        <h2 className="text-2xl font-bold mb-6 text-slate-800">
          Sürücü İş Arama Kaydı Oluştur
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adınız Soyadınız</label>
              <input required name="adSoyad" value={formData.adSoyad} onChange={handleChange} type="text" className="w-full p-3 border rounded focus:border-red-500 outline-none bg-gray-50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bulunduğunuz Şehir</label>
              <input required name="sehir" onChange={handleChange} type="text" className="w-full p-3 border rounded focus:border-red-500 outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sahip Olduğunuz Ehliyet</label>
                <select name="ehliyet" onChange={handleChange} className="w-full p-3 border rounded focus:border-red-500 outline-none bg-white">
                  <option value="">Seçiniz...</option>
                  <option value="CE Sınıfı (Tır)">CE Sınıfı (Tır)</option>
                  <option value="C Sınıfı (Kamyon)">C Sınıfı (Kamyon)</option>
                  <option value="B Sınıfı (Kamyonet)">B Sınıfı (Kamyonet)</option>
                </select>
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tecrübe (Yıl)</label>
                <input required name="tecrubeYili" onChange={handleChange} type="number" placeholder="Örn: 5" className="w-full p-3 border rounded focus:border-red-500 outline-none" />
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Aradığınız İş Türü</label>
                <input required name="arananIs" onChange={handleChange} type="text" placeholder="Örn: Tır Şoförlüğü" className="w-full p-3 border rounded focus:border-red-500 outline-none" />
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Çalışma Tercihi</label>
                 <select name="calismaTercihi" onChange={handleChange} className="w-full p-3 border rounded focus:border-red-500 outline-none bg-white">
                  <option value="">Seçiniz...</option>
                  <option value="Yurtiçi">Yurtiçi</option>
                  <option value="Uluslararası">Uluslararası</option>
                  <option value="Şehir İçi">Şehir İçi</option>
                </select>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefon Numaranız</label>
                <input required name="telefon" onChange={handleChange} type="tel" placeholder="0555..." className="w-full p-3 border rounded focus:border-red-500 outline-none" />
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-posta (Opsiyonel)</label>
                {/* REQUIRED kaldırıldı - İsteğe Bağlı */}
                <input name="email" onChange={handleChange} type="email" placeholder="ornek@mail.com" className="w-full p-3 border rounded focus:border-red-500 outline-none" />
             </div>
          </div>

          {/* --- REFERANS BÖLÜMÜ (YENİDEN EKLENDİ) --- */}
          <div className="bg-red-50 p-4 rounded border border-red-200 mt-2">
            <h3 className="font-bold text-red-800 mb-3 text-sm uppercase flex items-center gap-2">
              📋 Referans Bilgileri <span className="text-xs font-normal text-red-600">(Zorunlu)</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Referans Adı Soyadı</label>
                    <input required name="referansAdSoyad" onChange={handleChange} type="text" className="w-full p-3 border rounded focus:border-red-500 outline-none bg-white" placeholder="Örn: Eski Patronum Ali Bey" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Referans Telefonu</label>
                    <input required name="referansTel" onChange={handleChange} type="tel" className="w-full p-3 border rounded focus:border-red-500 outline-none bg-white" placeholder="05XX..." />
                </div>
            </div>
          </div>
          {/* ----------------------------------------- */}

          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Kendinizden Bahsedin</label>
             <textarea name="aciklama" onChange={handleChange} rows="3" className="w-full p-3 border rounded focus:border-red-500 outline-none" placeholder="SRC, Psikoteknik belgelerim tam, uzun yol tecrübem var..."></textarea>
          </div>

          <button disabled={yukleniyor} type="submit" className="w-full bg-red-600 text-white font-bold py-4 rounded hover:bg-red-700 transition shadow-lg mt-4 disabled:bg-gray-400">
            {yukleniyor ? 'Kaydediliyor...' : 'İş Arama Kaydını Yayınla 🚀'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SurucuIsAramaEkle;