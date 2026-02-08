import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { storage, db } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc } from "firebase/firestore";

const TeslimatBildir = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const teklif = location.state;

    const [irsaliyeNo, setIrsaliyeNo] = useState('');
    const [teslimTarihi, setTeslimTarihi] = useState('');
    const [teslimSaati, setTeslimSaati] = useState(''); // YENİ: Saat State'i
    const [teslimAlan, setTeslimAlan] = useState('');
    const [tcNo, setTcNo] = useState('');
    const [dosya, setDosya] = useState(null);
    const [yukleniyor, setYukleniyor] = useState(false);

    if (!teklif) {
        return <div className="p-10 text-center">İşlem yapılacak teklif bulunamadı.</div>;
    }

    const dosyaSec = (e) => {
        if (e.target.files[0]) {
            setDosya(e.target.files[0]);
        }
    };

    const gonder = async (e) => {
        e.preventDefault();
        if (!dosya || !irsaliyeNo || !teslimTarihi || !teslimSaati || !teslimAlan) {
            alert("Lütfen zorunlu alanları doldurun ve evrak yükleyin.");
            return;
        }

        setYukleniyor(true);
        try {
            // 1. Dosyayı Storage'a Yükle
            const storageRef = ref(storage, `teslimat_evraklari/${teklif.id}_${dosya.name}`);
            await uploadBytes(storageRef, dosya);
            const downloadURL = await getDownloadURL(storageRef);

            // 2. Firestore'da Teklifi Güncelle
            const teklifRef = doc(db, "teklifler", teklif.id);
            await updateDoc(teklifRef, {
                teslimat: {
                    durum: true,
                    tarih: teslimTarihi,
                    saat: teslimSaati, // YENİ
                    irsaliyeNo: irsaliyeNo,
                    teslimAlan: teslimAlan,
                    tcNo: tcNo,
                    evrakUrl: downloadURL,
                    yuklenmeZamani: new Date().toISOString()
                }
            });

            alert("Teslimat başarıyla bildirildi! ✅");
            navigate('/profilim');

        } catch (error) {
            console.error("Hata:", error);
            alert("Bir hata oluştu: " + error.message);
        } finally {
            setYukleniyor(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto py-10 px-4">
            <h1 className="text-2xl font-bold mb-6 text-slate-800">Teslimat Bildirimi 🚚</h1>
            <p className="mb-6 text-gray-600">
                <b>{teklif.ilanBaslik}</b> işi için teslimat detaylarını giriniz.
            </p>

            <form onSubmit={gonder} className="space-y-4 bg-white p-6 rounded-lg shadow-md border">
                <div>
                    <label className="block text-sm font-bold mb-1">Teslimat Evrakı (Fotoğraf/PDF) <span className="text-red-500">*</span></label>
                    <input type="file" onChange={dosyaSec} className="w-full border p-2 rounded" accept="image/*,application/pdf" />
                </div>

                <div>
                    <label className="block text-sm font-bold mb-1">İrsaliye No <span className="text-red-500">*</span></label>
                    <input type="text" value={irsaliyeNo} onChange={(e) => setIrsaliyeNo(e.target.value)} className="w-full border p-2 rounded" placeholder="Örn: A-123456" required />
                </div>

                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-bold mb-1">Teslim Tarihi <span className="text-red-500">*</span></label>
                        <input type="date" value={teslimTarihi} onChange={(e) => setTeslimTarihi(e.target.value)} className="w-full border p-2 rounded" required />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-bold mb-1">Teslim Saati <span className="text-red-500">*</span></label>
                        <input type="time" value={teslimSaati} onChange={(e) => setTeslimSaati(e.target.value)} className="w-full border p-2 rounded" required />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold mb-1">Teslim Alan Ad Soyad <span className="text-red-500">*</span></label>
                    <input type="text" value={teslimAlan} onChange={(e) => setTeslimAlan(e.target.value)} className="w-full border p-2 rounded" placeholder="Teslim alan kişi" required />
                </div>

                <div>
                    <label className="block text-sm font-bold mb-1">Teslim Alan TC No (Opsiyonel)</label>
                    <input type="text" value={tcNo} onChange={(e) => setTcNo(e.target.value)} className="w-full border p-2 rounded" placeholder="Varsa giriniz" maxLength={11} />
                </div>

                <button type="submit" disabled={yukleniyor} className="w-full bg-green-600 text-white font-bold py-3 rounded hover:bg-green-700 transition disabled:opacity-50">
                    {yukleniyor ? 'Yükleniyor...' : 'Teslimatı Onayla ve Gönder'}
                </button>
            </form>
        </div>
    );
};

export default TeslimatBildir;
