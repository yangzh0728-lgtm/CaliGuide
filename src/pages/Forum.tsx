import { Compass, Landmark, HomeIcon, Briefcase, HeartPulse, MessageSquare, Eye, ArrowRight, Users, Plus } from 'lucide-react';
import { FORUM_POSTS } from '../constants';

export default function Forum() {
  const categories = [
    { label: 'All Topics', icon: Compass, active: true },
    { label: '#Banking', icon: Landmark },
    { label: '#Housing', icon: HomeIcon },
    { label: '#Jobs', icon: Briefcase },
    { label: '#Health', icon: HeartPulse },
  ];

  const tags = ['#VisaProcessing', '#DriverLicense', '#RentalMarket', '#SocialSecurity'];

  return (
    <div className="pt-20 pb-24 max-w-lg mx-auto">
      <section className="px-4 mb-8 pt-4">
        <h2 className="text-3xl font-bold text-primary mb-2">Community Forum</h2>
        <p className="text-sm text-on-surface-variant">Find answers and connect with others navigating California life.</p>
      </section>

      {/* Category Scroll */}
      <section className="mb-8">
        <div className="flex gap-2 overflow-x-auto px-4 pb-2 no-scrollbar">
          {categories.map((cat, i) => (
            <button 
              key={i}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                cat.active 
                ? 'bg-secondary-container text-on-secondary-container' 
                : 'bg-white border border-outline-variant text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <cat.icon size={18} />
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      <div className="px-4 flex flex-col gap-6">
        {/* Featured Discussion */}
        <div className="bg-white rounded-2xl border border-outline-variant p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed font-bold">JD</div>
              <div>
                <p className="text-sm font-bold">Julian Doe</p>
                <p className="text-xs text-on-surface-variant">2 hours ago</p>
              </div>
            </div>
            <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-[10px] font-bold">#Housing</span>
          </div>
          <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors leading-tight">
            Best areas for new families in the San Francisco Bay Area with school access?
          </h3>
          <p className="text-sm text-on-surface-variant mb-4 line-clamp-2 leading-relaxed">
            I'm moving from Toronto and looking for a safe neighborhood that has strong public elementary schools. Budget is around $3k-$4k for a 2-bedroom rental...
          </p>
          <div className="flex items-center justify-between border-t border-outline-variant pt-4">
            <div className="flex gap-4">
              <div className="flex items-center gap-1 text-xs text-on-surface-variant">
                <MessageSquare size={16} /> 24 Comments
              </div>
              <div className="flex items-center gap-1 text-xs text-on-surface-variant">
                <Eye size={16} /> 1.2k views
              </div>
            </div>
            <button className="text-primary font-bold text-sm flex items-center gap-1 uppercase tracking-wider">
              Join Discussion <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Stats Card */}
        <div className="bg-primary text-white rounded-2xl p-6 flex flex-col items-center text-center">
          <Users size={40} className="mb-3" />
          <h4 className="text-xl font-bold">Active Community</h4>
          <p className="text-xs opacity-90 mt-1">12,450 New Residents helping each other this month.</p>
          <div className="mt-4 w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
            <div className="bg-secondary-container h-full w-3/4"></div>
          </div>
          <p className="text-[10px] font-bold mt-2 uppercase tracking-tight">Goal: 15,000 members</p>
        </div>

        {/* Tags */}
        <div className="bg-white border border-outline-variant rounded-2xl p-5">
          <h4 className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-4">Trending Tags</h4>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, i) => (
              <span key={i} className="bg-surface-container-high px-3 py-1.5 rounded-lg text-xs font-semibold text-on-surface">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Guide Promo */}
        <div className="bg-white border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
          <img 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuB5TmBHJ2NKrZyRi7PRqNosP8XV2dhHr0F-f4Ks27ru3oTTto1h4CIIxfovvlCTkpR9pfcSjb_RdLfAByZAe5xNKBrM5gFLQhDzIpYQ2Hx8vKcSBfci3ek23Wtuna6BPT4QyV3hxAG0YLabNhSOPC77UqFR51nyANRt-pl6SfxpF9XpmsWdqVPFvDUaiQFSO89MUYqtKWbLEjHW2LqicNBWp_VRjbatH3j3GVBYO9KinFZYJ-s6N5kybpMUkTttkrApwGsRXprUvRI" 
            alt="Community" 
            className="w-full h-32 object-cover"
          />
          <div className="p-5 text-center">
            <h4 className="font-bold text-on-surface">New to California?</h4>
            <p className="text-xs text-on-surface-variant mt-1">Check out our community-verified 'First 30 Days' guide.</p>
            <button className="mt-4 w-full bg-secondary-container text-on-secondary-container py-3 rounded-xl font-bold hover:bg-secondary-container/90 transition-colors">
              Read Guide
            </button>
          </div>
        </div>

        {/* Rest of the posts */}
        {FORUM_POSTS.slice(1).map((post) => (
          <div key={post.id} className="bg-white border border-outline-variant rounded-2xl p-5 flex flex-col md:flex-row gap-4 hover:bg-surface-container-low transition-colors cursor-pointer">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-surface-container-high text-on-surface-variant px-2 py-1 rounded text-[10px] font-bold">{post.category}</span>
                <p className="text-xs text-on-surface-variant">Posted by <span className="font-bold">{post.author}</span> • {post.time}</p>
              </div>
              <h4 className="text-lg font-bold text-on-surface leading-tight">{post.title}</h4>
              <p className="text-xs text-on-surface-variant mt-2 line-clamp-1">{post.excerpt}</p>
            </div>
            <div className="flex md:flex-col items-center justify-center gap-1 md:border-l border-outline-variant md:pl-5 min-w-[60px]">
              <span className="text-2xl font-bold text-primary">{post.comments}</span>
              <span className="text-[10px] font-bold text-on-surface-variant uppercase">Replies</span>
            </div>
          </div>
        ))}
      </div>

      {/* FAB */}
      <button className="fixed bottom-28 right-4 w-14 h-14 bg-primary text-white rounded-full shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-40">
        <Plus size={24} />
      </button>
    </div>
  );
}
