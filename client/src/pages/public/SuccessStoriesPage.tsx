import { motion } from "framer-motion";
import { HeartIcon, PawPrintIcon, QuoteIcon, Building2, Users } from "lucide-react";
import { Navbar } from "../../components/layout/Navbar";
import { Footer } from "../../components/layout/Footer";
import { Button } from "../../components/ui/Button";
import { successStories as staticStories } from "../../data/successStories";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

export function SuccessStoriesPage() {
  const [stories, setStories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/stories");
        setStories(res.data);
      } catch (err) {
        console.error("Failed to fetch stories", err);
        setStories([]); // Don't use mock data
      } finally {
        setIsLoading(false);
      }
    };
    fetchStories();
  }, []);


  return (
    <div className="min-h-screen bg-[var(--color-background)] transition-colors duration-300">
      <Navbar />

      <main className="pt-20">
        {/* New Premium Hero Section */}
        <section className="relative min-h-[500px] flex items-center overflow-hidden bg-[#faf9f6]">
          {/* Hero Image - Right Aligned Focus */}
          <div className="absolute inset-0 md:left-1/3">
            <img
              src="/success_stories_hero_1773732081020.png"
              alt="Candid moment of adoption"
              className="w-full h-full object-cover object-center md:object-right-top"
            />
            {/* Soft Overlays */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#faf9f6] via-[#faf9f6]/80 to-transparent md:block hidden" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#faf9f6] via-transparent to-transparent md:hidden block" />
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-repeat" style={{ backgroundImage: `url("https://www.transparenttextures.com/patterns/natural-paper.png")` }} />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative w-full py-20">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="max-w-xl"
            >
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium mb-6"
                style={{
                  background: "rgba(212,116,92,0.1)",
                  color: "var(--color-primary)",
                }}
              >
                <HeartIcon className="w-4 h-4" />
                Create Your Story
              </div>

              <h1
                className="text-4xl md:text-6xl font-bold mb-6 tracking-tight leading-tight"
                style={{ color: "var(--color-text)", fontFamily: "var(--font-heading)" }}
              >
                Real Stories, <br />
                <span style={{ color: "var(--color-primary)" }}>Forever Homes</span>
              </h1>
              
              <p
                className="text-lg md:text-xl leading-relaxed mb-8 font-medium"
                style={{ color: "var(--color-text-light)" }}
              >
                Every adoption is a journey of trust, a promise of safety, and a lifetime of unconditional love. These are the stories that make our mission meaningful.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link to="/search">
                  <Button size="lg" className="shadow-md">Start Your Story</Button>
                </Link>
                <div className="flex -space-x-3 items-center ml-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-[#faf9f6] overflow-hidden">
                      <img 
                        src={`https://i.pravatar.cc/100?img=${i + 10}`} 
                        alt="Happy owner" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                  <span className="ml-4 text-sm font-semibold" style={{ color: "var(--color-text-light)" }}>
                    2,500+ happy tails
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Refined Stats Bar */}
        <section className="py-12 bg-white border-b border-[var(--color-border)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
              {[
                { value: "2,500+", label: "Pets Adopted", icon: PawPrintIcon },
                { value: "150+", label: "Partner Shelters", icon: Building2 },
                { value: "98%", label: "Happy Families", icon: Users },
                { value: "5 Years", label: "Making Matches", icon: HeartIcon },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex flex-col items-center"
                >
                  <div className="mb-3 p-3 rounded-2xl bg-[var(--color-surface)] text-[var(--color-primary)]">
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div className="text-3xl font-bold text-[var(--color-text)] mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm font-medium text-[var(--color-text-light)]">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Premium Stories Grid */}
        <section className="py-24 bg-[#faf9f6]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-24">
              {isLoading ? (
                <div className="flex justify-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-primary)]"></div>
                </div>
              ) : stories.length > 0 ? (
                stories.map((story, index) => (
                  <motion.div 
                    key={story.id} 
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.7 }}
                    className={`flex flex-col md:flex-row items-center gap-12 ${
                      index % 2 === 1 ? "md:flex-row-reverse" : ""
                    }`}
                  >
                    {/* Image with Decorative Element */}
                    <div className="w-full md:w-1/2 relative group">
                      <div 
                        className="absolute -inset-4 bg-[var(--color-surface)] rounded-[32px] rotate-2 transition-transform group-hover:rotate-1" 
                      />
                      <div className="relative aspect-[4/3] rounded-[24px] overflow-hidden shadow-2xl">
                        <img
                          src={story.petImage}
                          alt={story.petName}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                        
                        {/* Name Plate */}
                        <div className="absolute bottom-6 left-6 text-white">
                          <h3 className="text-2xl font-bold leading-none mb-1">{story.petName}</h3>
                          <p className="text-sm text-white/80">{story.petBreed}</p>
                        </div>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="w-full md:w-1/2">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="h-[1px] w-12 bg-[var(--color-primary)] opacity-40" />
                        <span className="text-sm font-bold uppercase tracking-widest text-[var(--color-primary)]">
                          {story.adoptionDate}
                        </span>
                      </div>

                      <QuoteIcon 
                        className="w-10 h-10 text-[var(--color-primary)] opacity-20 mb-4" 
                      />
                      
                      <h2 className="text-3xl font-bold mb-6 text-[var(--color-text)] leading-tight">
                        {story.story.split('.')[0]}.
                      </h2>

                      <p className="text-lg text-[var(--color-text-light)] mb-8 leading-relaxed italic border-l-4 border-[var(--color-surface)] pl-6">
                        "{story.quote}"
                      </p>

                      <p className="text-[var(--color-text-light)] mb-10 leading-relaxed font-medium">
                        {story.story}
                      </p>

                      <div className="flex items-center justify-between pt-8 border-t border-[var(--color-border)]">
                        <div className="flex items-center gap-4">
                          <img 
                            src={story.ownerImage} 
                            alt={story.adopterName} 
                            className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md"
                          />
                          <div>
                            <p className="font-bold text-[var(--color-text)]">{story.adopterName}</p>
                            <p className="text-sm text-[var(--color-text-light)]">Proud Parent in {story.location}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 px-4 py-2 bg-[var(--color-surface)] rounded-full text-[var(--color-primary)]">
                          <HeartIcon className="w-4 h-4 fill-current" />
                          <span className="text-xs font-bold uppercase tracking-wider">Adopted</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-20 text-[var(--color-text-light)]">
                  No success stories found yet. Be the first to share your journey!
                </div>
              )}
            </div>
          </div>
        </section>


        {/* CTA Section */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div
                className="p-8 md:p-12 rounded-3xl text-white text-center shadow-xl relative overflow-hidden"
                style={{
                  background:
                    "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
                }}
              >
                {/* Decorative circles */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full translate-x-1/3 -translate-y-1/3" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full -translate-x-1/3 translate-y-1/3" />

                <div className="relative z-10">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 mb-6 backdrop-blur-sm">
                    <HeartIcon className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-4">
                    Ready to Write Your Own Story?
                  </h2>
                  <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                    Thousands of loving pets are waiting for their forever
                    homes. Start your adoption journey today and become part of
                    our success stories.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                      to="/search"
                      className="inline-flex items-center justify-center px-8 py-3 bg-white font-semibold rounded-xl hover:bg-opacity-90 transition-all shadow-lg"
                      style={{ color: "var(--color-primary)" }}
                    >
                      Find Your Pet
                    </Link>
                    <Link
                      to="/about"
                      className="inline-flex items-center justify-center px-8 py-3 bg-white/20 text-white font-semibold rounded-xl hover:bg-white/30 transition-all backdrop-blur-sm"
                    >
                      Learn More
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}



