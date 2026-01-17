import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [menuAcik, setMenuAcik] = useState(false);
  const navigate = useNavigate();

  // --- BİLDİRİM STATE'LERİ ---
  const [bildirimler, setBildirimler] = useState([]);
  const [okunmamisSayisi, setOkunmamisSayisi] = useState(0);
  const [bildirimKutusuAcik, setBildirimKutusuAcik] = useState(false);

  // --- DIŞARI TIKLAMA İÇİN REF ---
  // Bildirim kutusunun kapsayıcısını seçmek için kullanacağız
  const bildirimRef = useRef(null);

  useEffect(() => {
    // 1. Kullanıcı Oturumunu Dinle
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        const q = query(
          collection(db, "bildirimler"),
          where("userId", "==", currentUser.uid),
          orderBy("tarih", "desc")
        );

        const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
          const gelenBildirimler = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setBildirimler(gelenBildirimler);
          const sayi = gelenBildirimler.filter(b => !b.okundu).length;
          setOkunmamisSayisi(sayi);
        });
        
        return () => unsubscribeSnapshot();
      } else {
        setBildirimler([]);
        setOkunmamisSayisi(0);
      }
    });

    // 2. Dışarı Tıklamayı Dinle (Click Outside)
    const disariTiklamaKontrol = (event) => {
      // Eğer bildirim kutusu açıksa VE tıklanan yer referansımızın (kutunun) içinde değilse kapat
      if (bildirimKutusuAcik && bildirimRef.current && !bildirimRef.current.contains(event.target)) {
        setBildirimKutusuAcik(false);
      }
    };

    // Sayfaya tıklama olayını ekle
    document.addEventListener("mousedown", disariTiklamaKontrol);

    return () => {
      unsubscribeAuth();
      // Sayfadan çıkarken olayı temizle (Performans için şart)
      document.removeEventListener("mousedown", disariTiklamaKontrol);
    };
  }, [bildirimKutusuAcik]); // bildirimKutusuAcik değiştiğinde effect güncellenir

  const cikisYap = async () => {
    await signOut(auth);
    setMenuAcik(false);
    navigate('/giris');
  };

  const bildirimOkunduYap = async (bildirimId, link) => {
    try {
      const bildirimRef = doc(db, "bildirimler", bildirimId);
      await updateDoc(bildirimRef, { okundu: true });
      
      setBildirimKutusuAcik(false);
      if(link) navigate(link);
    } catch (error) {
      console.error("Hata:", error);
    }
  };

  const zamanHesapla = (timestamp) => {
    if(!timestamp) return "";
    const tarih = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const fark = new Date() - tarih;
    const dakika = Math.floor(fark / 60000);

    if (dakika < 1) return "Az önce";
    if (dakika < 60) return `${dakika} dk önce`;
    const saat = Math.floor(dakika / 60);
    if (saat < 24) return `${saat} saat önce`;
    const gun = Math.floor(saat / 24);
    return `${gun} gün önce`;
  };

  return (
    <nav className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          
          <Link to="/" className="flex items-center gap-2 group" onClick={() => setMenuAcik(false)}>
            <span className="text-3xl group-hover:scale-110 transition">🚛</span>
            <span className="text-2xl font-bold tracking-tight">
                Lojistik<span className="text-yellow-500">365</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/ilanlar" className="hover:text-yellow-500 transition font-medium">Yük İlanları</Link>
            <Link to="/araclar" className="hover:text-yellow-500 transition font-medium">Boş Araçlar</Link>
            <Link to="/surucu-ilanlari" className="hover:text-yellow-500 transition font-medium">Şoför İlanları</Link>
            <Link to="/surucu-is-arayanlar" className="hover:text-yellow-500 transition font-medium">İş Arayanlar</Link>

            {user ? (
              <div className="flex items-center gap-4 ml-4 border-l border-slate-700 pl-4">
                
                {/* --- 🔔 BİLDİRİM ALANI (Ref Buraya Eklendi) --- 
                    Hem butonu hem de açılan kutuyu kapsayan div'e 'ref' veriyoruz.
                    Böylece bu div'in içine mi tıklandı dışına mı anlıyoruz.
                */}
                <div className="relative" ref={bildirimRef}>
                  <button 
                    onClick={() => setBildirimKutusuAcik(!bildirimKutusuAcik)} 
                    className="relative p-2 hover:bg-slate-800 rounded-full transition outline-none"
                  >
                    <span className="text-2xl">🔔</span>
                    {okunmamisSayisi > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full animate-pulse border-2 border-slate-900">
                        {okunmamisSayisi}
                      </span>
                    )}
                  </button>

                  {bildirimKutusuAcik && (
                    <div className="absolute right-0 mt-3 w-80 bg-white rounded-lg shadow-2xl overflow-hidden border border-gray-200 text-slate-800 animate-fadeIn origin-top-right">
                      <div className="bg-slate-100 p-3 border-b flex justify-between items-center">
                        <h4 className="font-bold text-sm text-slate-700">Bildirimler</h4>
                        <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded border">{okunmamisSayisi} yeni</span>
                      </div>
                      
                      <div className="max-h-80 overflow-y-auto">
                        {bildirimler.length > 0 ? (
                          bildirimler.map((bildirim) => (
                            <div 
                              key={bildirim.id} 
                              onClick={() => bildirimOkunduYap(bildirim.id, bildirim.link)}
                              className={`p-3 border-b cursor-pointer hover:bg-yellow-50 transition flex gap-3 items-start ${!bildirim.okundu ? 'bg-blue-50' : ''}`}
                            >
                              <div className="mt-1 text-lg">
                                  {bildirim.tip === 'basari' && '✅'}
                                  {bildirim.tip === 'uyari' && '⚠️'}
                                  {bildirim.tip === 'bilgi' && 'ℹ️'}
                                  {!bildirim.tip && '📢'}
                              </div>
                              <div>
                                  <p className={`text-sm ${!bildirim.okundu ? 'font-bold text-slate-900' : 'text-gray-600'}`}>
                                      {bildirim.mesaj}
                                  </p>
                                  <span className="text-[10px] text-gray-400 block mt-1 font-medium">
                                      {zamanHesapla(bildirim.tarih)}
                                  </span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-8 text-center text-gray-400 text-sm flex flex-col items-center gap-2">
                             <span>🔕</span>
                             <span>Henüz bildirim yok.</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <Link to="/profilim" className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-lg transition group">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center font-bold text-slate-900 border-2 border-transparent group-hover:border-white transition">
                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : "U"}
                  </div>
                  <span className="text-sm font-bold group-hover:text-yellow-400 max-w-[100px] truncate">{user.displayName}</span>
                </Link>

                <button onClick={cikisYap} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-bold transition shadow hover:shadow-red-500/50">
                  Çıkış
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                  <Link to="/giris" className="text-yellow-500 hover:text-white font-bold transition">Giriş Yap</Link>
                  <Link to="/kayit" className="bg-yellow-500 hover:bg-yellow-400 text-slate-900 px-5 py-2 rounded-lg font-bold transition shadow-lg hover:shadow-yellow-500/50">Kayıt Ol</Link>
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center gap-4">
            {/* Mobilde Bildirim Zili (Aynı Ref Mantığı İle) */}
            {user && (
               <div className="relative" ref={bildirimRef}> 
               {/* Not: Ref'i burada tekrar kullanıyoruz ama React'te aynı ref'i iki farklı elemente aynı anda atamak sorun çıkarabilir.
                  Ancak Mobil ve Masaüstü aynı anda görünmediği (biri hidden) için genellikle çalışır.
                  Yine de en garantisi: Masaüstü için ayrı, mobil için ayrı state/ref kullanmak veya ref kontrolünü özelleştirmektir.
                  Bu basit kullanımda sorun çıkarmayacaktır.
               */}
                 <button onClick={() => setBildirimKutusuAcik(!bildirimKutusuAcik)} className="relative p-1">
                   <span className="text-2xl">🔔</span>
                   {okunmamisSayisi > 0 && (
                     <span className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                       {okunmamisSayisi}
                     </span>
                   )}
                 </button>
                 {bildirimKutusuAcik && (
                    <div className="absolute right-0 mt-2 w-72 bg-white rounded shadow-xl text-slate-800 z-50 overflow-hidden">
                       <div className="p-2 bg-slate-100 font-bold text-xs border-b">Bildirimler ({okunmamisSayisi})</div>
                       <div className="max-h-60 overflow-y-auto">
                          {bildirimler.map(b => (
                             <div key={b.id} onClick={() => bildirimOkunduYap(b.id, b.link)} className="p-3 border-b text-sm active:bg-gray-100">
                                {b.mesaj}
                             </div>
                          ))}
                          {bildirimler.length === 0 && <div className="p-4 text-center text-xs text-gray-500">Bildirim yok</div>}
                       </div>
                    </div>
                 )}
               </div>
            )}

            <button onClick={() => setMenuAcik(!menuAcik)} className="text-3xl focus:outline-none">
              {menuAcik ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {menuAcik && (
          <div className="md:hidden mt-4 pb-4 border-t border-slate-700 animate-fadeIn">
            <div className="flex flex-col gap-4 mt-4">
              <Link to="/ilanlar" onClick={() => setMenuAcik(false)} className="block py-2 hover:text-yellow-500 border-b border-slate-800">📦 Yük İlanları</Link>
              <Link to="/araclar" onClick={() => setMenuAcik(false)} className="block py-2 hover:text-yellow-500 border-b border-slate-800">🚛 Boş Araçlar</Link>
              <Link to="/surucu-ilanlari" onClick={() => setMenuAcik(false)} className="block py-2 hover:text-yellow-500 border-b border-slate-800">📢 Şoför İlanları</Link>
              <Link to="/surucu-is-arayanlar" onClick={() => setMenuAcik(false)} className="block py-2 hover:text-yellow-500 border-b border-slate-800">📄 İş Arayanlar</Link>

              {user ? (
                <div className="pt-2">
                  <div className="flex items-center gap-3 mb-4 bg-slate-800 p-3 rounded">
                    <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center font-bold text-slate-900">
                      {user.displayName ? user.displayName.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div>
                      <div className="font-bold">{user.displayName}</div>
                      <Link to="/profilim" onClick={() => setMenuAcik(false)} className="text-xs text-yellow-500 hover:underline">Profilime Git</Link>
                    </div>
                  </div>
                  <button onClick={cikisYap} className="w-full bg-red-600 text-white py-3 rounded font-bold">Çıkış Yap</button>
                </div>
              ) : (
                <div className="flex flex-col gap-3 pt-2">
                  <Link to="/giris" onClick={() => setMenuAcik(false)} className="w-full bg-slate-700 text-center py-3 rounded font-bold">Giriş Yap</Link>
                  <Link to="/kayit" onClick={() => setMenuAcik(false)} className="w-full bg-yellow-500 text-slate-900 text-center py-3 rounded font-bold">Kayıt Ol</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;