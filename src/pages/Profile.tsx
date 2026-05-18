import { Edit3, FileCheck, Bookmark, MessageSquare, Settings, LogOut, ChevronRight } from 'lucide-react';

export default function Profile() {
  const menuItems = [
    { 
      id: 'checklist', 
      title: 'Document Checklist', 
      desc: '7 of 12 documents uploaded', 
      icon: FileCheck, 
      color: 'bg-secondary-container text-on-secondary-container' 
    },
    { 
      id: 'saved', 
      title: 'Saved Guides', 
      desc: '4 guides saved for offline reading', 
      icon: Bookmark, 
      color: 'bg-primary-container text-on-primary-container',
      filled: true
    },
    { 
      id: 'posts', 
      title: 'My Forum Posts', 
      desc: '12 discussions started', 
      icon: MessageSquare, 
      color: 'bg-surface-container-high text-on-surface-variant' 
    },
    { 
      id: 'settings', 
      title: 'Settings', 
      desc: 'Privacy, notifications, and security', 
      icon: Settings, 
      color: 'bg-surface-container-highest text-on-surface-variant' 
    },
  ];

  return (
    <div className="pt-20 pb-24 max-w-lg mx-auto px-4">
      {/* Header */}
      <section className="flex flex-col items-center mb-10 pt-4">
        <div className="relative mb-4">
          <img 
            alt="Elena Rodriguez" 
            className="w-28 h-28 rounded-full border-4 border-white shadow-xl object-cover" 
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200&h=200"
          />
          <div className="absolute bottom-1 right-1 bg-primary text-white rounded-full p-2 border-2 border-white flex items-center justify-center cursor-pointer shadow-md hover:scale-110 transition-transform">
            <Edit3 size={16} />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-on-surface">Elena Rodriguez</h2>
        <p className="text-sm font-medium text-on-surface-variant mt-1">Member since October 2023</p>
      </section>

      {/* Menu List */}
      <div className="space-y-3">
        {menuItems.map((item) => (
          <div 
            key={item.id}
            className="bg-white border border-outline-variant rounded-2xl p-4 flex items-center justify-between hover:bg-surface-container-low transition-all cursor-pointer shadow-sm group"
          >
            <div className="flex items-center gap-4">
              <div className={`${item.color} p-3 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110`}>
                <item.icon size={22} fill={item.filled ? "currentColor" : "none"} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-on-surface group-hover:text-primary transition-colors">{item.title}</h3>
                <p className="text-xs text-on-surface-variant">{item.desc}</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-outline group-hover:translate-x-1 transition-transform" />
          </div>
        ))}

        <div className="mt-8 pt-8 border-t border-outline-variant">
          <button className="w-full flex items-center justify-center gap-3 p-4 text-error font-bold rounded-2xl border border-error/20 bg-error/5 hover:bg-error/10 transition-colors">
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
