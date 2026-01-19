import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';

const IlanEkle = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [yukleniyor, setYukleniyor] = useState(false);

  // Form Verileri
  const [formData, setFormData] = useState({
    nereden: '',
    nereye: '',
    yuklemeTarihi: '',
    yukTipi: '',
    aracTipi: '',
    kasaTipi: '',
    tonaj: '',
    odemeSekli: 'Peşin',
    yuklemeAdresi: '',
    aciklama: ''
  });

  useEffect(() => {
    if (location.state) {
      // Gelen veride tarih/id gibi alanları temizle, sadece form alanlarını al
      const { id, tarih, ekleyen_id, ekleyen_ad, ekleyen_email, durum, ...digerVeriler } = location.state;
      setFormData(prev => ({ ...prev, ...digerVeriler }));
    }
  }, [location.state]);

  useEffect(() => {
    // Sayfa açılınca oturum kontrolü yap
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        // Kullanıcı yoksa uyarı ver ve giriş sayfasına at
        alert("İlan vermek için önce giriş yapmalısınız.");
        navigate('/giris');
      } else {
        setUser(currentUser);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // EKSTRA GÜVENLİK: Kullanıcı yoksa işlemi durdur
    if (!user) {
      alert("Oturum süreniz dolmuş veya giriş yapmamışsınız. Lütfen tekrar giriş yapın.");
      navigate('/giris');
      return;
    }

    setYukleniyor(true);

    try {
      await addDoc(collection(db, "ilanlar"), {
        ...formData,
        ekleyen_id: user.uid,
        ekleyen_ad: user.displayName || "İsimsiz Kullanıcı",
        ekleyen_email: user.email,
        durum: 'aktif',
        tarih: serverTimestamp()
      });

      // --- GENEL BİLDİRİM (DUYURU) OLUŞTUR ---
      try {
        // Sadece 'yeni ekleme' durumunda bildirim atıyoruz, düzenlemede değil
        await addDoc(collection(db, "duyurular"), {
          tur: 'duyuru',
          mesaj: `Yeni Yük İlanı: ${formData.nereden} ➝ ${formData.nereye}`,
          detay: `${formData.yukTipi} - ${formData.tonaj} Ton`,
          tarih: serverTimestamp(),
          ekleyen_id: user.uid,
          link: '/ilanlar' // Kullanıcı bildirime tıklayınca nereye gitsin?
        });
      } catch (err) {
        console.error("Bildirim oluşturulamadı:", err);
        // Bildirim hatası ana işlemi durdurmamalı
      }

      alert("İlanınız başarıyla yayınlandı! 🚛✅");
      navigate('/profilim');
    } catch (error) {
      console.error("Hata:", error);
      alert("Bir hata oluştu: " + error.message);
    } finally {
      setYukleniyor(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="bg-white p-8 rounded-lg shadow-lg border-t-4 border-yellow-500">

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-800">Yeni Yük İlanı Oluştur</h1>
          <p className="text-gray-500 mt-2">Adres bilgisi ekleyerek sürücülerin sizi kolayca bulmasını sağlayın.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* --- 1. BÖLÜM: ROTA VE ADRES (DÜZENLENDİ) --- */}
          <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
            <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2 text-lg">
              📍 Rota ve Konum Bilgileri
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* SOL SÜTUN: Rota Bilgileri */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Nereden (Çıkış)</label>
                  <input required name="nereden" onChange={handleChange} placeholder="Örn: İstanbul" className="w-full p-3 border rounded outline-none focus:border-yellow-500 bg-white shadow-sm" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Nereye (Varış)</label>
                  <input required name="nereye" onChange={handleChange} placeholder="Örn: Ankara" className="w-full p-3 border rounded outline-none focus:border-yellow-500 bg-white shadow-sm" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Yükleme Tarihi</label>
                  <input required type="date" name="yuklemeTarihi" onChange={handleChange} className="w-full p-3 border rounded outline-none focus:border-yellow-500 bg-white shadow-sm" />
                </div>
              </div>

              {/* SAĞ SÜTUN: Adres (Yüksekliği Eşitledik) */}
              <div className="flex flex-col">
                <label className="block text-sm font-bold text-gray-700 mb-1">Tam Yükleme Adresi (Konum İçin)</label>
                <textarea
                  name="yuklemeAdresi"
                  onChange={handleChange}
                  placeholder="Örn: Organize Sanayi Bölgesi, 5. Cadde No:12 (Fabrika arka kapısı)"
                  className="w-full p-3 border rounded outline-none focus:border-yellow-500 bg-white shadow-sm flex-grow resize-none h-40 md:h-auto"
                ></textarea>
                <p className="text-xs text-gray-500 mt-2">ℹ️ İpucu: Buraya yazdığınız adres, sürücüler için otomatik harita bağlantısı oluşturur.</p>
              </div>
            </div>
          </div>

          {/* --- 2. BÖLÜM: YÜK VE ARAÇ --- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Yük Tipi</label>
              <select name="yukTipi" onChange={handleChange} className="w-full p-3 border rounded outline-none focus:border-yellow-500 bg-white" required>
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
              <select name="aracTipi" onChange={handleChange} className="w-full p-3 border rounded outline-none focus:border-yellow-500 bg-white" required>
                <option value="">Seçiniz...</option>
                <option value="Tır">Tır (13.60)</option>
                <option value="Kırkayak">Kırkayak</option>
                <option value="On Teker">10 Teker</option>
                <option value="Kamyonet">Kamyonet</option>
                <option value="Panelvan">Panelvan</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Kasa Özelliği</label>
              {/* DÜZELTİLEN KISIM: Value değerlerini düzelttik */}
              <select name="kasaTipi" onChange={handleChange} className="w-full p-3 border rounded outline-none focus:border-yellow-500 bg-white" required>
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
              <label className="block text-sm font-bold text-gray-700 mb-1">Tonaj (Kg/Ton)</label>
              <input required type="number" name="tonaj" onChange={handleChange} placeholder="Örn: 25" className="w-full p-3 border rounded outline-none focus:border-yellow-500" />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Ödeme Şekli</label>
              <div className="flex gap-4 p-3 border rounded bg-slate-50">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="odemeSekli" value="Peşin" onChange={handleChange} defaultChecked />
                  <span className="font-medium">Peşin</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="odemeSekli" value="Vadeli" onChange={handleChange} />
                  <span className="font-medium">Vadeli</span>
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Açıklama / Notlar</label>
            <textarea required name="aciklama" rows="3" onChange={handleChange} placeholder="Yük hakkında özel notlar..." className="w-full p-3 border rounded outline-none focus:border-yellow-500"></textarea>
          </div>

          <button type="submit" disabled={yukleniyor} className="w-full bg-slate-900 text-white font-bold py-4 rounded hover:bg-slate-800 transition shadow-lg">
            {yukleniyor ? 'Yayınlanıyor...' : 'İlanı Yayınla 🚀'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default IlanEkle;