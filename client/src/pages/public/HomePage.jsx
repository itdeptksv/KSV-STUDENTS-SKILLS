import { Link } from 'react-router-dom';
import { Award, BookOpen, Users, Trophy, Image, ArrowRight, Star, Target, Lightbulb } from 'lucide-react';
import { useEffect, useState } from 'react';
import { skills as skillsApi, competitions as compApi, announcements as annApi } from '../../services';
import { formatDate } from '../../utils/helpers';

const SKILL_ICONS = ['📖', '✍️', '🎤', '👂', '🔢', '💻', '🎨', '🎵', '⚽', '🌟'];

export default function HomePage() {
  const [skillAreas, setSkillAreas] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    skillsApi.listAreas().then((r) => setSkillAreas(r.data.data || [])).catch(() => {});
    compApi.list({ status: 'upcoming', limit: 3 }).then((r) => setCompetitions(r.data.data || [])).catch(() => {});
    annApi.list().then((r) => setAnnouncements(r.data.data || [])).catch(() => {});
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1e3a5f] via-[#1e4d8c] to-[#0d9488] text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm mb-6">
            <Star size={14} className="text-yellow-300" />
            <span>Student Skills Development Portal</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight">
            Discover & Develop<br />Every Student's Potential
          </h1>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            KSV Skill Sets tracks, nurtures, and celebrates the diverse skills of every student — from academics to arts, sports to leadership.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/skills" className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2">
              Explore Skills <ArrowRight size={16} />
            </Link>
            <Link to="/competitions" className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-medium transition-colors border border-white/20">
              View Competitions
            </Link>
          </div>
        </div>
      </section>

      {/* Vision */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#1e3a5f] mb-3">Our Vision</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">Empowering every student to discover their unique strengths and grow into confident, capable individuals.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Target, title: 'Track Progress', desc: 'Monitor skill development across all areas with structured assessments and visual progress reports.', color: 'text-blue-600 bg-blue-50' },
              { icon: Award, title: 'Celebrate Achievement', desc: 'Recognize and reward student accomplishments through competitions, certificates, and gallery showcases.', color: 'text-teal-600 bg-teal-50' },
              { icon: Lightbulb, title: 'Guide Growth', desc: 'Provide teachers and parents with actionable insights to support each student\'s unique learning journey.', color: 'text-purple-600 bg-purple-50' },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="text-center p-6 rounded-xl border border-slate-100 hover:shadow-md transition-shadow">
                <div className={`inline-flex p-4 rounded-xl ${color} mb-4`}><Icon size={24} /></div>
                <h3 className="font-semibold text-slate-800 mb-2">{title}</h3>
                <p className="text-sm text-slate-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Skill Areas */}
      <section className="py-16 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-[#1e3a5f]">Skill Areas</h2>
            <Link to="/skills" className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          {skillAreas.length === 0 ? (
            <p className="text-slate-400 text-center py-8">Skill areas will appear here once configured.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {skillAreas.slice(0, 10).map((area, i) => (
                <div key={area._id} className="bg-white rounded-xl p-4 text-center border border-slate-200 hover:shadow-md transition-shadow cursor-default">
                  <div className="text-3xl mb-2">{SKILL_ICONS[i] || '⭐'}</div>
                  <p className="text-sm font-medium text-slate-700">{area.name}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Upcoming Competitions */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-[#1e3a5f]">Upcoming Competitions</h2>
            <Link to="/competitions" className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          {competitions.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No upcoming competitions at this time.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {competitions.map((comp) => (
                <Link key={comp._id} to={`/competitions/${comp._id}`}
                  className="border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-3">
                    <Trophy size={16} className="text-yellow-500" />
                    <span className="text-xs font-medium text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full capitalize">{comp.status}</span>
                  </div>
                  <h3 className="font-semibold text-slate-800 mb-1">{comp.title}</h3>
                  <p className="text-sm text-slate-500">{formatDate(comp.eventDate)}</p>
                  {comp.venue && <p className="text-xs text-slate-400 mt-1">{comp.venue}</p>}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Announcements */}
      {announcements.length > 0 && (
        <section className="py-16 px-4 bg-slate-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-[#1e3a5f] mb-8">Announcements</h2>
            <div className="space-y-4">
              {announcements.slice(0, 3).map((ann) => (
                <div key={ann._id} className="bg-white rounded-xl p-5 border border-slate-200">
                  <h3 className="font-semibold text-slate-800 mb-1">{ann.title}</h3>
                  <p className="text-sm text-slate-500">{ann.content}</p>
                  <p className="text-xs text-slate-400 mt-2">{formatDate(ann.createdAt)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 px-4 bg-[#1e3a5f] text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to track your child's progress?</h2>
          <p className="text-blue-200 mb-8">Parents and students can log in to view skill reports, achievements, and more.</p>
          <Link to="/login" className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-3 rounded-xl font-medium transition-colors inline-flex items-center gap-2">
            Login to Portal <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
