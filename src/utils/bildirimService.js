import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Kullanıcıya bildirim gönderir.
 * @param {string} userId - Bildirimin gideceği kullanıcının ID'si
 * @param {string} mesaj - Bildirim metni
 * @param {string} tip - 'bilgi', 'basari', 'uyari' (İkon rengi için)
 * @param {string} link - Tıklayınca gideceği sayfa (Opsiyonel)
 */
export const bildirimGonder = async (userId, mesaj, tip = 'bilgi', link = null) => {
  try {
    await addDoc(collection(db, "bildirimler"), {
      userId: userId,
      mesaj: mesaj,
      tip: tip,
      link: link,
      okundu: false,
      tarih: serverTimestamp() // Sunucu saatini kullanır
    });
    console.log("Bildirim gönderildi!");
  } catch (error) {
    console.error("Bildirim hatası:", error);
  }
};