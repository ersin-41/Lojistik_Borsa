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
          <h3 className="font-bold text-xl mb-4 text-slate-800">İletişim Kanalları</h3>

          <div className="bg-blue-50 border border-blue-200 p-3 rounded mb-6 text-sm text-blue-800">
            ℹ️ <strong>Bilgilendirme:</strong> Fiziksel bir ofisimiz bulunmamaktadır tüm süreçlerimizi dijital olarak yürütmekteyiz. Size en hızlı desteği WhatsApp hattımız üzerinden sunuyoruz.
          </div>

          <div className="space-y-4 text-gray-600">

            {/* WHATSAPP */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 flex items-center justify-center bg-green-500 rounded-full text-white shadow-lg shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" />
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 border-b border-gray-100 pb-1 mb-1">WhatsApp Destek Hattı</h4>
                <a
                  href="https://wa.me/905387679195"
                  target="_blank"
                  rel="noreferrer"
                  className="text-green-600 font-bold text-lg hover:underline flex items-center gap-1"
                >
                  0538 767 91 95
                  <span className="bg-green-100 text-green-800 text-[10px] px-2 py-0.5 rounded-full ml-2">7/24 Online</span>
                </a>
                <p className="text-xs text-gray-400 mt-1">Öneri, şikayet ve reklam işbirlikleri için yazabilirsiniz.</p>
              </div>
            </div>

            {/* EMAIL */}
            <div className="flex items-start gap-3 pt-2">
              <span className="text-2xl">✉️</span>
              <div>
                <h4 className="font-bold text-slate-900 border-b border-gray-100 pb-1 mb-1">E-Posta</h4>
                <a href="mailto:info@lojistik365.com.tr" className="text-blue-600 hover:underline font-medium">info@lojistik365.com.tr</a>
              </div>
            </div>

            {/* SOSYAL MEDYA */}
            <div className="pt-4 border-t border-gray-100 mt-4">
              <h4 className="font-bold text-slate-900 mb-3 text-sm">Sosyal Medya Hesaplarımız</h4>
              <div className="flex gap-4">
                <a
                  href="https://www.facebook.com/profile.php?id=61587067018884"
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-col items-center gap-1 group"
                >
                  <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center border border-slate-600 group-hover:border-yellow-500 transition shadow-lg group-hover:scale-110">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="white" viewBox="0 0 16 16">
                      <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z" />
                    </svg>
                  </div>
                  <span className="text-xs text-slate-600 font-bold group-hover:text-black">Facebook</span>
                </a>

                <a
                  href="https://www.instagram.com/lojistik365/"
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-col items-center gap-1 group"
                >
                  <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center border border-slate-600 group-hover:border-yellow-500 transition shadow-lg group-hover:scale-110">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="white" viewBox="0 0 16 16">
                      <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.281.11-.705.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.232-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z" />
                    </svg>
                  </div>
                  <span className="text-xs text-slate-600 font-bold group-hover:text-pink-600">Instagram</span>
                </a>
              </div>
            </div>

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