import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, where, getDocs, deleteDoc, doc, orderBy, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';

const Profilim = () => {
    const [user, setUser] = useState(null);
    const [aktifSekme, setAktifSekme] = useState('yuk_ilanlari');
    const [yukleniyor, setYukleniyor] = useState(true);

    // Veri State'leri
    const [yukIlanlarim, setYukIlanlarim] = useState([]);
    const [aracIlanlarim, setAracIlanlarim] = useState([]);
    const [soforIlanlarim, setSoforIlanlarim] = useState([]);
    const [isAramaIlanlarim, setIsAramaIlanlarim] = useState([]);
    const [gelenTeklifler, setGelenTeklifler] = useState([]);
    const [verdigimTeklifler, setVerdigimTeklifler] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                await tumVerileriGetir(currentUser.uid);
            } else {
                navigate('/giris');
            }
            setYukleniyor(false);
        });
        return () => unsubscribe();
    }, [navigate]);

    const tumVerileriGetir = async (uid) => {
        try {
            // 1. Yük İlanları
            const q1 = query(collection(db, "ilanlar"), where("ekleyen_id", "==", uid), orderBy("tarih", "desc"));
            const s1 = await getDocs(q1);
            setYukIlanlarim(s1.docs.map(d => ({ id: d.id, ...d.data(), tur: 'Yük İlanı' })));

            // 2. Araç İlanları
            const q2 = query(collection(db, "araclar"), where("ekleyen_id", "==", uid)); // orderBy index gerekebilir
            const s2 = await getDocs(q2);
            setAracIlanlarim(s2.docs.map(d => ({ id: d.id, ...d.data(), tur: 'Araç İlanı' })));

            // 3. Şoför İlanları (İşveren)
            const q3 = query(collection(db, "sofor_ilanlari"), where("ekleyen_id", "==", uid));
            const s3 = await getDocs(q3);
            setSoforIlanlarim(s3.docs.map(d => ({ id: d.id, ...d.data(), tur: 'Şoför İlanı' })));

            // 4. İş Arayan İlanları (Sürücü)
            const q4 = query(collection(db, "surucu_is_arama"), where("ekleyen_id", "==", uid));
            const s4 = await getDocs(q4);
            setIsAramaIlanlarim(s4.docs.map(d => ({ id: d.id, ...d.data(), tur: 'İş Arama İlanı' })));

            // 5. Gelen Teklifler (İlan Sahibi Olarak)
            const q5 = query(collection(db, "teklifler"), where("ilanSahibiId", "==", uid), orderBy("tarih", "desc"));
            const s5 = await getDocs(q5);
            setGelenTeklifler(s5.docs.map(d => ({ id: d.id, ...d.data() })));

            // 6. Verdiğim Teklifler (Teklif Veren Olarak)
            const q6 = query(collection(db, "teklifler"), where("teklifVerenId", "==", uid), orderBy("tarih", "desc"));
            const s6 = await getDocs(q6);
            setVerdigimTeklifler(s6.docs.map(d => ({ id: d.id, ...d.data() })));

        } catch (err) {
            console.error("Veri çekme hatası:", err);
        }
    };

    // --- İŞLEMLER ---

    const ilanSil = async (koleksiyon, id, setFonksiyonu) => {
        if (window.confirm("Bu ilanı kalıcı olarak silmek istediğinize emin misiniz?")) {
            try {
                await deleteDoc(doc(db, koleksiyon, id));
                setFonksiyonu(prev => prev.filter(item => item.id !== id));
                alert("İlan silindi.");
            } catch (error) {
                console.error(error);
                alert("Silme başarısız.");
            }
        }
    };

    const durumuDegistir = async (id, yeniDurum) => {
        try {
            // Sadece Yük İlanları için (koleksiyon: 'ilanlar')
            // 'aktif', 'pasif' (İşi Verdim)
            await updateDoc(doc(db, "ilanlar", id), { durum: yeniDurum });

            setYukIlanlarim(prev => prev.map(ilan =>
                ilan.id === id ? { ...ilan, durum: yeniDurum } : ilan
            ));
            alert(yeniDurum === 'pasif' ? "İlan pasife alındı (İş Verildi). ✅" : "İlan tekrar aktif edildi.");
        } catch (error) {
            console.error("Durum güncelleme hatası:", error);
        }
    };

    const tekrarIlanVer = (ilan) => {
        // İlanEkle sayfasına veriyi gönder
        navigate('/ilan-ekle', { state: ilan });
    };

    const duzenleYonlendir = (ilan, tur) => {
        if (tur === 'Arac') {
            navigate('/arac-ekle', { state: ilan });
        } else if (tur === 'Sofor') {
            navigate('/sofor-ilani-ver', { state: ilan });
        } else if (tur === 'IsArama') {
            navigate('/surucu-is-arama-ekle', { state: ilan });
        }
    };

    const raporAlExcel = () => {
        let veri = [];
        let baslik = "Rapor";

        if (aktifSekme === 'yuk_ilanlari') { veri = yukIlanlarim; baslik = "Yuk_Ilanlarim"; }
        else if (aktifSekme === 'araclar') { veri = aracIlanlarim; baslik = "Arac_Ilanlarim"; }
        else if (aktifSekme === 'sofor_ilanlari') { veri = soforIlanlarim; baslik = "Sofor_Ilanlarim"; }
        else if (aktifSekme === 'teklifler') { veri = gelenTeklifler; baslik = "Gelen_Teklifler"; }

        if (veri.length === 0) return alert("İndirilecek veri yok.");

        // Veriyi Excel formatına hazırla (istenmeyen alanları çıkarabiliriz)
        const temizVeri = veri.map(({ ekleyen_id, ...rest }) => rest);

        const worksheet = XLSX.utils.json_to_sheet(temizVeri);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Rapor");
        XLSX.writeFile(workbook, `${baslik}_${new Date().toLocaleDateString()}.xlsx`);
    };

    const yazdir = () => {
        window.print();
    };

    const tarihFormatla = (ts) => {
        if (!ts) return "-";
        const date = ts.toDate ? ts.toDate() : new Date(ts);
        return date.toLocaleDateString('tr-TR');
    };

    if (yukleniyor) return <div className="text-center p-10">Yükleniyor...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">

            {/* --- ÜST KART --- */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-8 flex flex-col md:flex-row justify-between items-center gap-4 border border-gray-100 print:hidden">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-slate-900 text-yellow-500 rounded-full flex items-center justify-center text-3xl font-bold shadow-lg border-2 border-yellow-500">
                        {user?.displayName ? user.displayName.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">{user?.displayName}</h1>
                        <p className="text-gray-500 text-sm">{user?.email}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => navigate('/toplu-yukle')} className="bg-slate-700 text-white px-4 py-2 rounded hover:bg-slate-600 transition flex flex-col items-center justify-center gap-0 leading-tight">
                        <span className="font-bold">Toplu Yük Ekle</span>
                        <span className="text-[10px] opacity-80 font-normal">(Excel Formatı)</span>
                    </button>
                    <button onClick={raporAlExcel} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition flex items-center gap-2">
                        📊 Excel Rapor
                    </button>
                    <button onClick={yazdir} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition flex items-center gap-2">
                        🖨️ Yazdır
                    </button>
                    <button onClick={() => signOut(auth)} className="bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded hover:bg-red-600 hover:text-white transition">
                        Çıkış Yap
                    </button>
                </div>
            </div>

            {/* --- SEKMELER --- */}
            <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-2 print:hidden">
                {[
                    { id: 'yuk_ilanlari', label: `Yük İlanlarım (${yukIlanlarim.length})`, icon: '📦' },
                    { id: 'araclar', label: `Araçlarım (${aracIlanlarim.length})`, icon: '🚛' },
                    { id: 'sofor_ilanlari', label: `Şoför İlanlarım (${soforIlanlarim.length})`, icon: '📢' },
                    { id: 'is_arama', label: `İş Başvurularım (${isAramaIlanlarim.length})`, icon: '📄' },
                    { id: 'teklifler', label: `Gelen Teklifler (${gelenTeklifler.length})`, icon: '💬' },
                    { id: 'verdigim_teklifler', label: `Verdiğim Teklifler (${verdigimTeklifler.length})`, icon: '📤' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setAktifSekme(tab.id)}
                        className={`px-4 py-2 rounded-t-lg font-bold transition flex items-center gap-2 ${aktifSekme === tab.id ? 'bg-slate-800 text-yellow-500' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        <span>{tab.icon}</span> {tab.label}
                    </button>
                ))}
            </div>

            {/* --- İÇERİK ALANI --- */}
            <div className="min-h-[300px]">

                {/* 1. YÜK İLANLARI */}
                {aktifSekme === 'yuk_ilanlari' && (
                    <div className="space-y-4">
                        {yukIlanlarim.length === 0 && <p className="text-gray-500 text-center py-10">Henüz yük ilanı vermediniz.</p>}
                        {yukIlanlarim.map(ilan => (
                            <div key={ilan.id} className={`bg-white p-5 rounded-lg shadow-sm border transaction relative ${ilan.durum === 'pasif' ? 'border-l-4 border-l-red-500 opacity-75' : 'border-l-4 border-l-green-500'}`}>
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold text-lg text-slate-800">{ilan.nereden} ➝ {ilan.nereye}</h3>
                                            {ilan.durum === 'pasif' && <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded font-bold">Pasif / Verildi</span>}
                                            {ilan.durum !== 'pasif' && <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded font-bold">Aktif</span>}
                                        </div>
                                        <p className="text-sm text-gray-500">{tarihFormatla(ilan.tarih)} - {ilan.yukTipi} - {ilan.tonaj} Ton</p>
                                    </div>

                                    <div className="flex flex-wrap gap-2 print:hidden">
                                        {ilan.durum !== 'pasif' ? (
                                            <button onClick={() => durumuDegistir(ilan.id, 'pasif')} className="bg-slate-700 text-white px-3 py-1 rounded text-sm hover:bg-slate-600">
                                                🤝 İşi Verdim
                                            </button>
                                        ) : (
                                            <button onClick={() => tekrarIlanVer(ilan)} className="bg-yellow-500 text-slate-900 px-3 py-1 rounded text-sm font-bold hover:bg-yellow-400">
                                                🔄 Tekrar İlan Ver
                                            </button>
                                        )}

                                        <button onClick={() => navigate(`/ilan-duzenle/${ilan.id}`)} className="bg-blue-50 text-blue-600 border border-blue-200 px-3 py-1 rounded text-sm hover:bg-blue-100">
                                            ✏️ Düzenle
                                        </button>
                                        <button onClick={() => ilanSil("ilanlar", ilan.id, setYukIlanlarim)} className="bg-red-50 text-red-600 border border-red-200 px-3 py-1 rounded text-sm hover:bg-red-100">
                                            🗑️ Sil
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* 2. ARAÇ İLANLARI */}
                {aktifSekme === 'araclar' && (
                    <div className="space-y-4">
                        {aracIlanlarim.length === 0 && <p className="text-gray-500 text-center py-10">Kayıtlı aracınız yok.</p>}
                        {aracIlanlarim.map(arac => (
                            <div key={arac.id} className="bg-white p-4 rounded border flex justify-between items-center relative">
                                <div>
                                    <h3 className="font-bold">{arac.plaka || "Plaka Yok"} - {arac.aracTipi}</h3>
                                    <p className="text-sm text-gray-500">{arac.nereden} (Konum)</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => duzenleYonlendir(arac, 'Arac')} className="bg-blue-50 text-blue-600 border border-blue-200 px-3 py-1 rounded text-sm hover:bg-blue-100">
                                        ✏️ Düzenle
                                    </button>
                                    <button onClick={() => ilanSil("araclar", arac.id, setAracIlanlarim)} className="bg-red-50 text-red-600 border border-red-200 px-3 py-1 rounded text-sm hover:bg-red-100">
                                        🗑️ Sil
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}



                {/* 4. VERDİĞİM TEKLİFLER (YENİ) */}
                {aktifSekme === 'verdigim_teklifler' && (
                    <div className="space-y-4">
                        {verdigimTeklifler.length === 0 && <p className="text-gray-500 text-center py-10">Henüz bir teklif vermediniz.</p>}
                        {verdigimTeklifler.map(teklif => (
                            <div key={teklif.id} className="bg-white p-4 rounded border shadow-sm relative overflow-hidden">
                                {teklif.durum === 'bekliyor' && <div className="absolute top-0 right-0 bg-gray-200 text-gray-700 text-xs font-bold px-2 py-1 rounded-bl">Bekliyor ⏳</div>}
                                {teklif.durum === 'onaylandi' && <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-bl">Onaylandı ✅</div>}
                                {teklif.durum === 'reddedildi' && <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-bl">Reddedildi ❌</div>}

                                <h3 className="font-bold text-slate-800">{teklif.ilanBaslik || "İlan Başlığı Yok"}</h3>
                                <div className="text-lg font-bold text-yellow-600 my-1">{teklif.fiyat} ₺</div>
                                <p className="text-sm text-gray-600">Teklif Notunuz: "{teklif.aciklama}"</p>
                                <p className="text-xs text-gray-400 mt-2">{tarihFormatla(teklif.tarih)}</p>

                                {teklif.durum === 'onaylandi' && (
                                    <div className="mt-3 bg-green-50 text-green-800 p-2 rounded text-sm font-bold border border-green-200">
                                        🎉 Teklifiniz kabul edildi! İlan sahibi ile iletişime geçebilirsiniz.
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* 3. TEKLİFLER (Gelenler) */}
                {aktifSekme === 'teklifler' && (
                    <div className="space-y-4">
                        {gelenTeklifler.length === 0 && <p className="text-gray-500 text-center py-10">Gelen teklif yok.</p>}
                        {gelenTeklifler.map(teklif => (
                            <div key={teklif.id} className="bg-white p-4 rounded border-l-4 border-blue-500 shadow-sm">
                                <div className="flex justify-between">
                                    <div>
                                        <div className="text-xl font-bold">{teklif.fiyat} ₺</div>
                                        <div className="text-sm text-gray-600">Teklif Veren: <b>{teklif.teklifVerenAd}</b></div>
                                        <div className="text-sm italic mt-1 text-gray-500">"{teklif.aciklama}"</div>
                                    </div>
                                    <a href={`tel:${teklif.teklifVerenTel}`} className="bg-green-600 text-white h-10 px-4 rounded flex items-center gap-2 hover:bg-green-700 print:hidden">
                                        📞 Ara
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* DİĞER SEKMELER İÇİN BASİT LİSTELEME */}
                {(aktifSekme === 'sofor_ilanlari' || aktifSekme === 'is_arama') && (
                    <div className="space-y-4">
                        {(aktifSekme === 'sofor_ilanlari' && soforIlanlarim.length === 0) && <p className="text-center py-10 text-gray-500">Şoför ilanı vermediniz.</p>}
                        {(aktifSekme === 'is_arama' && isAramaIlanlarim.length === 0) && <p className="text-center py-10 text-gray-500">İş arama kaydınız yok.</p>}

                        {(aktifSekme === 'sofor_ilanlari' && soforIlanlarim.length > 0) && (
                            <div className="space-y-4">
                                {soforIlanlarim.map(i => (
                                    <div key={i.id} className="bg-white border p-4 rounded flex justify-between items-center relative">
                                        <div>
                                            <h3 className="font-bold text-slate-800">{i.baslik}</h3>
                                            <p className="text-sm text-gray-500">{i.sehir} - {i.ehliyet}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => duzenleYonlendir(i, 'Sofor')} className="bg-blue-50 text-blue-600 border border-blue-200 px-3 py-1 rounded text-sm hover:bg-blue-100">
                                                ✏️ Düzenle
                                            </button>
                                            <button onClick={() => ilanSil("sofor_ilanlari", i.id, setSoforIlanlarim)} className="bg-red-50 text-red-600 border border-red-200 px-3 py-1 rounded text-sm hover:bg-red-100">
                                                🗑️ Sil
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {(aktifSekme === 'is_arama' && isAramaIlanlarim.length > 0) && (
                            <div className="space-y-4">
                                {isAramaIlanlarim.map(i => (
                                    <div key={i.id} className="bg-white border p-4 rounded flex justify-between items-center relative">
                                        <div>
                                            <h3 className="font-bold text-slate-800">{i.adSoyad}</h3>
                                            <p className="text-sm text-gray-500">{i.ehliyet} - {i.tecrube} Yıl Tecrübe</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => duzenleYonlendir(i, 'IsArama')} className="bg-blue-50 text-blue-600 border border-blue-200 px-3 py-1 rounded text-sm hover:bg-blue-100">
                                                ✏️ Düzenle
                                            </button>
                                            <button onClick={() => ilanSil("surucu_is_arama", i.id, setIsAramaIlanlarim)} className="bg-red-50 text-red-600 border border-red-200 px-3 py-1 rounded text-sm hover:bg-red-100">
                                                🗑️ Sil
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
};

export default Profilim;