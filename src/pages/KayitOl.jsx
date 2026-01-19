import React, { useState } from 'react';
import { auth, provider, db } from '../firebase';
import { signInWithPopup, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { setDoc, doc, getDoc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import { bildirimGonder } from '../utils/bildirimService'; // Bildirim servisini import ettik

const KayitOl = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adSoyad, setAdSoyad] = useState('');
  const [telefon, setTelefon] = useState(''); // YENİ: Telefon State
  const [hata, setHata] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);

  // --- KAYIT OL FONKSİYONU ---
  const kayitOl = async (e) => {
    e.preventDefault();
    setHata('');
    setYukleniyor(true);

    if (password.length < 6) {
      setHata("Şifre en az 6 karakter olmalıdır.");
      setYukleniyor(false);
      return;
    }

    // Telefon kontrolü (Basit)
    if (!telefon || telefon.length < 10) {
      setHata("Lütfen geçerli bir telefon numarası giriniz.");
      setYukleniyor(false);
      return;
    }

    try {
      // E-posta opsiyonel mantığı:
      // Eğer e-posta girilmediyse, telefon numarasını e-posta gibi kullan: 5551234567@lojistik365.com
      // Bu sayede Firebase Auth E-posta/Şifre altyapısını bozmadan telefonla giriş imkanı sağlarız.
      let kayitEmail = email;
      if (!kayitEmail) {
        // Boşlukları ve özel karakterleri temizle
        const temizTel = telefon.replace(/\D/g, '');
        kayitEmail = `${temizTel}@lojistik365.com`;
      }

      // 1. Kullanıcıyı oluştur
      const userCredential = await createUserWithEmailAndPassword(auth, kayitEmail, password);
      const user = userCredential.user;

      // 2. Profil ismini güncelle
      await updateProfile(user, {
        displayName: adSoyad
      });

      // 3. Veritabanına kaydet
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: kayitEmail, // Oluşturulan veya girilen e-posta
        telefon: telefon,  // YENİ: Telefonu kaydet
        displayName: adSoyad,
        photoURL: null,
        role: 'user',
        createdAt: new Date(),
        epostaGizli: !email // Eğer kullanıcı e-posta girmediyse, sistem tarafından oluşturulduğunu işaretleyebiliriz (opsiyonel)
      });

      // 4. Bildirim Gönder
      await bildirimGonder(
        user.uid,
        "Lojistik365 ailesine hoş geldiniz! 🚛 Profilinizi tamamlayarak ilan vermeye başlayabilirsiniz.",
        "basari",
        "/profilim"
      );

      navigate('/profilim');

    } catch (error) {
      console.error(error);
      if (error.code === 'auth/email-already-in-use') {
        setHata("Bu e-posta veya telefon numarası zaten kayıtlı.");
      } else if (error.code === 'auth/invalid-email') {
        setHata("Geçersiz e-posta formatı.");
      } else {
        setHata("Kayıt olurken bir hata oluştu: " + error.message);
      }
    } finally {
      setYukleniyor(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4 py-12">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">

        {/* LOGO ALANI */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
            Lojistik<span className="text-yellow-500">365</span>
          </h1>
          <p className="text-gray-500 mt-2 text-sm">Türkiye'nin Dijital Lojistik Ağına Katılın</p>
        </div>

        {/* HATA MESAJI KUTUSU */}
        {hata && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-6 text-sm flex items-start gap-2">
            <span>⚠️</span>
            <span>{hata}</span>
          </div>
        )}

        {/* FORM BAŞLANGICI */}
        <form onSubmit={kayitOl} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Ad Soyad / Firma Ünvanı <span className="text-red-500">*</span></label>
            <input
              required
              type="text"
              value={adSoyad}
              onChange={(e) => setAdSoyad(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-yellow-500 outline-none transition"
              placeholder="Örn: Yılmaz Nakliyat"
            />
          </div>

          {/* TELEFON (ZORUNLU) */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Cep Telefonu <span className="text-red-500">*</span></label>
            <input
              required
              type="tel"
              value={telefon}
              onChange={(e) => setTelefon(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-yellow-500 outline-none transition"
              placeholder="05XX XXX XX XX"
            />
          </div>

          {/* E-POSTA (OPSİYONEL) */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">E-Posta Adresi <span className="text-gray-400 font-normal">(Opsiyonel)</span></label>
            <input

              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-yellow-500 outline-none transition"
              placeholder="varsa@eposta.com"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Şifre Oluştur <span className="text-red-500">*</span></label>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-yellow-500 outline-none transition"
              placeholder="En az 6 karakter"
            />
          </div>

          <button
            type="submit"
            disabled={yukleniyor}
            className="w-full bg-slate-900 text-white font-bold py-3 rounded hover:bg-slate-800 transition shadow-lg transform active:scale-95 disabled:bg-gray-400"
          >
            {yukleniyor ? 'Hesap Oluşturuluyor...' : 'Ücretsiz Kayıt Ol'}
          </button>
        </form>

        {/* GOOGLE VEYA ÇİZGİSİNİ KALDIRDIK. SADECE GİRİŞ YAP LINKI KALDI */}

        <p className="text-center mt-8 text-sm text-gray-600">
          Zaten bir hesabın var mı? <Link to="/giris" className="text-yellow-600 font-bold hover:text-yellow-700 hover:underline">Giriş Yap</Link>
        </p>
      </div>
    </div>
  );
};

export default KayitOl;