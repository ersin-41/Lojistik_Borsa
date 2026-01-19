import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { useNavigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';

const SurucuIsAramaEkle = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [duzenlemeModu, setDuzenlemeModu] = useState(false);
  const [duzenlenecekId, setDuzenlenecekId] = useState(null);

  const [formData, setFormData] = useState({
    adSoyad: '',
    ehliyet: '',
    tecrube: '',
    telefon: '',
    aciklama: ''
  });

  useEffect(() => {
    if (location.state) {
      const { id, tarih, ekleyen_id, ekleyen_email, ...gelenVeri } = location.state;
      setFormData(gelenVeri);
      setDuzenlenecekId(id);
      setDuzenlemeModu(true);
    }

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
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    try {
      if (duzenlemeModu && duzenlenecekId) {
        // GÜNCELLEME
        await updateDoc(doc(db, "surucu_is_arama", duzenlenecekId), {
          ...formData,
          ekleyen_id: user.uid,
          ekleyen_email: user.email
        });
        alert("Profiliniz güncellendi! ✅");
      } else {
        // YENİ EKLEME
        await addDoc(collection(db, "surucu_is_arama"), {
          ...formData,
          tarih: new Date(),
          ekleyen_id: user.uid,
          ekleyen_email: user.email
        });
        alert("Profiliniz oluşturuldu! İşverenler size ulaşabilir. 📄");
      }

      navigate('/profilim');
    } catch (error) {
      console.error("Hata:", error);
      alert("Bir hata oluştu: " + error.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 relative">
      <button
        onClick={() => navigate('/profilim')}
        className="absolute top-8 right-6 text-gray-500 hover:text-gray-700 font-medium"
      >
        ⬅️ Geri Dön
      </button>
      <h1 className="text-3xl font-bold text-slate-800 mb-6 border-l-4 border-yellow-500 pl-4">
        {duzenlemeModu ? "Profilimi Düzenle" : "Sürücü İş İlanı Oluştur"}
      </h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">

        <div>
          <label className="block text-gray-700 font-bold mb-2">Adınız Soyadınız</label>
          <input required name="adSoyad" value={formData.adSoyad} onChange={handleChange} placeholder="Ahmet Yılmaz" className="w-full p-3 border rounded outline-none focus:border-yellow-500" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-bold mb-2">Ehliyet / Belge Sınıfı</label>
            {/* --- GÜNCELLENEN KISIM: SRC 5 VE TANKER EKLENDİ --- */}
            <select name="ehliyet" value={formData.ehliyet} onChange={handleChange} className="w-full p-3 border rounded outline-none focus:border-yellow-500 bg-white">
              <option value="">Seçiniz</option>
              <option value="C Sınıfı (Kamyon)">C Sınıfı (Kamyon)</option>
              <option value="CE Sınıfı (Tır)">CE Sınıfı (Tır)</option>
              <option value="D Sınıfı (Otobüs)">D Sınıfı (Otobüs)</option>
              <option value="SRC 5 (ADR - Tanker)">🔥 SRC 5 (ADR - Tanker)</option>
              <option value="Silobas Operatörü">🏗️ Silobas Operatörü</option>
              <option value="Mikser / Pompa">Concrete / Mikser</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 font-bold mb-2">Tecrübe (Yıl)</label>
            <input required name="tecrube" value={formData.tecrube} type="number" onChange={handleChange} placeholder="Örn: 5" className="w-full p-3 border rounded outline-none focus:border-yellow-500" />
          </div>
        </div>

        <div>
          <label className="block text-gray-700 font-bold mb-2">Telefon Numaranız</label>
          <input required name="telefon" value={formData.telefon} type="tel" onChange={handleChange} placeholder="05XX XXX XX XX" className="w-full p-3 border rounded outline-none focus:border-yellow-500" />
        </div>

        <div>
          <label className="block text-gray-700 font-bold mb-2">Kendinizi Tanıtın</label>
          <textarea required name="aciklama" value={formData.aciklama} rows="4" onChange={handleChange} placeholder="Hangi araçları kullandınız? Tanker, Silobas tecrübeniz var mı?" className="w-full p-3 border rounded outline-none focus:border-yellow-500"></textarea>
        </div>

        <button type="submit" className="w-full bg-slate-900 text-white font-bold py-4 rounded hover:bg-slate-800 transition">
          İlanı Yayınla 📄
        </button>
      </form>
    </div>
  );
};

export default SurucuIsAramaEkle;