import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, ShieldCheck, Clock, BarChart3, CheckCircle, ArrowRight, Zap, RefreshCw } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header Navigation */}
      <header className="px-8 py-6 flex items-center justify-between border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-500 text-slate-950 font-black shadow-lg">
            <Layers className="w-6 h-6" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-200 to-emerald-400">
            ResolveIT
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <Link
            to="/login"
            className="px-5 py-2.5 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="px-5 py-2.5 text-sm font-bold rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 hover:opacity-95 shadow-lg shadow-cyan-500/20 transition-all transform hover:-translate-y-0.5"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative pt-20 pb-24 px-6 max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-6">
            <Zap className="w-4 h-4" />
            <span>Next-Gen Complaint Portal & DevOps Architecture</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white mb-6 leading-tight">
            Enterprise Complaint Management. <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-emerald-300 to-teal-400">
              “Raise. Track. Resolve.”
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg text-slate-400 mb-10 leading-relaxed">
            ResolveIT streamlines organizational support workflows with real-time status tracking, automated SLA monitoring, multi-tier RBAC authorization, and comprehensive DevOps metrics.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-extrabold text-base shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all flex items-center justify-center space-x-2"
            >
              <span>Launch Complaint Portal</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 font-bold text-base hover:bg-slate-800 transition-all"
            >
              Create Account
            </Link>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="py-16 px-6 max-w-6xl mx-auto border-t border-slate-800/80">
          <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-400 text-center mb-3">Capabilities</h2>
          <p className="text-3xl font-extrabold text-white text-center mb-12">Designed for Users, Support Staff & Engineering</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Automated SLA Monitoring</h3>
              <p className="text-sm text-slate-400">
                Configurable resolution hours based on priority levels (CRITICAL, HIGH, MEDIUM, LOW) with background cron breach detection.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Multi-Tier RBAC Security</h3>
              <p className="text-sm text-slate-400">
                Granular access control for Students/Employees, Support Staff, and Administrators with JWT token validation & Helmet defense.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Real-Time DevOps Monitoring</h3>
              <p className="text-sm text-slate-400">
                Native Prometheus metrics scraping at <code className="text-cyan-400">/metrics</code> and Swagger OpenAPI endpoints ready for Grafana dashboards.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-900 text-center text-xs text-slate-500">
        ResolveIT – Complaint Management System & DevOps Project. Built with React, Express, MongoDB, Docker, Kubernetes & Jenkins.
      </footer>
    </div>
  );
};

export default LandingPage;
