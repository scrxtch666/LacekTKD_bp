import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  X,
  Images,
  Calendar,
  User,
  ArrowLeft,
  ZoomIn,
  Pencil,
} from "lucide-react";
import { createPortal } from "react-dom";
import NotFound from "../Login/NotFound";
import config from "../../../config";

const API = config.API_URL;
const getImageUrl = (path) => `${API}${path}`;

const PhotoGallery = ({ photos }) => {
  const [lightbox, setLightbox] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  if (!photos?.length) return null;

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightbox(getImageUrl(photos[index].img_path));
  };

  const prev = (e) => {
    e.stopPropagation();
    const newIndex = (lightboxIndex - 1 + photos.length) % photos.length;
    setLightboxIndex(newIndex);
    setLightbox(getImageUrl(photos[newIndex].img_path));
  };

  const next = (e) => {
    e.stopPropagation();
    const newIndex = (lightboxIndex + 1) % photos.length;
    setLightboxIndex(newIndex);
    setLightbox(getImageUrl(photos[newIndex].img_path));
  };

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            onClick={() => openLightbox(index)}
            className="relative group aspect-square overflow-hidden rounded-xl cursor-pointer"
          >
            <img
              src={`${API}${photo.img_path}`}
              alt=""
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
              <ZoomIn
                size={24}
                className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              />
            </div>
          </div>
        ))}
      </div>

      {lightbox &&
        createPortal(
          <div
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setLightbox(null)}
          >
            <button
              onClick={() => setLightbox(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 bg-white/10 rounded-full p-2"
            >
              <X size={24} />
            </button>

            {photos.length > 1 && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-4 text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition-colors"
                >
                  ‹
                </button>
                <button
                  onClick={next}
                  className="absolute right-4 text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition-colors"
                >
                  ›
                </button>
              </>
            )}

            <img
              src={lightbox}
              alt=""
              className="max-h-[85vh] max-w-[85vw] object-contain rounded-xl"
              onClick={(e) => e.stopPropagation()}
            />

            <p className="absolute bottom-4 text-white/60 text-sm">
              {lightboxIndex + 1} / {photos.length}
            </p>
          </div>,
          document.body,
        )}
    </>
  );
};

function AktualitaDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`${API}/api/events/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Aktualita nenalezena");
        return res.json();
      })
      .then((data) => {
        setEvent(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setEvent(null);
        setLoading(false);
      });
  }, [id]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        Načítám...
      </div>
    );

  if (!event) return <NotFound />;

  return (
    <div className="max-w-4xl space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-customGreen transition-colors"
      >
        <ArrowLeft size={16} />
        Zpět na aktuality
      </button>

      <div className="bg-customWhite rounded-2xl shadow-md overflow-hidden">
        {event.photo && (
          <div className="h-72 sm:h-96 overflow-hidden">
            <img
              src={`${API}${event.photo}`}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-6 space-y-4">
          <h1 className="text-2xl font-bold text-gray-800">{event.title}</h1>

          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            {event.date_start_formatted && (
              <div className="flex items-center gap-1.5">
                <Calendar size={15} className="text-customGreen" />
                <span>{event.date_start_formatted}</span>
              </div>
            )}
            {event.author && (
              <div className="flex items-center gap-1.5">
                <User size={15} className="text-customGreen" />
                <span>{event.author}</span> •
                {event.created_at_formatted && (
                  <div className="flex items-center gap-1.5">
                    <Pencil size={10} className="text-gray-400" />
                    <span className="text-gray-400 text-xs">
                      {event.created_at_formatted}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="border-t border-gray-100 pt-4">
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {event.body}
            </p>
          </div>
        </div>
      </div>

      {event.photos?.length > 0 && (
        <div className="bg-customWhite rounded-2xl shadow-md p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Images size={18} className="text-customGreen" />
            <h2 className="font-semibold text-gray-700">
              Fotogalerie
              <span className="text-gray-400 font-normal text-sm ml-2">
                ({event.photos.length}{" "}
                {event.photos.length === 1
                  ? "fotka"
                  : event.photos.length <= 4
                    ? "fotky"
                    : "fotek"}
                )
              </span>
            </h2>
          </div>
          <PhotoGallery photos={event.photos} />
        </div>
      )}
    </div>
  );
}

export default AktualitaDetail;
