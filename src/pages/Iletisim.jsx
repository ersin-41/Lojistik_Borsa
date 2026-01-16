import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

const Iletisim = () => {
  const [yukleniyor, setYukleniyor] = useState(false);
  
  // Form verilerini tutacak state
  const [formData, setFormData] = useState({
    adSoyad: '',
    email: '',
    mesaj: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Sayfanın yenilenmesini engelle
    setYukleniyor(true);

    try {
      // Veritabanına kaydet
      await addDoc(collection(db, "iletisim_mesajlari"), {
        ...formData,
        tarih: new Date(), // Mesajın atıldığı tarih
        okundu: false      // Yönetim panelinde "Okunmadı" olarak görünsün diye
      });

      alert("Mesajınız başarıyla iletildi! En kısa sürede dönüş yapacağız. 🚀");
      
      // Formu temizle
      setFormData({ adSoyad: '', email: '', mesaj: '' });

    } catch (error) {
      console.error("Hata:", error);
      alert("Mesaj gönderilirken bir hata oluştu: " + error.message);
    } finally {
      setYukleniyor(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-800 mb-6">İletişim</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         {/* Sol Taraf: Adres Bilgileri */}
         <div className="bg-white p-6 rounded shadow border-l-4 border-yellow-500 h-fit">
            <h3 className="font-bold text-xl mb-4 text-slate-800">Merkez Ofis</h3>
            <div className="space-y-3 text-gray-600">
                <p className="flex items-center gap-2">
                    <span>📍</span> Sanayi Mahallesi, Lojistik Caddesi No:1 <br /> İzmit / Kocaeli
                </p>
                <p className="flex items-center gap-2">
                    <span>📞</span> 0850 123 45 67
                </p>
                <p className="flex items-center gap-2">
                    <span>✉️</span> <a href="mailto:info@lojistikborsa.com" className="text-blue-600 hover:underline">info@lojistikborsa.com</a>
                </p>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-100">
                <h4 className="font-bold text-sm text-slate-700 mb-2">Çalışma Saatleri</h4>
                <p className="text-sm text-gray-500">Hafta İçi: 09:00 - 18:00</p>
                <p className="text-sm text-gray-500">Cumartesi: 09:00 - 13:00</p>
            </div>
         </div>

         {/* Sağ Taraf: İletişim Formu */}
         <div className="bg-gray-50 p-6 rounded border border-gray-200">
            <h3 className="font-bold text-lg mb-4 text-slate-800">Bize Yazın</h3>
            <p className="text-gray-500 text-sm mb-4">Öneri, şikayet veya iş birliği talepleriniz için aşağıdaki formu doldurabilirsiniz.</p>
            
            <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                    <input 
                        required
                        name="adSoyad"
                        value={formData.adSoyad}
                        onChange={handleChange}
                        type="text" 
                        placeholder="Adınız Soyadınız" 
                        className="w-full p-3 border rounded outline-none focus:border-yellow-500 transition bg-white" 
                    />
                </div>
                <div>
                    <input 
                        required
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        type="email" 
                        placeholder="E-posta Adresiniz" 
                        className="w-full p-3 border rounded outline-none focus:border-yellow-500 transition bg-white" 
                    />
                </div>
                <div>
                    <textarea 
                        required
                        name="mesaj"
                        value={formData.mesaj}
                        onChange={handleChange}
                        placeholder="Mesajınız..." 
                        className="w-full p-3 border rounded outline-none focus:border-yellow-500 transition bg-white" 
                        rows="4"
                    ></textarea>
                </div>
                
                <button 
                    disabled={yukleniyor}
                    type="submit" 
                    className="bg-slate-800 text-white px-6 py-3 rounded font-bold w-full hover:bg-slate-700 transition disabled:bg-gray-400 flex items-center justify-center gap-2"
                >
                    {yukleniyor ? 'Gönderiliyor...' : 'Gönder 🚀'}
                </button>
            </form>
         </div>
      </div>
    </div>
  );
};

export default Iletisim;