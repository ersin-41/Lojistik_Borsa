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
                  <div className="w-10 h-10 bg-[#1877F2] text-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 448 512">
                      <path d="M64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64h98.2V320h-61v-76h61V192c0-40.5 24.8-62.5 60.8-62.5 17.1 0 31.8 1.3 36.1 1.7v42.1h-24.8c-19.6 0-23.4 9.3-23.4 23v37.8h46.7l-6 76h-40.7v160H392c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64z" />
                    </svg>
                  </div>
                  <span className="text-xs text-slate-600 font-bold group-hover:text-[#1877F2]">Facebook</span>
                </a>

                <a
                  href="https://www.instagram.com/lojistik365/"
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-col items-center gap-1 group"
                >
                  <div className="w-10 h-10 bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 448 512">
                      <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z" />
                    </svg>
                  </div>
                  <span className="text-xs text-slate-600 font-bold group-hover:text-[#bc1888]">Instagram</span>
                </a>

                <a
                  href="https://www.linkedin.com/company/111431308/"
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-col items-center gap-1 group"
                >
                  <div className="w-10 h-10 bg-[#0077b5] text-white rounded-full flex items-center justify-center text-xl shadow-lg group-hover:scale-110 transition">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 448 512">
                      <path d="M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3c0-17.8-14.4-32.3-32-32.3zM135.4 416H69V202.2h66.5V416zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5zm282.1 243h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9V416z" />
                    </svg>
                  </div>
                  <span className="text-xs text-slate-600 font-bold group-hover:text-[#0077b5]">LinkedIn</span>
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