import React, { useState } from 'react';
import { auth, provider } from '../firebase';
import { signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';

const GirisYap = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hata, setHata] = useState('');

  // --- GOOGLE GİRİŞ ---
  const googleGiris = async () => {
    try {
      await signInWithPopup(auth, provider);
      navigate('/profilim');
    } catch (error) {
      setHata("Google girişi başarısız oldu.");
    }
  };

  // --- E-POSTA GİRİŞ ---
  const emailGiris = async (e) => {
    e.preventDefault();
    setHata('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/profilim');
    } catch (error) {
      console.error(error);
      setHata("E-posta veya şifre hatalı.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-slate-800">Lojistik<span className="text-yellow-500">365</span></h1>
            <p className="text-gray-500 mt-2">Tekrar hoş geldiniz!</p>
        </div>

        {hata && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{hata}</div>}

        <form onSubmit={emailGiris} className="space-y-4">
            <div>
                <label className="block text-sm font-bold text-gray-700">E-Posta</label>
                <input required type="email" onChange={(e) => setEmail(e.target.value)} className="w-full p-3 border rounded outline-none focus:border-yellow-500" placeholder="E-posta adresiniz" />
            </div>
            <div>
                <label className="block text-sm font-bold text-gray-700">Şifre</label>
                <input required type="password" onChange={(e) => setPassword(e.target.value)} className="w-full p-3 border rounded outline-none focus:border-yellow-500" placeholder="******" />
            </div>
            <div className="flex justify-end">
                 <Link to="/sifremi-unuttum" className="text-sm text-yellow-600 hover:text-yellow-700 font-medium hover:underline">
                 Şifremi Unuttum?
                 </Link>
            </div>
            <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3 rounded hover:bg-slate-800 transition">
                Giriş Yap
            </button>
        </form>

        <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-3 text-gray-500 text-sm">veya</span>
            <div className="flex-1 border-t border-gray-300"></div>
        </div>

        <button 
          onClick={googleGiris}
          className="w-full bg-white border border-gray-300 text-gray-700 font-bold py-3 rounded flex items-center justify-center gap-2 hover:bg-gray-50 transition"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
          Google ile Giriş Yap
        </button>

        <p className="text-center mt-6 text-sm text-gray-600">
            Hesabın yok mu? <Link to="/kayit" className="text-yellow-600 font-bold hover:underline">Kayıt Ol</Link>
        </p>
      </div>
    </div>
  );
};

export default GirisYap;