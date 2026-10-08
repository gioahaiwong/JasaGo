import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Wrench,
  Zap,
  Bug,
  Code2,
  Sparkles,
  Users,
  Rocket,
  Heart,
  Target,
} from "lucide-react";
import picture from "../sable-flow-D-8Ji-FXYII-unsplash.jpg";
import picture1 from "../coding.png";
import picture2 from "../bug.png";
import picture3 from "../codingLang.png";
import "./aboutus.css";

export default function AboutUs() {
  const navigate = useNavigate();

  const features = [
    {
      img: picture1,
      title: "Crafted with Care",
      desc: "Every line of code was written with attention to detail and a passion for clean architecture.",
      color: "from-purple-500 to-indigo-500",
    },
    {
      img: picture2,
      title: "Bugs Are Teachers",
      desc: "Every bug we fix makes the system stronger. Debugging is where real learning happens.",
      color: "from-pink-500 to-rose-500",
    },
    {
      img: picture3,
      title: "Code as Language",
      desc: "Programming is just another way of communicating — with computers instead of people.",
      color: "from-blue-500 to-cyan-500",
    },
  ];

  const stats = [
    { icon: Code2, value: "3+", label: "Tech Stacks" },
    { icon: Users, value: "100%", label: "Passion Driven" },
    { icon: Rocket, value: "Unlimited", label: "Room to Grow" },
    { icon: Heart, value: "1", label: "Goal: Efficieny of Solving Problem" },
  ];

  return (
    <div className="about-page">
      {/* ===== HERO SECTION ===== */}
      <section className="about-hero">
        <div
          className="about-hero-bg"
          style={{ backgroundImage: `url(${picture})` }}
        />
        <div className="about-hero-overlay" />

        <div className="about-hero-content">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="about-badge">
              <Sparkles className="w-6 h-6" />
              ABOUT US
            </span>

            <h1 className="about-hero-title">
              Built by Students,
              <br />
              <span className="about-gradient-text">Powered by Curiosity.</span>
            </h1>

            <p className="about-hero-desc">
              JasaGo is a simple yet functional service marketplace born out of
              a passion for learning. I combine modern web technologies with
              Machine Learning to make hiring service providers easier for
              everyone.
            </p>

            <button
              className="about-back-btn"
              onClick={() => navigate("/home")}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </button>
          </motion.div>
        </div>
      </section>

      {/* ===== STATS STRIP ===== */}
      <section className="about-stats">
        <div className="about-stats-grid">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              viewport={{ once: true }}
              className="about-stat-card"
            >
              <s.icon className="about-stat-icon" />
              <span className="about-stat-value">{s.value}</span>
              <span className="about-stat-label">{s.label}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== MISSION ===== */}
      <section className="about-mission">
        <div className="about-container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="about-mission-card"
          >
            <div className="about-mission-icon">
              <Target className="w-7 h-7" />
            </div>
            <h2 className="about-section-title">Our Mission</h2>
            <p className="about-mission-text">
              Make it easy for anyone to find trusted service providers for
              everyday needs — from AC repair and plumbing to cleaning and
              moving. We combine traditional marketplace features with Machine
              Learning to give users smarter pricing insights and honest review
              analysis, so both clients and providers can make better decisions.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ===== WHAT WE DO ===== */}
      <section className="about-what">
        <div className="about-container">
          <div className="about-section-header">
            <span className="about-section-badge">What We Do</span>
            <h2 className="about-section-heading">
              More Than Just a Marketplace
            </h2>
            <p className="about-section-subtitle">
              A few things we believe make JasaGo different
            </p>
          </div>

          <div className="about-features-grid">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                viewport={{ once: true }}
                whileHover={{ y: -6 }}
                className="about-feature-card"
              >
                <div
                  className={`about-feature-icon-wrapper bg-gradient-to-br ${f.color}`}
                >
                  <img
                    src={f.img}
                    alt={f.title}
                    className="about-feature-icon-img"
                  />
                </div>
                <h3 className="about-feature-title">{f.title}</h3>
                <p className="about-feature-desc">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TECH STACK ===== */}
      <section className="about-tech">
        <div className="about-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="about-tech-card"
          >
            <div className="about-tech-header">
              <Zap className="w-6 h-6 text-yellow-400" />
              <h2 className="about-tech-title">Built With</h2>
            </div>
            <div className="about-tech-list">
              {[
                "React + TypeScript",
                "Express.js + Node.js",
                "SQLite Database",
                "Python FastAPI (ML)",
                "Tailwind CSS",
                "JWT Authentication",
              ].map((tech) => (
                <span key={tech} className="about-tech-chip">
                  {tech}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="about-cta">
        <div className="about-container">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="about-cta-content"
          >
            <Wrench className="about-cta-icon" />
            <h2 className="about-cta-title">Ready to Get Started?</h2>
            <p className="about-cta-desc">
              Explore our services or list your own — it's free and easy.
            </p>
            <button className="about-cta-btn" onClick={() => navigate("/home")}>
              <Rocket className="w-5 h-5" />
              Go to Home
            </button>
          </motion.div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="about-footer">
        <p>&copy; 2029 JasaGo. Built with passion by students.</p>
      </footer>
    </div>
  );
}
