import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { MenuItem } from '../../types';
import {
  BookOpen,
  Plus,
  Pencil,
  Trash2,
  Check,
  Flame,
  Leaf,
  Sparkles,
  DollarSign,
  Eye,
  EyeOff,
} from 'lucide-react';

export const MenuManager: React.FC = () => {
  const {
    activeTenant,
    categories,
    items,
    addCategory,
    deleteCategory,
    saveMenuItem,
    deleteMenuItem,
    toggleItemAvailability,
  } = useStore();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [newCategoryName, setNewCategoryName] = useState<string>('');
  const [showItemModal, setShowItemModal] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<Partial<MenuItem> | null>(null);

  const filteredItems =
    selectedCategoryId === 'all'
      ? items
      : items.filter((i) => i.categoryId === selectedCategoryId);

  const handleOpenAdd = () => {
    setEditingItem({
      categoryId: categories[0]?.id || '',
      name: '',
      price: 6.0,
      description: '',
      imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
      isVeg: true,
      isVegan: false,
      isGlutenFree: false,
      isSpicy: false,
      isBestseller: false,
      isAvailable: true,
      calories: 250,
    });
    setShowItemModal(true);
  };

  const handleOpenEdit = (item: MenuItem) => {
    setEditingItem({
      ...item,
      name: item.name || '',
      categoryId: item.categoryId || categories[0]?.id || '',
      price: item.price ?? 0,
      description: item.description || '',
      imageUrl: item.imageUrl || '',
      isVeg: item.isVeg ?? true,
      isVegan: item.isVegan ?? false,
      isGlutenFree: item.isGlutenFree ?? false,
      isSpicy: item.isSpicy ?? false,
      isBestseller: item.isBestseller ?? false,
      isAvailable: item.isAvailable ?? true,
      calories: item.calories ?? 250,
    });
    setShowItemModal(true);
  };

  const handleSaveItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem?.name || !editingItem?.categoryId) return;
    saveMenuItem(editingItem as MenuItem);
    setShowItemModal(false);
    setEditingItem(null);
  };

  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    addCategory(newCategoryName);
    setNewCategoryName('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-500" /> Digital Menu & Pricing Manager
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage food & drink categories, pricing, dietary flags, and real-time 86/out-of-stock toggles.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20 transition active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Menu Item</span>
        </button>
      </div>

      {/* Category Pills & Quick Add */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setSelectedCategoryId('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedCategoryId === 'all'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              All Items ({items.length})
            </button>

            {categories.map((c) => {
              const count = items.filter((i) => i.categoryId === c.id).length;
              return (
                <div key={c.id} className="flex items-center">
                  <button
                    onClick={() => setSelectedCategoryId(c.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                      selectedCategoryId === c.id
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <span>{c.name}</span>
                    <span className="text-[10px] opacity-75">({count})</span>
                  </button>
                  {categories.length > 1 && (
                    <button
                      onClick={() => deleteCategory(c.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 transition ml-0.5"
                      title="Delete category"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick Add Category Form */}
          <form onSubmit={handleAddCategorySubmit} className="flex items-center gap-1.5">
            <input
              type="text"
              placeholder="+ New Category..."
              value={newCategoryName || ''}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 w-36"
            />
            <button
              type="submit"
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition"
            >
              Add
            </button>
          </form>
        </div>
      </div>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => {
          const categoryName = categories.find((c) => c.id === item.categoryId)?.name || '';

          return (
            <div
              key={item.id}
              className={`rounded-2xl border transition-all flex flex-col justify-between overflow-hidden ${
                item.isAvailable
                  ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700 shadow-md'
                  : 'bg-slate-900/30 border-slate-800/40 opacity-60'
              }`}
            >
              {item.imageUrl && (
                <div className="relative h-40 w-full overflow-hidden bg-slate-950">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  {!item.isAvailable && (
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center">
                      <span className="px-3 py-1 bg-rose-600/90 text-white font-extrabold text-xs uppercase tracking-wider rounded-full shadow-lg">
                        Sold Out / 86'd
                      </span>
                    </div>
                  )}

                  {item.isBestseller && item.isAvailable && (
                    <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-extrabold flex items-center gap-1 shadow-md">
                      <Sparkles className="w-3 h-3" /> Bestseller
                    </div>
                  )}
                </div>
              )}

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-slate-100 text-sm leading-snug">{item.name}</h3>
                    <span className="font-mono font-bold text-amber-400 text-sm shrink-0">
                      {activeTenant.currency}{item.price.toFixed(2)}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                    {item.description}
                  </div>

                  {/* Dietary & Category quiet tags */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2.5 text-[11px] text-slate-400">
                    <span className="text-slate-500">{categoryName}</span>
                    {item.isVeg && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-emerald-400 flex items-center gap-0.5">
                          <Leaf className="w-3 h-3" /> Veg
                        </span>
                      </>
                    )}
                    {item.isVegan && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-emerald-300">Vegan</span>
                      </>
                    )}
                    {item.isGlutenFree && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-cyan-400">GF</span>
                      </>
                    )}
                    {item.isSpicy && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-rose-400 flex items-center gap-0.5">
                          <Flame className="w-3 h-3" /> Spicy
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions bottom bar */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs">
                  <button
                    onClick={() => toggleItemAvailability(item.id)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                      item.isAvailable
                        ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40 hover:bg-emerald-900/60'
                        : 'bg-rose-950/60 text-rose-300 border border-rose-800/40 hover:bg-rose-900/60'
                    }`}
                  >
                    {item.isAvailable ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    <span>{item.isAvailable ? 'In Stock' : 'Mark In Stock'}</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition"
                      title="Edit Item"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteMenuItem(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition"
                      title="Delete Item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit / Add Menu Item Modal */}
      {showItemModal && editingItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-slate-100 text-sm">
                {editingItem.id ? 'Edit Menu Item' : 'Add New Menu Item'}
              </h3>
              <button
                onClick={() => setShowItemModal(false)}
                className="text-slate-400 hover:text-slate-200 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveItemSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Item Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Lavender Infused Cold Brew"
                  value={editingItem.name || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Category *</label>
                  <select
                    value={editingItem.categoryId || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, categoryId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Price ({activeTenant.currency}) *</label>
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    required
                    value={editingItem.price ?? 0}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, price: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Description & Ingredients</label>
                <textarea
                  rows={2}
                  placeholder="Fresh organic ingredients, notes..."
                  value={editingItem.description || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Photo URL</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={editingItem.imageUrl || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingItem.isVeg ?? true}
                    onChange={(e) => setEditingItem({ ...editingItem, isVeg: e.target.checked })}
                    className="accent-amber-500 rounded"
                  />
                  <span className="text-slate-300">Vegetarian</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingItem.isVegan ?? false}
                    onChange={(e) => setEditingItem({ ...editingItem, isVegan: e.target.checked })}
                    className="accent-amber-500 rounded"
                  />
                  <span className="text-slate-300">100% Vegan</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingItem.isGlutenFree ?? false}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, isGlutenFree: e.target.checked })
                    }
                    className="accent-amber-500 rounded"
                  />
                  <span className="text-slate-300">Gluten-Free</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingItem.isSpicy ?? false}
                    onChange={(e) => setEditingItem({ ...editingItem, isSpicy: e.target.checked })}
                    className="accent-amber-500 rounded"
                  />
                  <span className="text-slate-300">Spicy</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingItem.isBestseller ?? false}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, isBestseller: e.target.checked })
                    }
                    className="accent-amber-500 rounded"
                  />
                  <span className="text-slate-300">Bestseller Badge</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingItem.isAvailable ?? true}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, isAvailable: e.target.checked })
                    }
                    className="accent-amber-500 rounded"
                  />
                  <span className="text-slate-300">Available In Stock</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowItemModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
