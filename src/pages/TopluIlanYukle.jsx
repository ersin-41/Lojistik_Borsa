import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { db, auth } from '../firebase';
import { collection, writeBatch, doc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';

const TopluIlanYukle = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [veriler, setVeriler] = useState([]);
    const [yukleniyor, setYukleniyor] = useState(false);
    const [hata, setHata] = useState('');

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (!currentUser) {
                alert("Giriş yapmalısınız!");
                navigate('/giris');
            } else {
                setUser(currentUser);
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    // Excel Tarih Formatı Dönüştürücü (Serial Number veya String)
    const excelTarihiniCevir = (excelDate) => {
        if (!excelDate) return '';

        // 1. Durum: Excel Serial Number (Örn: 46060 -> 2026-02-09)
        if (typeof excelDate === 'number') {
            // Excel 1900 epoch: 25569 gün farkı vardır
            const date = new Date((excelDate - 25569) * 86400 * 1000);
            return date.toISOString().split('T')[0];
        }

        // 2. Durum: String "GG/AA/YYYY" veya "GG.AA.YYYY" (Örn: "20/05/2026")
        if (typeof excelDate === 'string') {
            const separator = excelDate.includes('/') ? '/' : '.';
            const parts = excelDate.split(separator);

            if (parts.length === 3) {
                // GG/AA/YYYY formatında varsayıyoruz
                const gun = parts[0].padStart(2, '0');
                const ay = parts[1].padStart(2, '0');
                const yil = parts[2];

                // YYYY-MM-DD olarak döndür
                return `${yil}-${ay}-${gun}`;
            }
        }

        return excelDate; // Tanınmazsa olduğu gibi döndür
    };

    const dosyaYukle = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const bstr = evt.target.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const data = XLSX.utils.sheet_to_json(ws);
            setVeriler(data);
        };
        reader.readAsBinaryString(file);
    };

    const verileriKaydet = async () => {
        if (veriler.length === 0) return alert("Yüklenecek veri yok!");
        if (!user) return alert("Oturum açmalısınız!");

        setYukleniyor(true);
        setHata('');

        try {
            const batch = writeBatch(db);

            veriler.forEach((satir) => {
                // Excel sütun isimleri ile veritabanı alanlarını eşleştiriyoruz
                const tarihRaw = satir['Tarih'];
                const formatliTarih = excelTarihiniCevir(tarihRaw);

                const docRef = doc(collection(db, "ilanlar"));
                batch.set(docRef, {
                    nereden: satir['Nereden'] || '',
                    nereye: satir['Nereye'] || '',
                    yuklemeTarihi: formatliTarih,
                    yukTipi: satir['YukTipi'] || 'Paletli',
                    aracTipi: satir['AracTipi'] || 'Tır',
                    kasaTipi: satir['KasaTipi'] || 'Standart',
                    tonaj: satir['Tonaj'] ? String(satir['Tonaj']) : '0',
                    odemeSekli: satir['Odeme'] || 'Peşin',
                    aciklama: satir['Aciklama'] || 'Toplu yükleme ile eklendi.',
                    mesafe: satir['Mesafe'] || '',
                    teslimatAdresi: satir['TeslimatAdresi'] || '',
                    yuklemeAdresi: satir['YuklemeAdresi'] || '',
                    ekleyen_id: user.uid,
                    ekleyen_ad: user.displayName || "Kurumsal Üye",
                    ekleyen_email: user.email,
                    durum: 'aktif',
                    tarih: serverTimestamp()
                });
            });

            await batch.commit();
            alert(`${veriler.length} adet ilan başarıyla yüklendi! 🚀`);
            navigate('/profilim');

        } catch (err) {
            console.error(err);
            setHata("Kaydederken bir hata oluştu: " + err.message);
        } finally {
            setYukleniyor(false);
        }
    };

    // Örnek Şablon Oluşturma ve İndirme
    const ornekSablonIndir = () => {
        const ornekVeri = [
            {
                "Nereden": "İstanbul",
                "Nereye": "Ankara",
                "Tarih": "20/05/2026",
                "YukTipi": "Paletli",
                "AracTipi": "Tır",
                "KasaTipi": "Standart",
                "Tonaj": 25,
                "Odeme": "Peşin",
                "Mesafe": 450,
                "Aciklama": "Hassas yük",
                "YuklemeAdresi": "Organize San. 1. Cad",
                "TeslimatAdresi": "Ostim A Blok"
            }
        ];
        const ws = XLSX.utils.json_to_sheet(ornekVeri);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sablon");
        XLSX.writeFile(wb, "Lojistik365_Yuk_Sablonu.xlsx");
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="bg-white p-8 rounded-lg shadow-lg border-t-4 border-green-500">
                <h1 className="text-3xl font-bold text-slate-800 mb-2">Excel ile Toplu Yük Ekle</h1>
                <p className="text-gray-500 mb-8">Binlerce ilanı tek tıkla sisteme yükleyin.</p>

                <div className="flex flex-col md:flex-row gap-4 mb-8 items-end">
                    <div className="flex-1">
                        <label className="block font-bold text-gray-700 mb-2">1. Adım: Şablonu İndirin</label>
                        <button onClick={ornekSablonIndir} className="bg-gray-100 text-gray-700 px-4 py-3 rounded border border-gray-300 hover:bg-gray-200 w-full text-left flex items-center gap-2">
                            📥 Örnek Excel Şablonunu İndir
                        </button>
                    </div>

                    <div className="flex-1">
                        <label className="block font-bold text-gray-700 mb-2">2. Adım: Dosyanızı Seçin</label>
                        <input type="file" accept=".xlsx, .xls" onChange={dosyaYukle} className="block w-full text-sm text-slate-500
                file:mr-4 file:py-3 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-green-50 file:text-green-700
                hover:file:bg-green-100
                "/>
                    </div>
                </div>

                {veriler.length > 0 && (
                    <div className="mb-8 overflow-x-auto">
                        <h3 className="font-bold text-lg mb-4">Önizleme ({veriler.length} İlan)</h3>
                        <table className="min-w-full text-sm text-left text-gray-500 border">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3">Nereden</th>
                                    <th className="px-6 py-3">Nereye</th>
                                    <th className="px-6 py-3">Tonaj</th>
                                    <th className="px-6 py-3">Araç</th>
                                    <th className="px-6 py-3">Tarih</th>
                                </tr>
                            </thead>
                            <tbody>
                                {veriler.slice(0, 5).map((satir, i) => (
                                    <tr key={i} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 font-bold">{satir['Nereden']}</td>
                                        <td className="px-6 py-4 font-bold">{satir['Nereye']}</td>
                                        <td className="px-6 py-4">{satir['Tonaj']}</td>
                                        <td className="px-6 py-4">{satir['AracTipi']}</td>
                                        <td className="px-6 py-4">
                                            <span className="block text-xs text-gray-400">{satir['Tarih']}</span>
                                            <span className="font-bold text-green-600">{excelTarihiniCevir(satir['Tarih'])}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <p className="text-xs text-gray-400 mt-2">* Sadece ilk 5 satır önizleme amaçlı gösterilmektedir.</p>
                    </div>
                )}

                {hata && <div className="bg-red-100 text-red-700 p-4 rounded mb-4">{hata}</div>}

                <div className="flex justify-end">
                    <button
                        onClick={verileriKaydet}
                        disabled={yukleniyor || veriler.length === 0}
                        className={`px-8 py-4 rounded font-bold text-white shadow-lg transition transform hover:scale-105 ${yukleniyor || veriler.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                    >
                        {yukleniyor ? 'Yükleniyor...' : `🚀 ${veriler.length} İlanı Sisteme Yükle`}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default TopluIlanYukle;
