import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore'; // updateDoc ve getDoc önemli
import { useNavigate, useParams } from 'react-router-dom'; // useParams ID'yi almak için
import { onAuthStateChanged } from 'firebase/auth';

const IlanDuzenle = () => {
  const { id } = useParams(); // URL'den ilan ID'sini al (örn: /ilan-duzenle/ABC1234)
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [veriGeldi, setVeriGeldi] = useState(false);

  // Form Verileri
  const [formData, setFormData] = useState({
    nereden: '',
    nereye: '',
    yuklemeTarihi: '',
    yukTipi: '',
    aracTipi: '',
    kasaTipi: '',
    tonaj: '',
    odemeSekli: '',
    yuklemeAdresi: '',
    aciklama: ''
  });

  useEffect(() => {
    // 1. Kullanıcı Kontrolü
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        alert("Yetkisiz erişim.");
        navigate('/giris');
      } else {
        setUser(currentUser);
        verileriGetir(currentUser.uid); // Kullanıcı geldikten sonra veriyi çek
      }
    });
    return () => unsubscribe();
  }, [navigate, id]);

  // 2. Mevcut İlan Verilerini Çek
  const verileriGetir = async (userId) => {
    try {
      const docRef = doc(db, "ilanlar", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        
        // Güvenlik: Başkasının ilanını düzenlemeye çalışıyor mu?
        if (data.ekleyen_id !== userId) {
            alert("Bu ilanı düzenleme yetkiniz yok!");
            navigate('/profilim');
            return;
        }

        setFormData(data); // Formu eski verilerle doldur
        setVeriGeldi(true);
      } else {
        alert("İlan bulunamadı!");
        navigate('/profilim');
      }
    } catch (error) {
      console.error("Hata:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setYukleniyor(true);

    try {
      const docRef = doc(db, "ilanlar", id);
      // Sadece formdaki alanları güncelle (tarih, ekleyen_id vs. değişmemeli)
      await updateDoc(docRef, {
        nereden: formData.nereden,
        nereye: formData.nereye,
        yuklemeTarihi: formData.yuklemeTarihi,
        yukTipi: formData.yukTipi,
        aracTipi: formData.aracTipi,
        kasaTipi: formData.kasaTipi,
        tonaj: formData.tonaj,
        odemeSekli: formData.odemeSekli,
        yuklemeAdresi: formData.yuklemeAdresi,
        aciklama: formData.aciklama,
        guncellemeTarihi: new Date() // Güncellenme zamanını not düşelim
      });

      alert("İlan başarıyla güncellendi! ✅");
      navigate('/profilim');
    } catch (error) {
      console.error("Güncelleme hatası:", error);
      alert("Hata: " + error.message);
    } finally {
      setYukleniyor(false);
    }
  };

  if (!veriGeldi) return <div className="text-center mt-20">Veriler yükleniyor...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="bg-white p-8 rounded-lg shadow-lg border-t-4 border-blue-500">
        
        <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-slate-800">İlanı Düzenle ✏️</h1>
            <p className="text-gray-500 mt-2">Bilgileri güncelleyip yeniden yayınlayın.</p>
        </div>

        <form onSubmit={handleUpdate} className="space-y-6">
          
          {/* ROTA VE ADRES */}
          <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
            <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2 text-lg">📍 Rota ve Konum</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Nereden</label>
                        <input required name="nereden" value={formData.nereden} onChange={handleChange} className="w-full p-3 border rounded outline-none focus:border-blue-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Nereye</label>
                        <input required name="nereye" value={formData.nereye} onChange={handleChange} className="w-full p-3 border rounded outline-none focus:border-blue-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Tarih</label>
                        <input required type="date" name="yuklemeTarihi" value={formData.yuklemeTarihi} onChange={handleChange} className="w-full p-3 border rounded outline-none focus:border-blue-500" />
                    </div>
                </div>
                <div className="flex flex-col">
                    <label className="block text-sm font-bold text-gray-700 mb-1">Yükleme Adresi</label>
                    <textarea name="yuklemeAdresi" value={formData.yuklemeAdresi} onChange={handleChange} className="w-full p-3 border rounded outline-none focus:border-blue-500 flex-grow resize-none h-40 md:h-auto"></textarea>
                </div>
            </div>
          </div>

          {/* DETAYLAR (Select box'lar) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Yük Tipi</label>
                  <select name="yukTipi" value={formData.yukTipi} onChange={handleChange} className="w-full p-3 border rounded outline-none focus:border-blue-500 bg-white" required>
                      <option value="">Seçiniz...</option>
                      <option value="Paletli">Paletli</option>
                      <option value="Dökme">Dökme</option>
                      <option value="Makine">Makine</option>
                      <option value="Ev Eşyası">Ev Eşyası</option>
                      <option value="Koli/Kutu">Koli / Kutu</option>
                  </select>
               </div>
               <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Araç Tipi</label>
                  <select name="aracTipi" value={formData.aracTipi} onChange={handleChange} className="w-full p-3 border rounded outline-none focus:border-blue-500 bg-white" required>
                      <option value="">Seçiniz...</option>
                      <option value="Tır">Tır (13.60)</option>
                      <option value="Kırkayak">Kırkayak</option>
                      <option value="On Teker">10 Teker</option>
                      <option value="Kamyonet">Kamyonet</option>
                      <option value="Panelvan">Panelvan</option>
                  </select>
               </div>
               <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Kasa Tipi</label>
                  <select name="kasaTipi" value={formData.kasaTipi} onChange={handleChange} className="w-full p-3 border rounded outline-none focus:border-blue-500 bg-white" required>
                        <option value="">Seçiniz...</option> 
                        <option value="Standart">Standart / Tenteli</option>
                        <option value="Frigo">Frigo (Soğutuculu)</option>
                        <option value="Damperli">Damperli</option>
                        <option value="Tanker">Tanker (SRC 5)</option>
                        <option value="Silobas">Silobas</option>
                        <option value="Acik">Açık Kasa</option>
                   </select>
               </div>
          </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                   <label className="block text-sm font-bold text-gray-700 mb-1">Tonaj</label>
                   <input required type="number" name="tonaj" value={formData.tonaj} onChange={handleChange} className="w-full p-3 border rounded outline-none focus:border-blue-500" />
               </div>
               
               <div>
                 <label className="block text-sm font-bold text-gray-700 mb-1">Ödeme Şekli</label>
                 <div className="flex gap-4 p-3 border rounded bg-slate-50">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="odemeSekli" value="Peşin" onChange={handleChange} checked={formData.odemeSekli === 'Peşin'} /> 
                        <span className="font-medium">Peşin</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="odemeSekli" value="Vadeli" onChange={handleChange} checked={formData.odemeSekli === 'Vadeli'} /> 
                        <span className="font-medium">Vadeli</span>
                    </label>
                 </div>
              </div>
           </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Açıklama</label>
            <textarea required name="aciklama" value={formData.aciklama} rows="3" onChange={handleChange} className="w-full p-3 border rounded outline-none focus:border-blue-500"></textarea>
          </div>

          <div className="flex gap-4">
            <button type="button" onClick={() => navigate('/profilim')} className="w-1/3 bg-gray-200 text-gray-700 font-bold py-4 rounded hover:bg-gray-300 transition">
                İptal
            </button>
            <button type="submit" disabled={yukleniyor} className="w-2/3 bg-blue-600 text-white font-bold py-4 rounded hover:bg-blue-700 transition shadow-lg">
                {yukleniyor ? 'Güncelleniyor...' : 'Değişiklikleri Kaydet 💾'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IlanDuzenle;