import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';

const TeklifModal = ({ ilan, kapat, user }) => {
  const [fiyat, setFiyat] = useState('');
  const [aciklama, setAciklama] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);

  // Kullanıcı detaylarını çekmek için import
  // (Import yukarı taşındı)

  const teklifGonder = async (e) => {
    e.preventDefault();
    if (!fiyat) return alert("Lütfen bir fiyat giriniz.");

    setYukleniyor(true);
    try {
      // 1. Kullanıcının güncel telefon/isim bilgilerini 'users' koleksiyonundan al
      // Auth profilinde telefon olmayabilir, veritabanından garantiye alalım.
      let telefon = "";
      let adSoyad = user.displayName || "Kullanıcı";

      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          telefon = userData.telefon || "";
          // Auth'da isim yoksa db'den al
          if (!adSoyad || adSoyad === "Kullanıcı") {
            adSoyad = userData.displayName || "İsimsiz Kullanıcı";
          }
        }
      } catch (err) {
        console.error("Kullanıcı detayları alınamadı:", err);
      }

      await addDoc(collection(db, "teklifler"), {
        ilanId: ilan.id,
        ilanBaslik: `${ilan.nereden} - ${ilan.nereye}`,
        ilanSahibiId: ilan.ekleyen_id,
        teklifVerenId: user.uid,
        teklifVerenAd: adSoyad,
        teklifVerenTel: telefon, // Artık db'den gelen doğru telefon
        fiyat: Number(fiyat),
        aciklama: aciklama,
        durum: 'bekliyor', // bekliyor, onaylandi, reddedildi
        tarih: serverTimestamp()
      });

      // İLAN SAHİBİNE BİLDİRİM GÖNDER
      await addDoc(collection(db, "bildirimler"), {
        userId: ilan.ekleyen_id, // Bildirim kime gidecek?
        mesaj: `"${ilan.nereden} -> ${ilan.nereye}" ilanınıza ${Number(fiyat)} TL teklif geldi! 💰`,
        link: `/ilan/${ilan.id}`,
        tarih: serverTimestamp(),
        okundu: false,
        tip: 'bilgi',
        tur: 'kisisel' // Silme işlemi için tür belirtmek önemli!
      });

      alert("Teklifiniz başarıyla gönderildi! 📨");
      kapat();
    } catch (error) {
      console.error("Teklif hatası:", error);
      alert("Bir hata oluştu: " + error.message);
    } finally {
      setYukleniyor(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden relative animate-fade-in-up">

        {/* Başlık */}
        <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
          <h3 className="font-bold text-lg">Teklif Ver</h3>
          <button onClick={kapat} className="text-gray-300 hover:text-white text-2xl">&times;</button>
        </div>

        {/* Form */}
        <div className="p-6">
          <div className="mb-4 bg-yellow-50 p-3 rounded border border-yellow-200 text-sm text-yellow-800">
            <strong>{ilan.nereden} ➜ {ilan.nereye}</strong><br />
            ilanı için teklif veriyorsunuz.
          </div>

          <form onSubmit={teklifGonder} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-bold mb-1">Teklifiniz (TL)</label>
              <div className="relative">
                <input
                  type="number"
                  value={fiyat}
                  onChange={(e) => setFiyat(e.target.value)}
                  className="w-full p-3 border rounded outline-none focus:border-yellow-500 pl-10 text-lg font-bold"
                  placeholder="0"
                  required
                />
                <span className="absolute left-3 top-3.5 text-gray-500">₺</span>
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-1">Notunuz / Açıklama</label>
              <textarea
                rows="3"
                value={aciklama}
                onChange={(e) => setAciklama(e.target.value)}
                className="w-full p-3 border rounded outline-none focus:border-yellow-500"
                placeholder="Örn: KDV dahildir, yarın yükleyebilirim..."
              ></textarea>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={kapat}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded font-bold hover:bg-gray-200 transition"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={yukleniyor}
                className="flex-1 bg-yellow-500 text-slate-900 py-3 rounded font-bold hover:bg-yellow-400 transition shadow-md disabled:bg-gray-300"
              >
                {yukleniyor ? 'Gönderiliyor...' : 'Teklifi Gönder 🚀'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TeklifModal;