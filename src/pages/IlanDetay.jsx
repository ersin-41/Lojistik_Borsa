import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import { doc, getDoc, collection, query, where, onSnapshot, updateDoc } from 'firebase/firestore'; // updateDoc, collection vb. eklendi
import { onAuthStateChanged } from 'firebase/auth';
import TeklifModal from '../components/TeklifModal';

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

  const haritadaAc = () => {
    if (ilan?.yuklemeAdresi) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ilan.yuklemeAdresi)}`, '_blank');
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
              <span className="block text-gray-400 font-bold mb-1">Kasa Tipi</span>
              <span className="text-slate-900 font-bold text-lg">{ilan.kasaTipi || 'Standart'}</span>
            </div>
            <div>
              <span className="block text-gray-400 font-bold mb-1">İlan No</span>
              <span className="text-slate-900 font-bold text-lg">#{ilan.id.substring(0, 6)}</span>
            </div>
          </div>

          {/* HARİTA VE ADRES */}
          {ilan.yuklemeAdresi && (
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
              <div className="flex items-start gap-3">
                <span className="text-2xl">📍</span>
                <div>
                  <h4 className="font-bold text-blue-900">Yükleme Adresi</h4>
                  <p className="text-blue-800 text-sm">{ilan.yuklemeAdresi}</p>
                </div>
              </div>
              <button onClick={haritadaAc} className="bg-white text-blue-600 border border-blue-200 px-4 py-2 rounded-lg font-bold hover:bg-blue-600 hover:text-white transition shadow-sm w-full md:w-auto">
                Haritada Aç 🗺️
              </button>
            </div>
          )}

          <hr className="border-gray-100 my-8" />

          {/* --- İLETİŞİM BUTONLARI --- */}
          <h3 className="font-bold text-slate-800 mb-4 text-lg">İlan Sahibi İle İletişim</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

            {/* 1. TEKLİF VER (Modal Aç) */}
            <button
              onClick={() => {
                if (!user) return alert("Giriş yapmalısınız");
                if (user.uid === ilan.ekleyen_id) return alert("Kendi ilanınız");
                setModalAcik(true);
              }}
              className="flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-slate-900 py-3 rounded-lg font-bold transition shadow-md col-span-2"
            >
              💬 Teklif Ver
            </button>

            {/* 2. TELEFON İLE ARA (Varsa) */}
            {ilanSahibi?.telefon ? (
              <a
                href={`tel:${ilanSahibi.telefon}`}
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold transition shadow-md"
              >
                📞 Hemen Ara
              </a>
            ) : (
              <button disabled className="flex items-center justify-center gap-2 bg-gray-200 text-gray-400 py-3 rounded-lg font-bold cursor-not-allowed">
                📵 Telefon Gizli
              </button>
            )}

            {/* 3. WHATSAPP (Varsa) */}
            {ilanSahibi?.telefon ? (
              <a
                href={wpLink}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-bold transition shadow-md"
              >
                📱 WhatsApp
              </a>
            ) : (
              <button disabled className="flex items-center justify-center gap-2 bg-gray-200 text-gray-400 py-3 rounded-lg font-bold cursor-not-allowed">
                📱 WP Yok
              </button>
            )}

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