import React from 'react';
import { auth, provider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const GirisYap = () => {
  const navigate = useNavigate();

  const googleIleGiris = async () => {
    try {
      // O meşhur Google penceresini açar
      await signInWithPopup(auth, provider);
      
      // Başarılı olursa ana sayfaya at
      navigate('/'); 
    } catch (error) {
      console.error(error);
      alert("Giriş yapılamadı: " + error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md text-center">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Hoş Geldiniz 👋</h1>
        <p className="text-gray-500 mb-8">LojistikBorsa'ya devam etmek için giriş yapın.</p>

        <button 
          onClick={googleIleGiris}
          className="w-full bg-white border border-gray-300 text-gray-700 font-bold py-3 px-4 rounded flex items-center justify-center gap-3 hover:bg-gray-50 transition shadow-sm">
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-6 h-6" alt="Google" />
          Google ile Giriş Yap
        </button>
        
        <p className="mt-6 text-xs text-gray-400">
          Giriş yaparak Hizmet Şartları ve Gizlilik Politikasını kabul etmiş olursunuz.
        </p>
      </div>
    </div>
  );
};

export default GirisYap;