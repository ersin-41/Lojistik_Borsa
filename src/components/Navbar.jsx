import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [menuAcik, setMenuAcik] = useState(false); // Mobil menü kontrolü
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/giris');
    setMenuAcik(false); // Çıkış yapınca menüyü kapat
  };

  // Linke tıklanınca menüyü kapatan yardımcı fonksiyon
  const linkeGit = (yol) => {
    navigate(yol);
    setMenuAcik(false);
  };

  return (
    <nav className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          
          {/* LOGO */}
          <Link to="/" className="flex items-center gap-2 font-bold text-2xl tracking-wider hover:text-gray-200 transition">
            <span className="text-2xl font-bold tracking-tight">
            Lojistik<span className="text-yellow-500">365</span>
        </span>
        <span className="text-[10px] text-gray-400 font-medium tracking-widest uppercase">
            7/24 Lojistik Platformu
        </span>
          </Link>

          {/* MASAÜSTÜ MENÜ (Sadece PC'de görünür) */}
          <div className="hidden md:flex space-x-6 items-center font-medium text-sm">
            <Link to="/ilanlar" className="hover:text-yellow-500 transition">Yük Ara</Link>
            <Link to="/araclar" className="hover:text-yellow-500 transition">Araç Ara</Link>
            <Link to="/surucu-ilanlari" className="hover:text-yellow-500 transition">Sürücü İlanları</Link>
            <Link to="/surucu-is-arayanlar" className="hover:text-yellow-500 transition">İş Arayanlar</Link>
            
            {/* İlan Ver Butonu (Dropdown) */}
            <div className="relative group">
               <button className="bg-yellow-500 text-slate-900 px-4 py-2 rounded font-bold hover:bg-yellow-400 transition flex items-center gap-1">
                 + İlan Ver
               </button>
               <div className="absolute right-0 w-48 bg-white text-slate-800 shadow-xl rounded hidden group-hover:block border border-gray-200 overflow-hidden">
                 <Link to="/ilan-ekle" className="block px-4 py-3 hover:bg-gray-100 border-b">📦 Yük İlanı Ver</Link>
                 <Link to="/arac-ekle" className="block px-4 py-3 hover:bg-gray-100 border-b">🚛 Boş Araç Ekle</Link>
                 <Link to="/sofor-ilani-ver" className="block px-4 py-3 hover:bg-gray-100 border-b">📢 Şoför Ara</Link>
                 <Link to="/surucu-is-arama-ekle" className="block px-4 py-3 hover:bg-gray-100">📄 İş Arıyorum</Link>
               </div>
            </div>
          </div>

          {/* KULLANICI ALANI (Masaüstü) */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <Link to="/profilim" className="flex items-center gap-2 hover:bg-slate-800 p-2 rounded transition">
                   {user.photoURL ? (
                     <img src={user.photoURL} alt="Profil" className="w-8 h-8 rounded-full border border-yellow-500" />
                   ) : (
                     <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-slate-900 font-bold">{user.displayName?.charAt(0)}</div>
                   )}
                   <span className="text-sm font-medium">{user.displayName}</span>
                </Link>
                <button onClick={handleLogout} className="bg-red-600 px-3 py-1 rounded text-xs font-bold hover:bg-red-700 transition">Çıkış</button>
              </>
            ) : (
              <Link to="/giris" className="text-yellow-500 border border-yellow-500 px-4 py-2 rounded hover:bg-yellow-500 hover:text-slate-900 transition font-bold">
                Giriş Yap
              </Link>
            )}
          </div>

          {/* MOBİL MENÜ BUTONU (Sadece Telefondan Görünür) */}
          <div className="md:hidden flex items-center gap-3">
             {/* Mobilde Profil Fotosu (Varsa Gösterelim) */}
             {user && (
                 <Link to="/profilim" className="w-8 h-8 rounded-full overflow-hidden border border-yellow-500">
                    {user.photoURL ? <img src={user.photoURL} alt="Pr" /> : <div className="bg-yellow-500 w-full h-full flex items-center justify-center text-slate-900 font-bold">{user.displayName?.charAt(0)}</div>}
                 </Link>
             )}

             <button onClick={() => setMenuAcik(!menuAcik)} className="text-white focus:outline-none">
                {menuAcik ? (
                    // Kapat İkonu (X)
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                ) : (
                    // Hamburger İkonu (☰)
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                )}
             </button>
          </div>
        </div>
      </div>

      {/* MOBİL MENÜ LİSTESİ (Açılır Kapanır) */}
      {menuAcik && (
        <div className="md:hidden bg-slate-800 border-t border-slate-700 animate-fade-in">
           <div className="flex flex-col p-4 space-y-3">
              {user && (
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-700 mb-2">
                     <span className="text-yellow-500 font-bold">Merhaba, {user.displayName}</span>
                  </div>
              )}
              
              <button onClick={() => linkeGit('/ilanlar')} className="text-left text-gray-300 hover:text-white py-2">📦 Yük Ara</button>
              <button onClick={() => linkeGit('/araclar')} className="text-left text-gray-300 hover:text-white py-2">🚛 Araç Ara</button>
              <button onClick={() => linkeGit('/surucu-ilanlari')} className="text-left text-gray-300 hover:text-white py-2">📢 Sürücü İlanları</button>
              <button onClick={() => linkeGit('/surucu-is-arayanlar')} className="text-left text-gray-300 hover:text-white py-2">📄 İş Arayanlar</button>
              
              <div className="border-t border-slate-700 my-2 pt-2">
                 <p className="text-xs text-gray-500 uppercase font-bold mb-2">İlan İşlemleri</p>
                 <button onClick={() => linkeGit('/ilan-ekle')} className="block w-full text-left text-yellow-500 font-bold py-2">+ Yük İlanı Ver</button>
                 <button onClick={() => linkeGit('/arac-ekle')} className="block w-full text-left text-yellow-500 font-bold py-2">+ Boş Araç Ekle</button>
                 <button onClick={() => linkeGit('/sofor-ilani-ver')} className="block w-full text-left text-yellow-500 font-bold py-2">+ Şoför İlanı Ver</button>
              </div>

              {user ? (
                 <div className="border-t border-slate-700 pt-3 mt-2 flex flex-col gap-2">
                    <button onClick={() => linkeGit('/profilim')} className="bg-slate-700 text-white py-2 rounded text-center">👤 Profilim</button>
                    <button onClick={handleLogout} className="bg-red-600 text-white py-2 rounded text-center">Çıkış Yap</button>
                 </div>
              ) : (
                 <button onClick={() => linkeGit('/giris')} className="bg-yellow-500 text-slate-900 font-bold py-3 rounded text-center mt-4">
                    Giriş Yap / Kayıt Ol
                 </button>
              )}
           </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;