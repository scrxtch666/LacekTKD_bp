import React, { useState, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import config from "../../../config";

const API = config.API_URL;

function ShowcaseCarousel() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  const [emblaRef] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 5000, stopOnInteraction: false }),
  ]);

  useEffect(() => {
    fetch(`${API}/api/banner?active=true`)
      .then((response) => response.json())
      .then((data) => {
        setBanners(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Chyba při načítání dat:", error);
        setBanners([]);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>Načítám data...</div>;
  }

  if (!banners.length) {
    return null;
  }

  return (
    <div className="overflow-hidden rounded-2xl" ref={emblaRef}>
      <div className="flex">
        {banners.map((banner) => (
          <div
            key={banner.id}
            className="relative min-w-full h-[300px] md:h-[400px] lg:h-96 overflow-hidden bg-customBlack"
          >
            <img
              src={`${API}${banner.img_path}`}
              alt={banner.banner_name}
              className="w-full h-full object-cover brightness-50 opacity-75"
            />

            <div className="absolute inset-0 flex items-center">
              <div className="px-4 md:px-8 lg:px-12 text-white">
                <p className="text-xl md:text-2xl lg:text-3xl mb-2 font-sans">
                  Sportovní klub
                </p>
                <p className="text-3xl md:text-4xl lg:text-5xl font-mono">
                  Taekwondo
                  <span className="text-customGreen font-sans">Lacek</span>
                </p>
                <p className="text-base md:text-lg mt-2 font-sans">
                  Taekwondo - rychleji, výš, silněji, ...
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ShowcaseCarousel;
