import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { createPortal } from 'react-dom'
import { 
  FileSearch, 
  MessageSquare, 
  UserCheck, 
  TrendingUp, 
  ShieldCheck, 
  Star, 
  Users, 
  Handshake, 
  UserPlus, 
  Briefcase, 
  ArrowRight,
  FileCode,
  Building2,
  CreditCard,
  Megaphone,
  Settings,
  Factory,
  Stethoscope,
  FileText
} from 'lucide-react'
import ViewOpenRolesModal from '../components/ViewOpenRolesModal'

const LandingPage = () => {
  const [showPreferenceModal, setShowPreferenceModal] = useState(false)
  const [openRolesModalOpen, setOpenRolesModalOpen] = useState(false)
  const [flippedCardIndex, setFlippedCardIndex] = useState(null)

  useEffect(() => {
    // Keep active session intact when visiting homepage. Only clear on explicit logout.

    // Automatic preference modal popup suppressed per user request
    /*
    const timer = setTimeout(() => {
      setShowPreferenceModal(true)
    }, 600)
    return () => clearTimeout(timer)
    */
  }, [])

  const industries = [
    { name: 'Technology & IT', icon: <FileCode className="w-8 h-8 text-[#b88f3f]" />, img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop&q=60', desc: 'Sourcing top-tier developers, systems architects, and engineering leaders for high-growth tech platforms.' },
    { name: 'GCCs', icon: <Building2 className="w-8 h-8 text-[#b88f3f]" />, img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=500&auto=format&fit=crop&q=60', desc: 'Building premium global capability centers with technical, financial, operational, and leadership hubs.' },
    { name: 'Banking & Financial Services', icon: <CreditCard className="w-8 h-8 text-[#b88f3f]" />, img: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=500&auto=format&fit=crop&q=60', desc: 'Placing seasoned investment bankers, credit risk analysts, and modern fintech disruptors.' },
    { name: 'Sales & Marketing', icon: <Megaphone className="w-8 h-8 text-[#b88f3f]" />, img: 'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?w=500&auto=format&fit=crop&q=60', desc: 'Acquiring high-velocity revenue leaders, growth marketers, and global brand strategists.' },
    { name: 'Operations', icon: <Settings className="w-8 h-8 text-[#b88f3f]" />, img: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=500&auto=format&fit=crop&q=60', desc: 'Optimizing supply chains and logistics with strategic facilities and operational directors.' },
    { name: 'Manufacturing', icon: <Factory className="w-8 h-8 text-[#b88f3f]" />, img: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500&auto=format&fit=crop&q=60', desc: 'Recruiting precise plant managers, industrial engineers, and quality assurance leads.' },
    { name: 'Healthcare', icon: <Stethoscope className="w-8 h-8 text-[#b88f3f]" />, img: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=500&auto=format&fit=crop&q=60', desc: 'Connecting top medical centers with licensed practitioners, nurses, and laboratory researchers.' },
    { name: 'Corporate Functions', icon: <FileText className="w-8 h-8 text-[#b88f3f]" />, img: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=500&auto=format&fit=crop&q=60', desc: 'Sourcing strategic human resources, legal advisors, accountants, and executive administrators.' },
  ]

  return (
    <div className="min-h-screen bg-[#fafbfc] text-slate-800 font-sans scroll-smooth">
      
      {/* Hero Section Wrapper matching lower section bg */}
      <div className="bg-white dark:bg-[#353b48]">
        <section 
          id="home" 
          className="relative bg-cover bg-center py-32 md:py-48 text-left transition-all duration-700 ease-out animate-fade-in rounded-b-[32px] overflow-hidden shadow-2xl"
          style={{ 
            backgroundImage: "linear-gradient(to right, rgba(9,15,25,0.85) 30%, rgba(9,15,25,0.3)), url('/hero banner.png?v=1')" 
          }}
        >
          <div className="max-w-7xl mx-auto px-6 sm:px-12 relative z-10 space-y-6">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white font-serif leading-tight max-w-3xl animate-slide-up">
              QUALITY PEOPLE. <br/>
              <span className="text-[#b88f3f]">BETTER FUTURES.</span>
            </h1>
            <p className="text-slate-300 text-base sm:text-lg max-w-xl leading-relaxed font-medium">
              We don’t just fill positions. We find people who make a difference. <br/>
              Better talent. Better decisions. Better hires.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button 
                onClick={() => window.dispatchEvent(new Event('aston-open-client-modal'))}
                className="btn-custom bg-[#b88f3f] hover:bg-[#a67d2f] text-white font-bold px-8 py-3.5 rounded-sm transition-all flex items-center justify-center gap-2 group transform active:scale-95 shadow-lg"
              >
                <span>HIRE TALENT</span>
                <span className="group-hover:translate-x-1.5 transition-transform">→</span>
              </button>
              <a 
                href="#process" 
                className="border border-white/50 hover:border-white hover:bg-white/10 text-white font-bold px-8 py-3.5 rounded-sm transition-all flex items-center justify-center gap-2 group transform active:scale-95"
              >
                <span>EXPLORE OUR PROCESS</span>
                <span className="group-hover:translate-x-1.5 transition-transform">→</span>
              </a>
            </div>
            <div className="flex items-center gap-2.5 pt-6 text-slate-300 text-sm font-semibold">
              <span className="text-[#b88f3f] text-lg">✓</span>
              <span>Aston Verified™ Talent</span>
            </div>
          </div>
        </section>
      </div>

      {/* Our Proven Hiring Process */}
      <section id="process" className="py-20 bg-white border-b border-slate-200/60 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 text-center">
          
          <div className="flex items-center justify-center gap-4 mb-12">
            <div className="w-12 h-[1px] bg-[#b88f3f]" />
            <h2 className="text-lg font-bold tracking-[0.2em] text-[#090f19] uppercase font-serif">
              OUR PROVEN HIRING PROCESS
            </h2>
            <div className="w-12 h-[1px] bg-[#b88f3f]" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { num: '01', title: 'Every Resume, Manually Reviewed', text: 'Our team reads and understands every resume against your requirements.', icon: <FileSearch className="w-6 h-6 text-[#b88f3f]" /> },
              { num: '02', title: 'First Interview', text: 'We connect personally to assess communication, motivation and role fit.', icon: <MessageSquare className="w-6 h-6 text-[#b88f3f]" /> },
              { num: '03', title: 'Domain Expert Interview', text: 'An expert in the relevant domain evaluates skills, experience and potential.', icon: <UserCheck className="w-6 h-6 text-[#b88f3f]" /> },
              { num: '04', title: 'Scored. Shortlisted. Recommended.', text: 'We score each candidate and share only the best profiles worth your time.', icon: <TrendingUp className="w-6 h-6 text-[#b88f3f]" /> }
            ].map((step, idx) => (
              <div key={idx} className="relative flex flex-col items-center p-6 transition-all duration-300 group">
                <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-[#b88f3f]/10 transition-colors border border-slate-150 shadow-xs">
                  {step.icon}
                </div>
                <span className="text-lg font-black text-[#b88f3f] mb-1">{step.num}</span>
                <h3 className="font-bold text-[#090f19] text-base mb-2 font-serif">{step.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed max-w-[220px]">{step.text}</p>
                
                {idx < 3 && (
                  <div className="hidden lg:flex absolute top-1/2 -right-7 -translate-y-1/2 z-10 text-[#b88f3f]">
                    <ArrowRight className="w-6 h-6" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-4 mt-12">
            <div className="w-12 h-[1px] bg-[#b88f3f]" />
            <p className="text-sm font-semibold text-slate-700 italic">Less noise. Better conversations. Better hires.</p>
            <div className="w-12 h-[1px] bg-[#b88f3f]" />
          </div>

        </div>
      </section>

      {/* Recruitment Across Industries */}
      <section id="industries" className="py-20 scroll-mt-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#090f19] mb-12 font-serif tracking-tight">
            RECRUITMENT ACROSS INDUSTRIES
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            {industries.map((ind, idx) => (
              <div 
                key={idx} 
                className="h-44 [perspective:1000px] cursor-pointer"
                onClick={() => setFlippedCardIndex(flippedCardIndex === idx ? null : idx)}
              >
                <div className={`relative w-full h-full duration-500 [transform-style:preserve-3d] ${flippedCardIndex === idx ? '[transform:rotateY(180deg)]' : ''}`}>
                  {/* Front Side */}
                  <div className="absolute inset-0 w-full h-full rounded-xl overflow-hidden shadow-md [backface-visibility:hidden]">
                    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${ind.img}')` }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#090f19]/90 via-[#090f19]/60 to-[#090f19]/30" />
                    <div className="absolute inset-0 p-5 flex flex-col justify-end items-start text-left z-10">
                      <div className="mb-2">{ind.icon}</div>
                      <h3 className="text-white font-bold text-sm tracking-tight leading-tight">{ind.name}</h3>
                    </div>
                  </div>

                  {/* Back Side */}
                  <div className="absolute inset-0 w-full h-full rounded-xl p-5 bg-[#090f19] border border-slate-800/80 flex flex-col justify-center items-center text-center [backface-visibility:hidden] [transform:rotateY(180deg)] shadow-lg">
                    <div className="mb-2">{ind.icon}</div>
                    <h4 className="text-[#b88f3f] font-bold text-xs mb-2 uppercase tracking-wider">{ind.name}</h4>
                    <p className="text-slate-300 text-[10px] leading-relaxed font-medium">{ind.desc}</p>
                  </div>
                </div>
              </div>
            ))}
            <div className="bg-[#090f19] rounded-xl flex flex-col justify-center items-center p-6 cursor-pointer hover:bg-slate-900 transition-colors border border-slate-800">
              <span className="text-2xl text-[#b88f3f] mb-2">•••</span>
              <h3 className="text-white font-bold text-sm">More Industries</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Why Aston? */}
      <section id="why-aston" className="py-20 bg-white dark:bg-[#0c101a] border-t border-b border-slate-200/60 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#090f19] dark:text-white mb-12 font-serif tracking-tight">
            WHY ASTON?
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: 'Quality Over Quantity', text: 'We invest time up front so you save time at the end. We share only the best.', icon: <ShieldCheck className="w-8 h-8 text-[#b88f3f]" /> },
              { title: 'Domain Expertise', text: 'Interviews are led by experts who understand roles, not just keywords.', icon: <Star className="w-8 h-8 text-[#b88f3f]" /> },
              { title: 'Human Evaluation', text: 'Every decision is backed by human judgment, experience and accountability.', icon: <Users className="w-8 h-8 text-[#b88f3f]" /> },
              { title: 'Partnership Mindset', text: 'We work like an extension of your team and care about your outcomes.', icon: <Handshake className="w-8 h-8 text-[#b88f3f]" /> }
            ].map((card, idx) => (
              <div key={idx} className="flex flex-col items-center p-6 bg-slate-50 dark:bg-[#090f19] border border-slate-200/60 dark:border-slate-800 rounded-2xl hover:shadow-lg hover:border-amber-500/20 hover:dark:border-[#b88f3f]/30 transition-all duration-300">
                <div className="mb-4">
                  {card.icon}
                </div>
                <h3 className="font-bold text-[#090f19] dark:text-white text-base mb-2 font-serif">{card.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-[220px]">{card.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* A Note from the Founder */}
      <section id="about" className="py-20 scroll-mt-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-12">
          
          <div className="bg-[#090f19] rounded-2xl p-8 md:p-12 shadow-2xl flex flex-col md:flex-row items-center gap-10 border border-slate-800">
            <div className="w-48 h-48 rounded-xl overflow-hidden border border-slate-700/60 shadow-lg flex-shrink-0">
              <img 
                src="/WhatsApp Image 2026-08-21 at 12.42.08.jpeg" 
                alt="Rahul Bharatiya" 
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="space-y-6 text-left">
              <h3 className="text-xs font-bold tracking-[0.2em] text-[#b88f3f] uppercase">A NOTE FROM THE FOUNDER</h3>
              
              <blockquote className="text-slate-300 text-lg md:text-xl font-medium leading-relaxed italic relative">
                <span className="text-3xl text-[#b88f3f] mr-1">“</span>
                A good hire can do the job. A great hire fits the team, adds value and helps the business grow.
                <span className="text-3xl text-[#b88f3f] ml-1">”</span>
              </blockquote>
              
              <div>
                <p className="text-white font-bold font-serif text-base">Rahul Bharatiya</p>
                <p className="text-slate-500 text-xs font-medium">Founder, Aston Recruitment</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Action Banner Grids */}
      <section id="candidates" className="bg-white border-t border-slate-200/60 scroll-mt-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200/60">
          
          {/* Candidate Opportunity */}
          <div className="p-12 text-left space-y-6">
            <div className="w-12 h-12 bg-[#b88f3f]/10 rounded-full flex items-center justify-center text-[#b88f3f]">
              <UserPlus className="w-6 h-6" />
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#090f19] font-serif">
              YOUR NEXT OPPORTUNITY STARTS HERE.
            </h3>
            <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
              Register your profile and let us match you with opportunities that are right for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link to="/candidate/register" className="bg-[#b88f3f] hover:bg-[#a67d2f] text-white font-bold text-xs px-6 py-3.5 rounded-sm transition-all text-center tracking-wider shadow-sm transform active:scale-95">
                CANDIDATE REGISTRATION →
              </Link>
              <button 
                onClick={() => setOpenRolesModalOpen(true)}
                className="border border-slate-300 hover:border-slate-500 text-slate-700 font-bold text-xs px-6 py-3.5 rounded-sm transition-all text-center tracking-wider transform active:scale-95"
              >
                VIEW OPEN ROLES →
              </button>
            </div>
          </div>

          {/* Looking to Hire */}
          <div id="clients" className="p-12 text-left space-y-6 scroll-mt-20">
            <div className="w-12 h-12 bg-[#b88f3f]/10 rounded-full flex items-center justify-center text-[#b88f3f]">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#090f19] font-serif">
              LOOKING TO HIRE?
            </h3>
            <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
              Tell us about the role. We'll find the right people, so you can build what's next.
            </p>
            <div className="pt-2">
              <Link to="/recruiter/login" className="bg-[#b88f3f] hover:bg-[#a67d2f] text-white font-bold text-xs px-8 py-3.5 rounded-sm transition-all inline-block tracking-wider shadow-sm transform active:scale-95">
                TELL US WHO YOU'RE HIRING →
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#090f19] text-white py-16 px-6 sm:px-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 no-underline" style={{ textDecoration: 'none' }}>
              <img
                src="/aston-logo-transparent.png"
                alt="Aston Logo"
                className="h-20 w-20 object-contain"
              />
              <div className="flex flex-col items-center text-center leading-none" style={{ textDecoration: 'none' }}>
                <span className="text-2xl font-bold tracking-widest text-white font-serif no-underline" style={{ fontFamily: 'Georgia, serif', textDecoration: 'none' }}>ASTON</span>
                <span className="text-[9px] font-bold tracking-[0.25em] text-[#b88f3f] uppercase mt-1.5 no-underline" style={{ textDecoration: 'none' }}>— RECRUITMENT —</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
              Aston Recruitment is a talent advisory firm helping companies build high-performing teams through a quality-first hiring process.
            </p>
          </div>

          <div className="space-y-4 text-left">
            <h4 className="text-xs font-bold text-[#b88f3f] uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2 text-xs text-slate-400 font-medium">
              <li>
                <a 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    window.dispatchEvent(new Event('aston-open-client-modal'));
                  }}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  For Clients
                </a>
              </li>
              <li>
                <Link to="/candidate/login" className="hover:text-white transition-colors">
                  For Candidates
                </Link>
              </li>
              <li><a href="#process" className="hover:text-white transition-colors">Our Process</a></li>
              <li><a href="#industries" className="hover:text-white transition-colors">Industries</a></li>
              <li><a href="#about" className="hover:text-white transition-colors">About Us</a></li>
            </ul>
          </div>

          <div className="space-y-4 text-left">
            <h4 className="text-xs font-bold text-[#b88f3f] uppercase tracking-wider">Portals</h4>
            <ul className="space-y-2 text-xs text-slate-400 font-medium">
              <li><Link to="/candidate/register" className="hover:text-white transition-colors">Candidate Registration</Link></li>
              <li><Link to="/candidate/login" className="hover:text-white transition-colors">Candidate Login</Link></li>
              <li><Link to="/recruiter/login" className="hover:text-white transition-colors">Expert Login</Link></li>
              <li><Link to="/admin/login" className="hover:text-white transition-colors">Admin Login</Link></li>
            </ul>
          </div>

          <div className="space-y-4 text-left">
            <h4 className="text-xs font-bold text-[#b88f3f] uppercase tracking-wider">Connect</h4>
            <ul className="space-y-2 text-xs text-slate-400 font-medium">
              <li><a href="mailto:contact@astonrecruitment.in" className="hover:text-white transition-colors">contact@astonrecruitment.in</a></li>
              <li>
                <a href="https://www.linkedin.com/company/aston-recruitment-india/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-3.5 h-3.5">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                  <span>LinkedIn</span>
                </a>
              </li>
            </ul>
          </div>

        </div>

        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-4">
          <p>© 2026 Aston Recruitment. All rights reserved.</p>
          <div className="flex gap-4 md:mr-36">
            <a href="#" className="hover:underline">Privacy Policy</a>
            <span>|</span>
            <a href="#" className="hover:underline">Terms & Conditions</a>
          </div>
        </div>
      </footer>

      {createPortal(
        <div className={`fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/85 backdrop-blur-md px-4 transition-all duration-700 ease-out ${
          showPreferenceModal ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}>
          <div className={`w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl relative border border-slate-800/80 bg-slate-950 min-h-[460px] flex flex-col justify-end p-6 md:p-8 text-center transition-all duration-700 ease-out transform ${
            showPreferenceModal ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-4 opacity-0'
          }`}>
            
            <div className="absolute inset-0 z-0">
              <img
                src="/hiring_job.jpg"
                alt="Aston Recruitment Opportunities"
                className="w-full h-full object-cover opacity-50"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-slate-950/10 via-slate-950/70 to-slate-950 z-10" />
            </div>

            <button
              onClick={() => {
                localStorage.setItem('user_preference', 'candidate');
                window.dispatchEvent(new Event('local-storage-pref'));
                setShowPreferenceModal(false);
              }}
              className="absolute top-4 right-4 z-30 text-slate-400 hover:text-white bg-slate-900/60 p-2 rounded-full backdrop-blur-md border border-slate-700/50 hover:border-amber-500 transition-all cursor-pointer shadow-md"
              title="Cancel and land as candidate"
              aria-label="Cancel"
            >
              ✕
            </button>

            <div className="relative z-20 flex flex-col items-center w-full">
              <h3 className="text-2xl md:text-3xl font-black text-white mb-2 tracking-tight">
                Welcome to Aston Recruitment
              </h3>
              <p className="text-sm text-slate-300 mb-6 max-w-sm leading-relaxed">
                Let's personalize your portal experience. What are you looking to do today?
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                <button
                  onClick={() => {
                    localStorage.setItem('user_preference', 'hiring');
                    window.dispatchEvent(new Event('local-storage-pref'));
                    setShowPreferenceModal(false);
                  }}
                  className="p-5 rounded-2xl border border-slate-700/80 hover:border-[#b88f3f] bg-slate-900/60 hover:bg-[#b88f3f]/10 text-white hover:text-[#b88f3f] font-bold transition-all flex flex-col items-center justify-center gap-2 group backdrop-blur-md shadow-lg"
                >
                  <span className="text-3xl group-hover:scale-110 transition-transform">💼</span>
                  <span className="text-sm">Are you hiring?</span>
                  <span className="text-[10px] text-slate-400 font-normal">Expert & Client tools</span>
                </button>

                <button
                  onClick={() => {
                    localStorage.setItem('user_preference', 'candidate');
                    window.dispatchEvent(new Event('local-storage-pref'));
                    setShowPreferenceModal(false);
                  }}
                  className="p-5 rounded-2xl border border-slate-700/80 hover:border-[#b88f3f] bg-slate-900/60 hover:bg-[#b88f3f]/10 text-white hover:text-[#b88f3f] font-bold transition-all flex flex-col items-center justify-center gap-2 group backdrop-blur-md shadow-lg"
                >
                  <span className="text-3xl group-hover:scale-110 transition-transform">🎯</span>
                  <span className="text-sm">Looking for a job?</span>
                  <span className="text-[10px] text-slate-400 font-normal">Candidate dashboard</span>
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}



      <ViewOpenRolesModal 
        isOpen={openRolesModalOpen} 
        onClose={() => setOpenRolesModalOpen(false)} 
        isLoggedIn={false} 
      />
    </div>
  )
}

export default LandingPage;
