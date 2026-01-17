import React, { useState } from 'react';
import { auth } from '../firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { Link } from 'react-router-dom';

const SifremiUnuttum = () => {
  const [email, setEmail] = useState('');
  const [mesaj, setMesaj] = useState('');
  const [hata, setHata] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMesaj('');
    setHata('');
    setYukleniyor(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setMesaj('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi! Lütfen gelen kutunuzu (ve spam klasörünü) kontrol edin.');
    } catch (error) {
      console.error(error);
      if (error.code === 'auth/user-not-found') {
        setHata("Bu e-posta adresiyle kayıtlı bir kullanıcı bulunamadı.");
      } else if (error.code === 'auth/invalid-email') {
        setHata("Geçersiz bir e-posta adresi girdiniz.");
      } else {
        setHata("Bir hata oluştu: " + error.message);
      }
    } finally {
      setYukleniyor(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-slate-800">Şifreni mi Unuttun? 🔒</h1>
            <p className="text-gray-500 mt-2 text-sm">E-posta adresini gir, sana sıfırlama bağlantısı gönderelim.</p>
        </div>

        {/* Başarı Mesajı */}
        {mesaj && (
          <div className="bg-green-100 border border-green-400 text-green-700 p-4 rounded mb-4 text-sm font-medium">
            {mesaj}
          </div>
        )}

        {/* Hata Mesajı */}
        {hata && (
          <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded mb-4 text-sm font-medium">
            {hata}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">E-Posta Adresi</label>
                <input 
                  required 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)} 
                  className="w-full p-3 border rounded outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition" 
                  placeholder="ornek@sirket.com" 
                />
            </div>
            
            <button 
              type="submit" 
              disabled={yukleniyor}
              className="w-full bg-slate-900 text-white font-bold py-3 rounded hover:bg-slate-800 transition disabled:bg-gray-400"
            >
                {yukleniyor ? 'Gönderiliyor...' : 'Sıfırlama Linki Gönder'}
            </button>
        </form>

        <div className="mt-6 text-center">
            <Link to="/giris" className="text-sm text-gray-600 hover:text-slate-900 font-medium">
                ← Giriş Ekranına Dön
            </Link>
        </div>
      </div>
    </div>
  );
};

export default SifremiUnuttum;