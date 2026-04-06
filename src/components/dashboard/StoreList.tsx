import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Store } from '../../types';
import { User } from 'firebase/auth';
import { Plus, Store as StoreIcon, ChevronRight, Trash2, QrCode } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface StoreListProps {
  user: User;
}

export default function StoreList({ user }: StoreListProps) {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStoreName, setNewStoreName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(collection(db, 'restaurants'), where('ownerId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setStores(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Store)));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user.uid]);

  const handleAddStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoreName.trim()) return;
    setIsCreating(true);
    try {
      const slug = newStoreName.toLowerCase().trim().replace(/ /g, '-').replace(/[^\w-]+/g, '') + '-' + Math.random().toString(36).substring(2, 7);
      const docRef = await addDoc(collection(db, 'restaurants'), {
        name: newStoreName,
        slug,
        ownerId: user.uid,
        bio: '',
        logoUrl: '',
        coverUrl: '',
        createdAt: new Date().toISOString()
      });
      setNewStoreName('');
      setShowAddModal(false);
      navigate(`/dashboard/store/${docRef.id}`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteStore = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Bạn có chắc chắn muốn xóa cửa hàng này? Dữ liệu menu cũng sẽ bị mất.')) {
      await deleteDoc(doc(db, 'restaurants', id));
    }
  };

  const handleCardKeyDown = (event: React.KeyboardEvent, id: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      navigate(`/dashboard/store/${id}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">Cửa hàng của tôi</h2>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="flex min-h-[44px] items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-2xl font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-200 focus-visible:ring-2 focus-visible:ring-orange-400"
        >
          <Plus size={20} /> Thêm cửa hàng
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stores.map(store => (
          <div
            key={store.id}
            onClick={() => navigate(`/dashboard/store/${store.id}`)}
            onKeyDown={(event) => handleCardKeyDown(event, store.id)}
            role="button"
            tabIndex={0}
            aria-label={`Mở trang quản lý cho cửa hàng ${store.name}`}
            className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group relative focus-visible:ring-2 focus-visible:ring-orange-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="bg-orange-50 p-3 rounded-2xl text-orange-500">
                <StoreIcon size={24} />
              </div>
              <button
                type="button"
                onClick={(e) => handleDeleteStore(e, store.id)}
                className="p-2 text-gray-300 hover:text-red-500 transition-colors rounded-full focus-visible:ring-2 focus-visible:ring-red-300"
                aria-label={`Xóa cửa hàng ${store.name}`}
              >
                <Trash2 size={18} />
              </button>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">{store.name}</h3>
            <p className="text-sm text-gray-400 mb-6 truncate">/m/{store.slug}</p>

            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                <QrCode size={14} /> Quản lý QR & Menu
              </div>
              <ChevronRight size={18} className="text-gray-300 group-hover:text-orange-500 transition-colors" />
            </div>
          </div>
        ))}

        {stores.length === 0 && (
          <div className="col-span-full bg-white p-12 rounded-3xl border border-dashed border-gray-200 text-center">
            <p className="text-gray-400">Bạn chưa có cửa hàng nào. Hãy tạo cửa hàng đầu tiên!</p>
          </div>
        )}
      </div>

      {/* Add Store Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-xl font-bold">Thêm cửa hàng mới</h3>
              <button type="button" onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-900 rounded-full focus-visible:ring-2 focus-visible:ring-orange-300" aria-label="Đóng cửa sổ tạo cửa hàng">
                <Plus size={24} className="rotate-45" />
              </button>
            </div>
            <form onSubmit={handleAddStore} className="p-6 space-y-6">
              <div>
                <label htmlFor="new-store-name" className="block text-sm font-bold text-gray-700 mb-2">Tên cửa hàng</label>
                <input
                  id="new-store-name"
                  type="text"
                  required
                  autoFocus
                  value={newStoreName}
                  onChange={(e) => setNewStoreName(e.target.value)}
                  placeholder="Ví dụ: My Coffee Shop"
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={isCreating || !newStoreName.trim()}
                className="w-full min-h-[44px] bg-orange-500 text-white py-4 rounded-2xl font-bold hover:bg-orange-600 transition-all disabled:opacity-50"
              >
                {isCreating ? 'Đang tạo...' : 'Tạo cửa hàng'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
