import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [menuAcik, setMenuAcik] = useState(false);
  const navigate = useNavigate();

  // --- BİLDİRİM STATE'LERİ ---
  const [bildirimler, setBildirimler] = useState([]);
  const [okunmamisSayisi, setOkunmamisSayisi] = useState(0);
  const [bildirimKutusuAcik, setBildirimKutusuAcik] = useState(false);

  // --- DIŞARI TIKLAMA İÇİN REF ---
  // Masaüstü ve Mobil için ayrı ref'ler kullanmalıyız, çünkü ikisi de DOM'da olabilir.
  const desktopBildirimRef = useRef(null);
  const mobileBildirimRef = useRef(null);

  useEffect(() => {
    // 1. Kullanıcı Oturumunu ve Bildirimleri Dinle
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      // --- YENİ EKLENEN KISIM: KULLANICI DETAYINI ÇEK (Oluşturulma Tarihi İçin) ---
      const getUyelikTarihi = async (uid) => {
        try {
          const uRef = doc(db, "users", uid);
          const snap = await getDoc(uRef); // getDoc import edilmeli
          if (snap.exists()) {
            return snap.data().createdAt; // Timestamp
          }
        } catch (err) {
          console.error(err);
        }
        return null;
      };

      if (currentUser) {
        // LocalStorage'dan okunan/silinen duyuruları çek
        const getLocalData = () => {
          const data = localStorage.getItem(`lojistik_prefs_${currentUser.uid}`);
          return data ? JSON.parse(data) : { readIds: [], deletedIds: [] };
        };

        // A. Kişisel Bildirimler
        const qBildirimler = query(
          collection(db, "bildirimler"),
          where("userId", "==", currentUser.uid),
          orderBy("tarih", "desc")
        );

        // B. Genel Duyurular (Son 50 duyuru - tarihe göre filtreleyeceğiz)
        const qDuyurular = query(
          collection(db, "duyurular"),
          orderBy("tarih", "desc")
        );

        // 1. Üyelik tarihini al
        getUyelikTarihi(currentUser.uid).then((uyelikTarihi) => {
          const uyelikZamani = uyelikTarihi?.seconds ? uyelikTarihi.seconds : 0;

          const unsubscribeBildirimler = onSnapshot(qBildirimler, (snapshot) => {
            const kisisel = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), tur: 'kisisel' }));

            setBildirimler(prev => {
              const mevcutDuyurular = prev.filter(b => b.tur === 'duyuru');
              return [...kisisel, ...mevcutDuyurular].sort((a, b) => (b.tarih?.seconds || 0) - (a.tarih?.seconds || 0));
            });
          });

          const unsubscribeDuyurular = onSnapshot(qDuyurular, (snapshot) => {
            const prefs = getLocalData();

            const duyurular = snapshot.docs
              .map(doc => ({
                id: doc.id,
                ...doc.data(),
                tur: 'duyuru',
                okundu: prefs.readIds.includes(doc.id)
              }))
              .filter(doc => !prefs.deletedIds.includes(doc.id))
              // YENİ FİLTRE: Sadece üyelikten SONRA atılan duyuruları göster
              .filter(doc => {
                const duyuruZamani = doc.tarih?.seconds || 0;
                return duyuruZamani >= uyelikZamani;
              });

            setBildirimler(prev => {
              const kisisel = prev.filter(b => b.tur === 'kisisel');
              const sonDuyurular = duyurular.slice(0, 10);
              return [...kisisel, ...sonDuyurular].sort((a, b) => (b.tarih?.seconds || 0) - (a.tarih?.seconds || 0));
            });
          });

          currentUser.unsubscribeBildirimler = unsubscribeBildirimler;
          currentUser.unsubscribeDuyurular = unsubscribeDuyurular;
        });

      } else {
        setBildirimler([]);
        setOkunmamisSayisi(0);
      }
    });

    // ... (Click Outside ref code remains same) ...
    const disariTiklamaKontrol = (event) => {
      if (!bildirimKutusuAcik) return;
      const tiklamaMasaustuIcinde = desktopBildirimRef.current && desktopBildirimRef.current.contains(event.target);
      const tiklamaMobilIcinde = mobileBildirimRef.current && mobileBildirimRef.current.contains(event.target);
      if (!tiklamaMasaustuIcinde && !tiklamaMobilIcinde) {
        setBildirimKutusuAcik(false);
      }
    };
    document.addEventListener("mousedown", disariTiklamaKontrol);

    return () => {
      unsubscribeAuth();
      if (user && user.unsubscribeBildirimler) user.unsubscribeBildirimler();
      if (user && user.unsubscribeDuyurular) user.unsubscribeDuyurular();
      document.removeEventListener("mousedown", disariTiklamaKontrol);
    };
  }, [bildirimKutusuAcik]);


  // TÜM BİLDİRİMLERİ SİL BUTONU İŞLEVİ
  const tumunuTemizle = async () => {
    if (!window.confirm("Tüm bildirimleriniz silinecek (Okunmadı olarak işaretlenenler dahil). Onaylıyor musunuz?")) return;

    // 1. Kişiselleri veritabanından sil
    const kisiselBildirimler = bildirimler.filter(b => b.tur === 'kisisel');
    const duyurular = bildirimler.filter(b => b.tur === 'duyuru');

    // Kişisel silme döngüsü
    kisiselBildirimler.forEach(async (b) => {
      try {
        await deleteDoc(doc(db, "bildirimler", b.id));
      } catch (e) { console.error(e); }
    });

    // 2. Duyuruları local storage'a 'deleted' olarak ekle
    if (duyurular.length > 0 && user) {
      const key = `lojistik_prefs_${user.uid}`;
      const current = localStorage.getItem(key) ? JSON.parse(localStorage.getItem(key)) : { readIds: [], deletedIds: [] };

      duyurular.forEach(d => {
        if (!current.deletedIds.includes(d.id)) {
          current.deletedIds.push(d.id);
        }
      });
      localStorage.setItem(key, JSON.stringify(current));
    }

    // State'i boşalt
    setBildirimler([]);
    alert("Tüm bildirimler temizlendi. 🧹");
  };

  // OKUNMAMIŞ SAYISINI GÜNCELLE
  useEffect(() => {
    const sayi = bildirimler.filter(b => !b.okundu).length;
    setOkunmamisSayisi(sayi);
  }, [bildirimler]);

  const cikisYap = async () => {
    await signOut(auth);
    setMenuAcik(false);
    navigate('/giris');
  };

  // BİLDİRİM OKUNDU YAP VE GİT (SİLME YOK)
  const bildirimTikla = async (bildirim, e) => {
    // 1. Kişisel Bildirim ise DB'den güncelle
    if (bildirim.tur === 'kisisel' && !bildirim.okundu) {
      try {
        const bildirimRef = doc(db, "bildirimler", bildirim.id);
        await updateDoc(bildirimRef, { okundu: true });
      } catch (error) {
        console.error("Okundu hatası:", error);
      }
    }
    // 2. Duyuru ise LocalStorage'a kaydet (Okundu olarak işaretle)
    else if (bildirim.tur === 'duyuru' && !bildirim.okundu) {
      if (user) {
        const key = `lojistik_prefs_${user.uid}`;
        const current = localStorage.getItem(key) ? JSON.parse(localStorage.getItem(key)) : { readIds: [], deletedIds: [] };

        if (!current.readIds.includes(bildirim.id)) {
          current.readIds.push(bildirim.id);
          localStorage.setItem(key, JSON.stringify(current));

          // UI Güncelle (State'i manuel güncelle ki anlık görünsün)
          setBildirimler(prev => prev.map(b => b.id === bildirim.id ? { ...b, okundu: true } : b));
        }
      }
    }

    setBildirimKutusuAcik(false);
    if (bildirim.link) navigate(bildirim.link);
  };

  // BİLDİRİM SİL (MANUEL)
  const bildirimSil = async (bildirimId, bildirimTur, e) => {
    e.stopPropagation(); // Menü kapanmasın veya tıklama tetiklenmesin
    if (!window.confirm("Bildirimi silmek istiyor musunuz?")) return;

    // A. Kişisel ise DB'den sil
    if (bildirimTur === 'kisisel') {
      try {
        await deleteDoc(doc(db, "bildirimler", bildirimId));
        // State zaten onSnapshot ile güncellenecek
      } catch (error) {
        console.error("Silme hatası:", error);
      }
    }
    // B. Duyuru ise LocalStorage'a ekle (Silinenler listesine)
    else if (bildirimTur === 'duyuru') {
      if (user) {
        const key = `lojistik_prefs_${user.uid}`;
        const current = localStorage.getItem(key) ? JSON.parse(localStorage.getItem(key)) : { readIds: [], deletedIds: [] };

        if (!current.deletedIds.includes(bildirimId)) {
          current.deletedIds.push(bildirimId);
          localStorage.setItem(key, JSON.stringify(current));

          // UI Güncelle (Listeden çıkar)
          setBildirimler(prev => prev.filter(b => b.id !== bildirimId));
        }
      }
    }
  };

  const zamanHesapla = (timestamp) => {
    if (!timestamp) return "";
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

            {/* SOSYAL MEDYA İKONLARI (Masaüstü) */}
            <div className="flex items-center gap-3 mr-2">
              <a href="https://www.facebook.com/profile.php?id=61587067018884" target="_blank" rel="noreferrer" className="group">
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center border border-slate-600 group-hover:border-yellow-500 transition">
                  {/* Facebook F */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" viewBox="0 0 448 512">
                    <path d="M64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64h98.2V320h-61v-76h61V192c0-40.5 24.8-62.5 60.8-62.5 17.1 0 31.8 1.3 36.1 1.7v42.1h-24.8c-19.6 0-23.4 9.3-23.4 23v37.8h46.7l-6 76h-40.7v160H392c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64z" />
                  </svg>
                </div>
              </a>
              <a href="https://www.instagram.com/lojistik365/" target="_blank" rel="noreferrer" className="group">
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center border border-slate-600 group-hover:border-yellow-500 transition">
                  {/* Instagram Camera */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" viewBox="0 0 448 512">
                    <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z" />
                  </svg>
                </div>
              </a>
              <a href="https://www.linkedin.com/company/111431308/" target="_blank" rel="noreferrer" className="group">
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center border border-slate-600 group-hover:border-yellow-500 transition">
                  {/* LinkedIn In */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" viewBox="0 0 448 512">
                    <path d="M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3c0-17.8-14.4-32.3-32-32.3zM135.4 416H69V202.2h66.5V416zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5zm282.1 243h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9V416z" />
                  </svg>
                </div>
              </a>
            </div>

            {user ? (
              <div className="flex items-center gap-4 ml-4 border-l border-slate-700 pl-4">

                {/* --- 🔔 MASAÜSTÜ BİLDİRİM ALANI --- */}
                <div className="relative" ref={desktopBildirimRef}>
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
                        <div className="flex gap-2">
                          {bildirimler.length > 0 && <button onClick={tumunuTemizle} className="text-[10px] text-red-500 hover:bg-red-50 px-2 py-1 rounded font-bold border border-red-200">Tümünü Sil</button>}
                          <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded border">{okunmamisSayisi} okunmamış</span>
                        </div>
                      </div>

                      <div className="max-h-80 overflow-y-auto">
                        {bildirimler.length > 0 ? (
                          bildirimler.map((bildirim) => (
                            <div
                              key={bildirim.id}
                              onClick={(e) => bildirimTikla(bildirim, e)}
                              className={`p-3 border-b cursor-pointer hover:bg-yellow-50 transition flex gap-3 items-start group ${!bildirim.okundu ? 'bg-blue-50' : ''}`}
                            >
                              <div className="mt-1 text-lg">
                                {bildirim.tip === 'basari' && '✅'}
                                {bildirim.tip === 'uyari' && '⚠️'}
                                {bildirim.tip === 'bilgi' && 'ℹ️'}
                                {!bildirim.tip && '📢'}
                              </div>
                              <div className="flex-1">
                                <p className={`text-sm ${!bildirim.okundu ? 'font-bold text-slate-900' : 'text-gray-600'}`}>
                                  {bildirim.mesaj}
                                </p>
                                <span className="text-[10px] text-gray-400 block mt-1 font-medium">
                                  {zamanHesapla(bildirim.tarih)}
                                </span>
                              </div>

                              {/* SİLME BUTONU (Herkes için aktif) */}
                              <button
                                onClick={(e) => bildirimSil(bildirim.id, bildirim.tur, e)}
                                className="text-gray-400 hover:text-red-500 p-1 rounded hover:bg-red-50 opacity-0 group-hover:opacity-100 transition"
                                title="Bildirimi Sil"
                              >
                                🗑️
                              </button>
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
            {/* MOBİL BİLDİRİM ZİLİ */}
            {user && (
              <div className="relative" ref={mobileBildirimRef}>
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
                    <div className="p-2 bg-slate-100 font-bold text-xs border-b flex justify-between">
                      <span>Bildirimler</span>
                      <span>{okunmamisSayisi} yeni</span>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {bildirimler.map(b => (
                        <div key={b.id} onClick={(e) => bildirimTikla(b, e)} className="p-3 border-b text-sm active:bg-gray-100 flex gap-2">
                          <div className="flex-1">{b.mesaj}</div>
                          <button onClick={(e) => bildirimSil(b.id, b.tur, e)} className="text-red-500 font-bold px-2">✕</button>
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

              {/* MOBİL SOSYAL MEDYA */}
              <div className="flex items-center justify-center gap-4 py-2 border-b border-slate-800">
                <a href="https://www.facebook.com/profile.php?id=61587067018884" target="_blank" rel="noreferrer" className="group">
                  <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center border border-slate-600 group-hover:border-yellow-500 transition">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" viewBox="0 0 448 512">
                      <path d="M64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64h98.2V320h-61v-76h61V192c0-40.5 24.8-62.5 60.8-62.5 17.1 0 31.8 1.3 36.1 1.7v42.1h-24.8c-19.6 0-23.4 9.3-23.4 23v37.8h46.7l-6 76h-40.7v160H392c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64z" />
                    </svg>
                  </div>
                </a>
                <a href="https://www.instagram.com/lojistik365/" target="_blank" rel="noreferrer" className="group">
                  <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center border border-slate-600 group-hover:border-yellow-500 transition">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" viewBox="0 0 448 512">
                      <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z" />
                    </svg>
                  </div>
                </a>
                <a href="https://www.linkedin.com/company/111431308/" target="_blank" rel="noreferrer" className="group">
                  <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center border border-slate-600 group-hover:border-yellow-500 transition">
                    {/* LinkedIn In */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" viewBox="0 0 448 512">
                      <path d="M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3c0-17.8-14.4-32.3-32-32.3zM135.4 416H69V202.2h66.5V416zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5zm282.1 243h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9V416z" />
                    </svg>
                  </div>
                </a>
              </div>

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