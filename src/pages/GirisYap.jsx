import React, { useState } from 'react';
import { auth, provider, db } from '../firebase';
import { signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';



const GirisYap = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hata, setHata] = useState('');

  // --- GOOGLE GİRİŞ ---
  // --- E-POSTA / TELEFON GİRİŞ ---
  const girisYap = async (e) => {
    e.preventDefault();
    setHata('');

    let girisDegeri = email;
    // Eğer girilen değer sadece rakamlardan oluşuyorsa (telefon)
    // 1. Önce Firestore'da bu telefona sahip kullanıcı var mı diye bak
    // 2. Varsa onun gerçek emailini al
    // 3. Yoksa eski usul dummy email dene
    if (!girisDegeri.includes('@')) {
      const temizTel = girisDegeri.replace(/\D/g, '');

      try {
        const q = query(collection(db, "users"), where("telefon", "==", temizTel));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          // Kullanıcı bulundu, gerçek emailini al
          const userDoc = querySnapshot.docs[0].data();
          girisDegeri = userDoc.email;
        } else {
          // Firestore'da bulunamadı, eski dummy mantığı ile devam et
          if (temizTel.length >= 10) {
            girisDegeri = `${temizTel}@lojistik365.com`;
          }
        }
      } catch (err) {
        console.error("Telefon sorgu hatası:", err);
        // Hata durumunda da dummy dene, belki çalışır
        if (temizTel.length >= 10) {
          girisDegeri = `${temizTel}@lojistik365.com`;
        }
      }
    }

    try {
      await signInWithEmailAndPassword(auth, girisDegeri, password);
      navigate('/profilim');
    } catch (error) {
      console.error(error);
      setHata("Giriş bilgileri hatalı. Lütfen telefon/e-posta ve şifrenizi kontrol edin.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-slate-800">Lojistik<span className="text-yellow-500">365</span></h1>
          <p className="text-gray-500 mt-2">Tekrar hoş geldiniz!</p>
          <SeoManager title="Giriş Yap" description="Lojistik365 üye girişi." />
        </div>

        {hata && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm font-bold border border-red-200">⚠️ {hata}</div>}

        <form onSubmit={girisYap} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700">E-Posta veya Telefon</label>
            <input
              required
              type="text"
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border rounded outline-none focus:border-yellow-500 bg-slate-50 focus:bg-white transition"
              placeholder="05XX... veya ornek@mail.com"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700">Şifre</label>
            <input
              required
              type="password"
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border rounded outline-none focus:border-yellow-500 bg-slate-50 focus:bg-white transition"
              placeholder="******"
            />
          </div>
          <div className="flex justify-end">
            <Link to="/sifremi-unuttum" className="text-sm text-yellow-600 hover:text-yellow-700 font-medium hover:underline">
              Şifremi Unuttum?
            </Link>
          </div>
          <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3 rounded hover:bg-slate-800 transition shadow-lg transform active:scale-95">
            Giriş Yap
          </button>
        </form>

        {/* AYIRAÇ VE GOOGLE BUTONU KALDIRILDI */}


        <p className="text-center mt-6 text-sm text-gray-600">
          Hesabın yok mu? <Link to="/kayit" className="text-yellow-600 font-bold hover:underline">Kayıt Ol</Link>
        </p>
      </div>
    </div>
  );
};

export default GirisYap;