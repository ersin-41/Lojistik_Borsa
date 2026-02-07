import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import { doc, getDoc, collection, query, where, onSnapshot, updateDoc } from 'firebase/firestore'; // updateDoc, collection vb. eklendi
import { onAuthStateChanged } from 'firebase/auth';
import TeklifModal from '../components/TeklifModal';


// --- MALİYET HESAPLAYICI BİLEŞENİ ---
const MaliyetHesaplayici = ({ varsayilanMesafe }) => {
  const [mesafe, setMesafe] = useState(varsayilanMesafe || "");
  const [yakitTuketimi, setYakitTuketimi] = useState(32); // Ortalama Tır (32L/100km)
  const [yakitFiyati, setYakitFiyati] = useState(42); // Varsayılan Mazot
  const [digerGiderler, setDigerGiderler] = useState(0); // Köprü, otoyol, harcırah, amortisman
  const [karMarji, setKarMarji] = useState(20); // Yüzde

  const yakitMaliyeti = (Number(mesafe) * Number(yakitTuketimi) / 100) * Number(yakitFiyati);
  const toplamMaliyet = yakitMaliyeti + Number(digerGiderler);
  const oneriFiyat = toplamMaliyet > 0 ? toplamMaliyet * (1 + Number(karMarji) / 100) : 0;

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-xl p-6 mb-8 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <span className="text-9xl">🧮</span>
      </div>

      <h3 className="text-xl font-bold mb-6 flex items-center gap-2 relative z-10 text-yellow-500 border-b border-slate-700 pb-2">
        ✨ Akıllı Maliyet & Teklif Hesaplayıcı
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
        {/* GİRDİLER */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 font-bold block mb-1">Mesafe (KM)</label>
              <input
                type="number"
                value={mesafe}
                onChange={e => setMesafe(e.target.value)}
                className="w-full bg-slate-700/50 border border-slate-600 rounded p-2 text-white font-mono focus:border-yellow-500 outline-none"
                placeholder="Örn: 450"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 font-bold block mb-1">Yakıt (L/100km)</label>
              <input
                type="number"
                value={yakitTuketimi}
                onChange={e => setYakitTuketimi(e.target.value)}
                className="w-full bg-slate-700/50 border border-slate-600 rounded p-2 text-white font-mono focus:border-yellow-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 font-bold block mb-1">Mazot Fiyatı (TL)</label>
              <input
                type="number"
                value={yakitFiyati}
                onChange={e => setYakitFiyati(e.target.value)}
                className="w-full bg-slate-700/50 border border-slate-600 rounded p-2 text-white font-mono focus:border-yellow-500 outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 font-bold block mb-1">Ek Giderler (TL)</label>
              <input
                type="number"
                value={digerGiderler}
                onChange={e => setDigerGiderler(e.target.value)}
                className="w-full bg-slate-700/50 border border-slate-600 rounded p-2 text-white font-mono focus:border-yellow-500 outline-none"
                placeholder="Köprü, yemek..."
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 font-bold block mb-1">Kâr Marjı (%)</label>
            <input
              type="range"
              min="0" max="100" step="5"
              value={karMarji}
              onChange={e => setKarMarji(e.target.value)}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
            />
            <div className="text-right text-xs text-yellow-500 font-bold mt-1">
              %{karMarji} Kâr
            </div>
          </div>
        </div>

        {/* SONUÇLAR */}
        <div className="bg-slate-800/80 rounded-lg p-6 flex flex-col justify-center border border-slate-700">
          <div className="mb-4">
            <span className="text-gray-400 text-sm">Sadece Yakıt:</span>
            <div className="text-xl font-mono text-white">
              {yakitMaliyeti.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} <span className="text-sm text-gray-500">TL</span>
            </div>
          </div>

          <div className="mb-4 border-b border-slate-600 pb-4">
            <span className="text-gray-400 text-sm">Toplam Maliyet (Yakıt + Gider):</span>
            <div className="text-2xl font-mono text-white font-bold">
              {toplamMaliyet.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} <span className="text-sm text-gray-500">TL</span>
            </div>
          </div>

          <div>
            <span className="text-green-400 text-sm font-bold uppercase tracking-wider">Önerilen Teklif Tutarı:</span>
            <div className="text-4xl font-mono text-green-400 font-bold mt-1">
              {oneriFiyat.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} <span className="text-lg">TL</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">*KDV hariç tahmini hesaplamadır.</p>
          </div>
        </div>
      </div>
    </div>
  );
};


const IlanDetay = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ilan, setIlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [modalAcik, setModalAcik] = useState(false);

  // YENİ: Teklifler State'i
  const [gelenTeklifler, setGelenTeklifler] = useState([]);

  // İLAN SAHİBİ DETAYLARI
  const [ilanSahibi, setIlanSahibi] = useState(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => setUser(currentUser));

    const ilanGetir = async () => {
      try {
        const docRef = doc(db, "ilanlar", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const ilanData = { id: docSnap.id, ...docSnap.data() };
          setIlan(ilanData);

          // İLAN SAHİBİNİN bilgilerini çek (Telefon için)
          if (ilanData.ekleyen_id) {
            try {
              const userRef = doc(db, "users", ilanData.ekleyen_id);
              const userSnap = await getDoc(userRef);
              if (userSnap.exists()) {
                setIlanSahibi(userSnap.data());
              }
            } catch (uErr) {
              console.error("Kullanıcı detay hatası:", uErr);
            }
          }

        } else {
          alert("İlan bulunamadı!");
          navigate('/ilanlar');
        }
      } catch (error) {
        console.error("Hata:", error);
      } finally {
        setLoading(false);
      }
    };
    ilanGetir();

    // TEKLİFLERİ DİNLE
    const q = query(collection(db, "teklifler"), where("ilanId", "==", id));
    const unsubscribeTeklifler = onSnapshot(q, (snapshot) => {
      const teklifListesi = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      teklifListesi.sort((a, b) => (b.tarih?.seconds || 0) - (a.tarih?.seconds || 0));
      setGelenTeklifler(teklifListesi);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeTeklifler();
    };
  }, [id, navigate]);

  // ... (Diğer fonksiyonlar aynı kalsın) ...
  const teklifYonet = async (teklifId, yeniDurum) => {
    if (!window.confirm(`Teklifi ${yeniDurum === 'onaylandi' ? 'ONAYLAMAK' : 'REDDETMEK'} istediğinize emin misiniz?`)) return;

    try {
      await updateDoc(doc(db, "teklifler", teklifId), {
        durum: yeniDurum
      });

      if (yeniDurum === 'onaylandi') {
        await updateDoc(doc(db, "ilanlar", id), {
          durum: 'pasif'
        });
        setIlan(prev => ({ ...prev, durum: 'pasif' }));
        alert("Teklif onaylandı! İlanınız 'İşi Verdim' statüsüne alındı ve yayından kaldırıldı. ✅");
      } else {
        alert("Teklif durumu güncellendi.");
      }
    } catch (err) {
      console.error(err);
      alert("Hata oluştu.");
    }
  };

  const haritadaAc = (adres) => {
    if (adres) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(adres)}`, '_blank');
    }
  };

  // WHATSAPP LİNKİ
  const wpMesaj = ilan ? `Merhaba, ${ilan.nereden} - ${ilan.nereye} yük ilanı için iletişime geçiyorum.` : "";
  const wpLink = ilanSahibi?.telefon ? `https://wa.me/90${ilanSahibi.telefon.replace(/\D/g, '').slice(-10)}?text=${encodeURIComponent(wpMesaj)}` : "#";


  if (loading) return <div className="text-center mt-20">Yükleniyor...</div>;
  if (!ilan) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* GERİ DÖN BUTONU */}
      <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-slate-900 mb-4 flex items-center gap-1 font-bold">
        ← Listeye Dön
      </button>

      {/* ANA KART */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">

        {/* Üst Başlık Kısmı */}
        <div className="bg-slate-900 text-white p-6 md:p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex gap-2 mb-2 text-sm font-bold text-yellow-500">
                <span>{ilan.yukTipi}</span>
                <span>•</span>
                <span>{ilan.tonaj} Ton</span>
                <span>•</span>
                <span>{ilan.aracTipi}</span>
              </div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                {ilan.nereden} ➜ {ilan.nereye}
              </h1>
            </div>
            <div className="text-right">
              <div className="text-yellow-400 text-xs uppercase font-bold tracking-wider">Tahmini Bütçe</div>
              <div className="text-2xl font-bold">Teklif Usulü 🔨</div>
            </div>
          </div>
        </div>

        {/* İçerik Kısmı */}
        <div className="p-6 md:p-8">

          {/* Açıklama */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6">
            <h3 className="font-bold text-slate-800 mb-2">Yük Açıklaması</h3>
            <p className="text-gray-700 leading-relaxed">{ilan.aciklama}</p>
          </div>

          {/* Detay Tablosu */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 text-sm">
            <div>
              <span className="block text-gray-400 font-bold mb-1">Yükleme Tarihi</span>
              <span className="text-slate-900 font-bold text-lg">{ilan.yuklemeTarihi ? new Date(ilan.yuklemeTarihi).toLocaleDateString('tr-TR') : 'Hemen'}</span>
            </div>
            <div>
              <span className="block text-gray-400 font-bold mb-1">İlan Sahibi</span>
              <span className="text-slate-900 font-bold text-lg">{ilan.ekleyen_ad || "Bilinmiyor"}</span>
            </div>
            <div>
              <span className="block text-gray-400 font-bold mb-1">Ödeme Şekli</span>
              <span className="text-slate-900 font-bold text-lg">{ilan.odemeSekli || '-'}</span>
            </div>
            <div>
              <span className="block text-gray-400 font-bold mb-1">Mesafe</span>
              <span className="text-slate-900 font-bold text-lg">{ilan.mesafe ? `${ilan.mesafe} KM` : '-'}</span>
            </div>
          </div>

          {/* --- ADRES KARTLARI (YÜKLEME VE TESLİMAT) --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {/* Yükleme Adresi */}
            {ilan.yuklemeAdresi && (
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded rouded-l-none flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-blue-900 flex items-center gap-2 mb-2">
                    📍 Yükleme Noktası
                  </h4>
                  <p className="text-blue-800 text-sm mb-4 leading-snug">{ilan.yuklemeAdresi}</p>
                </div>
                <button
                  onClick={() => haritadaAc(ilan.yuklemeAdresi)}
                  className="text-xs font-bold text-blue-600 bg-white border border-blue-200 py-2 px-3 rounded hover:bg-blue-600 hover:text-white transition w-max">
                  Haritada Gör →
                </button>
              </div>
            )}

            {/* Teslimat Adresi */}
            {ilan.teslimatAdresi && (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded rouded-l-none flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-green-900 flex items-center gap-2 mb-2">
                    🏁 Teslimat Noktası
                  </h4>
                  <p className="text-green-800 text-sm mb-4 leading-snug">{ilan.teslimatAdresi}</p>
                </div>
                <button
                  onClick={() => haritadaAc(ilan.teslimatAdresi)}
                  className="text-xs font-bold text-green-600 bg-white border border-green-200 py-2 px-3 rounded hover:bg-green-600 hover:text-white transition w-max">
                  Haritada Gör →
                </button>
              </div>
            )}
          </div>

          <hr className="border-gray-100 my-8" />

          {/* MALİYET HESAPLAYICI */}
          <MaliyetHesaplayici varsayilanMesafe={ilan.mesafe} />

          {/* --- İLETİŞİM BUTONLARI --- */}
          <h3 className="font-bold text-slate-800 mb-4 text-lg">İlan Sahibi İle İletişim</h3>
          <div className="flex flex-col gap-4">

            {/* 1. TEKLİF VER (Modal Aç) */}
            <button
              onClick={() => {
                if (!user) return alert("Giriş yapmalısınız");
                if (user.uid === ilan.ekleyen_id) return alert("Kendi ilanınız");
                setModalAcik(true);
              }}
              className="w-full flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-slate-900 py-4 rounded-lg font-bold transition shadow-md text-lg"
            >
              💬 Teklif Ver
            </button>

            <div className="flex flex-col md:flex-row gap-4">
              {/* 2. TELEFON İLE ARA (Varsa) */}
              {ilanSahibi?.telefon ? (
                <a
                  href={`tel:${ilanSahibi.telefon}`}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold transition shadow-md"
                >
                  📞 Hemen Ara
                </a>
              ) : (
                <button disabled className="flex-1 flex items-center justify-center gap-2 bg-gray-200 text-gray-400 py-3 rounded-lg font-bold cursor-not-allowed">
                  📵 Telefon Gizli
                </button>
              )}

              {/* 3. WHATSAPP (Varsa) */}
              {ilanSahibi?.telefon ? (
                <a
                  href={wpLink}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white py-3 rounded-lg font-bold transition shadow-md"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" />
                  </svg>
                  WhatsApp
                </a>
              ) : (
                <button disabled className="flex-1 flex items-center justify-center gap-2 bg-gray-200 text-gray-400 py-3 rounded-lg font-bold cursor-not-allowed">
                  📱 WP Yok
                </button>
              )}
            </div>
          </div>

          <p className="text-xs text-center text-gray-400 mt-4">
            Güvenliğiniz için Lojistik365 üzerinden mesajlaşmayı tercih ediniz.
          </p>

        </div>
      </div>


      {/* --- İLAN SAHİBİ PANELİ (TEKLİFLERİ GÖRME) --- */}
      {
        (user && ilan && user.uid === ilan.ekleyen_id) && (
          <div className="mt-8 bg-white rounded-xl shadow-lg border border-yellow-400 overflow-hidden">
            <div className="bg-yellow-50 p-4 border-b border-yellow-100 flex justify-between items-center">
              <h3 className="font-bold text-yellow-800 flex items-center gap-2">
                📢 Gelen Teklifler ({gelenTeklifler.length})
              </h3>
              <span className="text-xs text-yellow-600 font-medium">Bu alanı sadece siz görüyorsunuz</span>
            </div>

            <div className="p-6">
              {gelenTeklifler.length === 0 ? (
                <p className="text-gray-500 text-center italic">Henüz bu ilana teklif gelmedi.</p>
              ) : (
                <div className="space-y-4">
                  {gelenTeklifler.map(teklif => (
                    <div key={teklif.id} className="bg-slate-50 border p-4 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">

                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-slate-800">{teklif.fiyat} ₺</span>
                          {teklif.durum === 'bekliyor' && <span className="text-xs bg-gray-200 px-2 py-0.5 rounded text-gray-700">Bekliyor</span>}
                          {teklif.durum === 'onaylandi' && <span className="text-xs bg-green-100 px-2 py-0.5 rounded text-green-700 font-bold">Onaylandı ✅</span>}
                          {teklif.durum === 'reddedildi' && <span className="text-xs bg-red-100 px-2 py-0.5 rounded text-red-700 font-bold">Reddedildi ❌</span>}
                        </div>
                        <p className="text-sm font-bold text-gray-700">Veren: {teklif.teklifVerenAd}</p>
                        <p className="text-sm text-gray-500 italic">"{teklif.aciklama}"</p>
                        <p className="text-xs text-gray-400 mt-1">{teklif.tarih?.seconds ? new Date(teklif.tarih.seconds * 1000).toLocaleString() : ''}</p>
                      </div>

                      {teklif.durum === 'bekliyor' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => teklifYonet(teklif.id, 'onaylandi')}
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                          >
                            Onayla
                          </button>
                          <button
                            onClick={() => teklifYonet(teklif.id, 'reddedildi')}
                            className="bg-red-50 text-red-600 border border-red-200 px-3 py-1 rounded text-sm hover:bg-red-100"
                          >
                            Reddet
                          </button>
                        </div>
                      )}

                      {teklif.durum === 'onaylandi' && (
                        <div className="bg-green-50 border border-green-200 p-2 rounded text-green-800 text-sm font-bold flex items-center gap-2">
                          📞 {teklif.teklifVerenTel ? teklif.teklifVerenTel : "Telefon Yok"}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )
      }

      {/* MODAL */}
      {
        modalAcik && (
          <TeklifModal ilan={ilan} kapat={() => setModalAcik(false)} user={user} />
        )
      }
    </div >
  );
};

export default IlanDetay;
