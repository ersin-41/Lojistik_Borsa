# 🚛 Lojistik365 - Türkiye'nin Dijital Lojistik Ağı

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Firebase](https://img.shields.io/badge/Firebase-039BE5?style=for-the-badge&logo=Firebase&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-Ready-purple?style=for-the-badge&logo=pwa&logoColor=white)

**Lojistik365**, yük sahiplerini, nakliyecileri ve profesyonel sürücüleri (Tır, Kamyon, Tanker, Silobas) tek bir çatı altında toplayan, 7/24 yaşayan modern bir lojistik platformudur.

## 🚀 Proje Hakkında

Geleneksel nakliye borsalarından farklı olarak **Lojistik365**, sadece kuru yükü değil; tehlikeli madde (SRC 5), tanker ve silobas taşımacılığı gibi spesifik alanları da kapsar. **PWA (Progressive Web App)** altyapısı sayesinde mobil uygulama gibi çalışır.

🔗 **Canlı Demo:** [https://lojistikborsa.netlify.app](https://lojistikborsa.netlify.app)

## ✨ Yenilikler ve Öne Çıkan Özellikler

### 📱 Mobil ve Teknoloji
* **PWA Desteği:** Uygulama mağazasına gerek kalmadan "Ana Ekrana Ekle" diyerek telefona yüklenebilir.
* **Tam Mobil Uyumluluk:** Her cihazda kusursuz çalışan responsive tasarım.
* **Scroll-to-Top:** Sayfa geçişlerinde akıcı kullanıcı deneyimi (UX).

### 🚛 Lojistik ve Operasyon
* **🔥 SRC 5 ve Tanker Desteği:** Tehlikeli madde ve özel yük taşıyan sürücüler için özel filtreleme ve "Kırmızı Etiket" sistemi.
* **Çoklu İlan Yönetimi:** Yük, Boş Araç, Şoför Arayan ve İş Arayan ilanlarının tek panelden yönetimi.
* **📊 Gelişmiş Raporlama:** Profil sayfasından ilanların **Excel (XLSX)** formatında raporlanması ve yazdırılması.
* **Akıllı Filtreleme:** Şehir, araç tipi ve yük tipine göre anlık arama.

### 🏢 Kurumsal Altyapı
* **Güvenli Kimlik Doğrulama:** Firebase Auth ile güvenli giriş/kayıt.
* **Veri Güvenliği:** Firestore Security Rules ile veritabanı koruması.
* **Yasal Sayfalar:** Gizlilik Politikası ve Kullanım Şartları sayfaları entegre edildi.

## 🛠️ Kullanılan Teknolojiler

* **Frontend:** React.js 19, Vite
* **Styling:** Tailwind CSS
* **Backend:** Google Firebase (Auth, Firestore)
* **Routing:** React Router Dom v6
* **Veri İşleme:** SheetJS (Excel Çıktısı), React-Firebase-Hooks
* **Deploy:** Netlify (CI/CD)

## 📸 Ekran Görüntüleri

| Ana Sayfa | Sürücü İlanları (SRC 5) | Profil Paneli |
|-----------|-------------------------|---------------|
| ![Home](/screenshots/home.png) | ![Drivers](/screenshots/drivers.png) | ![Profile](/screenshots/profile.png) |

## ⚙️ Kurulum (Local'de Çalıştırma)

Projeyi kendi bilgisayarınızda geliştirmek için:

1.  **Projeyi Klonlayın:**
    ```bash
    git clone [https://github.com/ersin-41/Lojistik_Borsa.git](https://github.com/ersin-41/Lojistik_Borsa.git)
    cd Lojistik_Borsa
    ```

2.  **Bağımlılıkları Yükleyin:**
    ```bash
    npm install
    ```
    *(Not: Versiyon hatası alırsanız `.npmrc` dosyası otomatik olarak `legacy-peer-deps` ayarını yapacaktır.)*

3.  **Firebase Ayarları:**
    `src/firebase.js` dosyasına kendi Firebase proje yapılandırma kodlarınızı ekleyin.

4.  **Projeyi Başlatın:**
    ```bash
    npm run dev
    ```

## 🌍 Canlıya Alma (Deployment)

Proje **Netlify** üzerinde barındırılmaktadır.
* **Build Command:** `npm run build`
* **Publish Directory:** `dist`
* **Environment Variables:** `NPM_FLAGS = --legacy-peer-deps` (Netlify ayarlarında tanımlı)

## 🤝 İletişim

Geliştirici: **Ersin Açıkgöz**
* LinkedIn: [https://www.linkedin.com/in/ersin-a%C3%A7ikg%C3%B6z-91090a221/]
* E-posta: ersn.ack41@gmail.com

---
© 2026 Lojistik365 Platformu. Tüm hakları saklıdır.