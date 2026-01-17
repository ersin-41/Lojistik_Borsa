import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Sayfa adresi (pathname) her değiştiğinde pencereyi (0, 0) noktasına kaydır
    window.scrollTo(0, 0);
  }, [pathname]);

  return null; // Bu bileşenin görüntüsü yoktur, sadece işlevseldir
};

export default ScrollToTop;