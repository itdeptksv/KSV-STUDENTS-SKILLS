import { useEffect, useState } from 'react';
import { gallery as galleryApi } from '../../services';
import PublicLayout from '../../components/layouts/PublicLayout';
import { PageLoader } from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import { Image } from 'lucide-react';

export default function GalleryPage() {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [items, setItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(false);

  useEffect(() => {
    galleryApi.listAlbums().then((r) => setAlbums(r.data.data || [])).finally(() => setLoading(false));
  }, []);

  const openAlbum = async (album) => {
    setSelectedAlbum(album);
    setItemsLoading(true);
    galleryApi.listItems(album._id).then((r) => setItems(r.data.data || [])).finally(() => setItemsLoading(false));
  };

  if (loading) return <PublicLayout><PageLoader /></PublicLayout>;

  return (
    <PublicLayout>
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-[#1e3a5f] mb-2">Skills Exhibition Gallery</h1>
        <p className="text-slate-500 mb-8">Approved student work and achievements.</p>

        {selectedAlbum ? (
          <div>
            <button onClick={() => setSelectedAlbum(null)} className="text-blue-600 hover:text-blue-700 text-sm mb-4 flex items-center gap-1">
              ← Back to Albums
            </button>
            <h2 className="text-xl font-semibold text-slate-800 mb-6">{selectedAlbum.title}</h2>
            {itemsLoading ? <PageLoader /> : items.length === 0 ? (
              <EmptyState title="No items in this album" />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {items.map((item) => (
                  <div key={item._id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    {item.path ? (
                      <img src={`/${item.path}`} alt={item.title} className="w-full h-40 object-cover" />
                    ) : item.externalUrl ? (
                      <div className="w-full h-40 bg-slate-100 flex items-center justify-center">
                        <a href={item.externalUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm">View Video</a>
                      </div>
                    ) : (
                      <div className="w-full h-40 bg-slate-100 flex items-center justify-center">
                        <Image size={32} className="text-slate-300" />
                      </div>
                    )}
                    <div className="p-3">
                      <p className="text-sm font-medium text-slate-700">{item.title}</p>
                      {item.caption && <p className="text-xs text-slate-400 mt-0.5">{item.caption}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : albums.length === 0 ? (
          <EmptyState title="No gallery albums yet" description="Approved student work will appear here." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {albums.map((album) => (
              <button key={album._id} onClick={() => openAlbum(album)}
                className="bg-white rounded-xl border border-slate-200 p-6 text-left hover:shadow-md transition-shadow">
                {album.coverImage ? (
                  <img src={`/${album.coverImage}`} alt={album.title} className="w-full h-36 object-cover rounded-lg mb-4" />
                ) : (
                  <div className="w-full h-36 bg-slate-100 rounded-lg mb-4 flex items-center justify-center">
                    <Image size={32} className="text-slate-300" />
                  </div>
                )}
                <h3 className="font-semibold text-slate-800">{album.title}</h3>
                {album.description && <p className="text-sm text-slate-500 mt-1">{album.description}</p>}
              </button>
            ))}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
