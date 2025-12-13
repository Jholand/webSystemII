import { Church, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const OurStory = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #f5f1ed 0%, #ede4d9 100%)' }}>
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm" style={{ borderBottom: '1px solid rgba(139, 69, 19, 0.15)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 hover:shadow-md"
            style={{
              background: 'white',
              border: '2px solid #8B4513',
              color: '#8B4513'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #8B4513 0%, #A0522D 100%)';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.color = '#8B4513';
            }}
          >
            <ArrowLeft size={20} />
            <span className="font-semibold">Back to Home</span>
          </button>
        </div>
      </nav>

      {/* Hero Header */}
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 30%, #CD853F 60%, #DAA520 100%)' }}>
        {/* Animated Background Elements */}
        <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse-slow"></div>
        <div className="absolute bottom-5 left-10 w-24 h-24 rounded-full blur-xl animate-float" style={{ background: 'rgba(218, 165, 32, 0.2)' }}></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-white/20 backdrop-blur-md rounded-2xl">
              <Church size={56} className="text-white" />
            </div>
            <div>
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-2" style={{ textShadow: '0 2px 10px rgba(139, 69, 19, 0.5)' }}>
                Our Story
              </h1>
              <p className="text-white/90 text-xl" style={{ textShadow: '0 1px 4px rgba(139, 69, 19, 0.4)' }}>
                A Legacy of Faith and Service
              </p>
            </div>
          </div>
          
          {/* Floating Year */}
          <div className="relative mt-8 flex justify-center">
            <div className="text-9xl font-bold text-white/20 animate-float-year">
              1952
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-7xl font-bold text-white drop-shadow-2xl">
                Est. 1952
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="bg-white rounded-3xl shadow-xl p-12">
          <div className="prose max-w-none">
            <h2 className="text-3xl font-bold mb-6" style={{ color: '#8B4513' }}>
              Our Beginning
            </h2>
            <p className="leading-relaxed text-lg mb-8" style={{ color: '#5D4037' }}>
              Our Lady of Peace and Good Voyage Mission Area was established in 1952, born from a vision to create 
              a spiritual home for the faithful in our community. For over seven decades, we have been a beacon of 
              hope, faith, and love, serving generations of families.
            </p>
            
            <h2 className="text-3xl font-bold mb-6" style={{ color: '#A0522D' }}>
              Our Mission
            </h2>
            <p className="leading-relaxed text-lg mb-8" style={{ color: '#5D4037' }}>
              We are dedicated to spreading the Gospel, nurturing faith, and building a community rooted in love 
              and service. Through our various ministries, sacraments, and outreach programs, we strive to touch 
              lives and make a meaningful difference in our parish and beyond.
            </p>
            
            <h2 className="text-3xl font-bold mb-6" style={{ color: '#CD853F' }}>
              Our Community
            </h2>
            <p className="leading-relaxed text-lg mb-8" style={{ color: '#5D4037' }}>
              Today, we are a vibrant community of believers, united in faith and purpose. We celebrate together, 
              support one another, and work hand in hand to serve those in need. Whether you're seeking spiritual 
              guidance, community connection, or a place to call home, you'll find open arms and warm hearts here.
            </p>
            
            {/* Statistics Grid */}
            <div className="grid md:grid-cols-3 gap-6 my-12">
              <div className="text-center p-8 rounded-2xl" style={{ 
                background: 'linear-gradient(135deg, rgba(139, 69, 19, 0.1) 0%, rgba(160, 82, 45, 0.1) 100%)', 
                border: '2px solid rgba(139, 69, 19, 0.2)' 
              }}>
                <div className="text-5xl font-bold mb-3" style={{ color: '#8B4513' }}>70+</div>
                <p className="font-semibold text-lg" style={{ color: '#5D4037' }}>Years of Service</p>
              </div>
              
              <div className="text-center p-8 rounded-2xl" style={{ 
                background: 'linear-gradient(135deg, rgba(160, 82, 45, 0.1) 0%, rgba(205, 133, 63, 0.1) 100%)', 
                border: '2px solid rgba(160, 82, 45, 0.2)' 
              }}>
                <div className="text-5xl font-bold mb-3" style={{ color: '#A0522D' }}>1000+</div>
                <p className="font-semibold text-lg" style={{ color: '#5D4037' }}>Faithful Members</p>
              </div>
              
              <div className="text-center p-8 rounded-2xl" style={{ 
                background: 'linear-gradient(135deg, rgba(205, 133, 63, 0.1) 0%, rgba(218, 165, 32, 0.1) 100%)', 
                border: '2px solid rgba(218, 165, 32, 0.3)' 
              }}>
                <div className="text-5xl font-bold mb-3" style={{ color: '#DAA520' }}>∞</div>
                <p className="font-semibold text-lg" style={{ color: '#5D4037' }}>Blessings Shared</p>
              </div>
            </div>
            
            {/* Quote Section */}
            <div className="mt-12 p-8 rounded-2xl" style={{ background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 30%, #CD853F 60%, #DAA520 100%)' }}>
              <p className="text-white text-center text-2xl font-semibold italic" style={{ textShadow: '0 2px 6px rgba(139, 69, 19, 0.5)' }}>
                "Where faith meets community, and hope finds a home."
              </p>
            </div>

            {/* Call to Action */}
            <div className="mt-12 text-center">
              <button
                onClick={() => navigate('/')}
                className="px-8 py-4 rounded-2xl text-white font-bold text-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #8B4513 0%, #DAA520 100%)',
                  boxShadow: '0 4px 20px rgba(139, 69, 19, 0.4)'
                }}
              >
                Join Our Community
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative py-12 overflow-hidden" style={{ background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 30%, #CD853F 60%, #DAA520 100%)', borderTop: '1px solid rgba(218, 165, 32, 0.3)' }}>
        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-2 bg-white/25 backdrop-blur-md rounded-xl">
              <Church className="h-6 w-6 text-white" style={{ filter: 'drop-shadow(0 2px 6px rgba(139, 69, 19, 0.5))' }} />
            </div>
            <span className="text-xl font-bold text-white" style={{ textShadow: '0 2px 6px rgba(139, 69, 19, 0.5)' }}>Our Lady of Peace</span>
          </div>
          <p className="text-white text-sm" style={{ textShadow: '0 1px 4px rgba(139, 69, 19, 0.4)' }}>
            and Good Voyage Mission Area
          </p>
          <p className="text-white/80 text-sm mt-4" style={{ textShadow: '0 1px 3px rgba(139, 69, 19, 0.3)' }}>
            © 2024 Our Lady of Peace and Good Voyage Mission Area. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default OurStory;
