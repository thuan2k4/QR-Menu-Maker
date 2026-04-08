import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, doc, writeBatch, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { Store } from '../../types';
import { User } from 'firebase/auth';
import { Plus, Store as StoreIcon, ChevronRight, Trash2, QrCode, Edit2, Loader2 } from 'lucide-react';
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
  const [confirmDialog, setConfirmDialog] = useState<{ message: string; storeName: string; onConfirm: () => void } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
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

  const handleDeleteStore = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    setConfirmDialog({
      message: 'Toàn bộ danh mục và món ăn liên quan sẽ bị xóa vĩnh viễn.',
      storeName: name,
      onConfirm: async () => {
        setIsDeleting(true);
        try {
          const batchItems: any[] = [];

          const catQ = query(collection(db, 'categories'), where('restaurantId', '==', id));
          const catSnap = await getDocs(catQ);
          catSnap.docs.forEach(d => batchItems.push(d.ref));

          const prodQ = query(collection(db, 'products'), where('restaurantId', '==', id));
          const prodSnap = await getDocs(prodQ);
          prodSnap.docs.forEach(d => batchItems.push(d.ref));

          batchItems.push(doc(db, 'restaurants', id));

          const chunks = [];
          for (let i = 0; i < batchItems.length; i += 500) {
            chunks.push(batchItems.slice(i, i + 500));
          }
          for (const chunk of chunks) {
            const batch = writeBatch(db);
            chunk.forEach(ref => batch.delete(ref));
            await batch.commit();
          }
        } catch (err) {
          console.error('Lỗi khi xoá liên đới cửa hàng:', err);
        } finally {
          setIsDeleting(false);
          setConfirmDialog(null);
        }
      }
    });
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
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-orange-50 p-3 rounded-2xl text-orange-500 shrink-0 shadow-sm border border-orange-100/50">
                  <StoreIcon size={20} />
                </div>
                {store.menuVisibility === 'private' ? (
                  <div className="bg-gray-50 text-gray-600 text-[11px] px-2.5 py-1 rounded-full border border-gray-200 flex items-center gap-1.5 font-bold shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                    <span className="whitespace-nowrap">Riêng tư</span>
                  </div>
                ) : (
                  <div className="bg-green-50 text-green-600 text-[11px] px-2.5 py-1 rounded-full border border-green-100 flex items-center gap-1.5 font-bold shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-[pulse_2s_ease-in-out_infinite]"></span>
                    <span className="whitespace-nowrap">Đang hoạt động</span>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/dashboard/store/${store.id}`); // This is correct, but just reusing logic. It's actually meant to go to dashboard.
                  }}
                  className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-all rounded-xl opacity-0 group-hover:opacity-100 shadow-sm"
                  aria-label="Chỉnh sửa"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  type="button"
                  onClick={(e) => handleDeleteStore(e, store.id, store.name)}
                  className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all rounded-xl focus-visible:ring-2 focus-visible:ring-red-300 hover:shadow-sm"
                  aria-label={`Xóa cửa hàng ${store.name}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
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
          <div className="col-span-full bg-white p-16 rounded-3xl border border-dashed border-gray-200 text-center flex flex-col items-center justify-center">
            <div className="bg-orange-50 w-24 h-24 rounded-full flex items-center justify-center mb-6">
              <StoreIcon className="text-orange-500 w-12 h-12" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Chưa có cửa hàng nào</h3>
            <p className="text-gray-500 max-w-sm mb-8">
              Bắt đầu hành trình tạo Menu số thông minh của bạn bằng cách thiết lập cửa hàng đầu tiên ngay bây giờ.
            </p>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="flex min-h-[44px] items-center justify-center gap-2 bg-orange-500 text-white px-8 py-3.5 rounded-full font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-200 focus-visible:ring-2 focus-visible:ring-orange-400"
            >
              <Plus size={20} /> Tạo cửa hàng đầu tiên
            </button>
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

      {/* Custom Confirm Modal for store deletion */}
      {confirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-6">
              <div className="flex items-start gap-4 mb-2">
                <div className="shrink-0 w-10 h-10 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 border border-red-100">
                  <Trash2 size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Xóa cửa hàng "{confirmDialog.storeName}"?</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{confirmDialog.message}</p>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setConfirmDialog(null)}
                  disabled={isDeleting}
                  className="flex-1 py-3 rounded-2xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-all disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={confirmDialog.onConfirm}
                  disabled={isDeleting}
                  className="flex-1 py-3 rounded-2xl bg-red-500 text-white font-bold hover:bg-red-600 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <><Loader2 size={16} className="animate-spin" /> Đang xóa...</>
                  ) : (
                    'Xóa cửa hàng'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
