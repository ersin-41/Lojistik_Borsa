import React, { useState } from 'react';
import { auth, provider, db } from '../firebase';
import { signInWithPopup, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { setDoc, doc, getDoc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';

const KayitOl = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adSoyad, setAdSoyad] = useState('');
  const [hata, setHata] = useState('');

  // --- GOOGLE İLE KAYIT ---
  const googleGiris = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Kullanıcı veritabanında var mı kontrol et
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        await setDoc(docRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          role: 'user', 
          createdAt: new Date()
        });
      }
      navigate('/profilim');
    } catch (error) {
      setHata(error.message);
    }
  };

  // --- E-POSTA İLE KAYIT ---
  const emailKayit = async (e) => {
    e.preventDefault();
    setHata('');
    
    if(password.length < 6) {
        setHata("Şifre en az 6 karakter olmalıdır.");
        return;
    }

    try {
      // 1. Kullanıcıyı oluştur
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Profil ismini güncelle (Firebase Auth içinde)
      await updateProfile(user, {
        displayName: adSoyad
      });

      // 3. Veritabanına kaydet
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: adSoyad, // Formdan gelen isim
        photoURL: null,
        role: 'user',
        createdAt: new Date()
      });

      navigate('/profilim');

    } catch (error) {
      console.error(error);
      if (error.code === 'auth/email-already-in-use') {
        setHata("Bu e-posta adresi zaten kullanımda.");
      } else {
        setHata("Kayıt olurken bir hata oluştu: " + error.message);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-slate-800">Lojistik<span className="text-yellow-500">365</span></h1>
            <p className="text-gray-500 mt-2">Hemen ücretsiz hesabını oluştur.</p>
        </div>

        {hata && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{hata}</div>}

        {/* --- KLASİK FORM --- */}
        <form onSubmit={emailKayit} className="space-y-4">
            <div>
                <label className="block text-sm font-bold text-gray-700">Ad Soyad / Firma Adı</label>
                <input required type="text" onChange={(e) => setAdSoyad(e.target.value)} className="w-full p-3 border rounded outline-none focus:border-yellow-500" placeholder="Örn: Ahmet Yılmaz" />
            </div>
            <div>
                <label className="block text-sm font-bold text-gray-700">E-Posta Adresi</label>
                <input required type="email" onChange={(e) => setEmail(e.target.value)} className="w-full p-3 border rounded outline-none focus:border-yellow-500" placeholder="ornek@sirket.com" />
            </div>
            <div>
                <label className="block text-sm font-bold text-gray-700">Şifre</label>
                <input required type="password" onChange={(e) => setPassword(e.target.value)} className="w-full p-3 border rounded outline-none focus:border-yellow-500" placeholder="******" />
            </div>
            
            <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3 rounded hover:bg-slate-800 transition">
                Kayıt Ol
            </button>
        </form>

        <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-3 text-gray-500 text-sm">veya</span>
            <div className="flex-1 border-t border-gray-300"></div>
        </div>

        {/* --- GOOGLE BUTONU --- */}
        <button 
          onClick={googleGiris}
          className="w-full bg-white border border-gray-300 text-gray-700 font-bold py-3 rounded flex items-center justify-center gap-2 hover:bg-gray-50 transition"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
          Google ile Kayıt Ol
        </button>

        <p className="text-center mt-6 text-sm text-gray-600">
            Zaten hesabın var mı? <Link to="/giris" className="text-yellow-600 font-bold hover:underline">Giriş Yap</Link>
        </p>
      </div>
    </div>
  );
};

export default KayitOl;