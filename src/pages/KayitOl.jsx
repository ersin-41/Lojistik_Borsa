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
  const [hata, setHata] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);

  // --- GOOGLE İLE KAYIT ---
  const googleGiris = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Kullanıcı veritabanında var mı kontrol et
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        // İlk kez giriyorsa veritabanına kaydet
        await setDoc(docRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          role: 'user', 
          createdAt: new Date()
        });

        // HOŞ GELDİN BİLDİRİMİ GÖNDER 🔔
        await bildirimGonder(
          user.uid,
          "Lojistik365 platformuna hoş geldiniz! 🎉 İlk yük veya araç ilanınızı hemen oluşturabilirsiniz.",
          "basari",
          "/ilan-ekle"
        );
      }
      
      navigate('/profilim');
    } catch (error) {
      console.error(error);
      setHata("Google ile kayıt olurken bir sorun oluştu: " + error.message);
    }
  };

  // --- E-POSTA İLE KAYIT ---
  const emailKayit = async (e) => {
    e.preventDefault();
    setHata('');
    setYukleniyor(true);
    
    if(password.length < 6) {
        setHata("Şifre en az 6 karakter olmalıdır.");
        setYukleniyor(false);
        return;
    }

    try {
      // 1. Kullanıcıyı oluştur
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Profil ismini güncelle (Auth tarafında)
      await updateProfile(user, {
        displayName: adSoyad
      });

      // 3. Veritabanına kaydet (Firestore)
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: adSoyad,
        photoURL: null, // E-posta ile kayıtta foto başta yoktur
        role: 'user',
        createdAt: new Date()
      });

      // 4. HOŞ GELDİN BİLDİRİMİ GÖNDER 🔔
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
        setHata("Bu e-posta adresi zaten kullanımda.");
      } else if (error.code === 'auth/invalid-email') {
        setHata("Geçersiz bir e-posta adresi girdiniz.");
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
        <form onSubmit={emailKayit} className="space-y-5">
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Ad Soyad / Firma Ünvanı</label>
                <input 
                  required 
                  type="text" 
                  onChange={(e) => setAdSoyad(e.target.value)} 
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition" 
                  placeholder="Örn: Yılmaz Nakliyat" 
                />
            </div>
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">E-Posta Adresi</label>
                <input 
                  required 
                  type="email" 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition" 
                  placeholder="ornek@sirket.com" 
                />
            </div>
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Şifre Oluştur</label>
                <input 
                  required 
                  type="password" 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition" 
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

        {/* AYIRAÇ */}
        <div className="my-8 flex items-center">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-3 text-gray-400 text-sm font-medium">veya</span>
            <div className="flex-1 border-t border-gray-300"></div>
        </div>

        {/* GOOGLE BUTONU */}
        <button 
          onClick={googleGiris}
          className="w-full bg-white border border-gray-300 text-slate-700 font-bold py-3 rounded flex items-center justify-center gap-3 hover:bg-gray-50 transition shadow-sm"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google Logo" />
          Google ile Devam Et
        </button>

        {/* ALT BİLGİ */}
        <p className="text-center mt-8 text-sm text-gray-600">
            Zaten bir hesabın var mı? <Link to="/giris" className="text-yellow-600 font-bold hover:text-yellow-700 hover:underline">Giriş Yap</Link>
        </p>
      </div>
    </div>
  );
};

export default KayitOl;