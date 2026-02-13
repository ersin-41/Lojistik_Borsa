import { Helmet } from 'react-helmet-async';

const SeoManager = ({ title, description, name }) => {
  return (
    <Helmet>
      {/* 1. Standart Başlık */}
      <title>{title} | Lojistik365</title>
      <meta name='description' content={description} />
      
      {/* 2. Sosyal Medya Kartları (LinkedIn'de paylaşınca güzel görünsün diye) */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      {/* Buraya projenin logosunun linkini koyarsan paylaşımda logo çıkar */}
      {/* <meta property="og:image" content="https://lojistik365.com.tr/logo.png" /> */}
      
      {/* 3. Twitter Kartları */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
    </Helmet>
  )
}

export default SeoManager;