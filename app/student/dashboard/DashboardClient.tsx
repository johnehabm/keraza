'use client'
/**
 * KERAZA PLATFORM — Student Dashboard
 * File: app/(student)/dashboard/DashboardClient.tsx
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Trophy, Star, Flame, BookOpen, Clock, ChevronRight,
  Bell, Award, Target, TrendingUp, Zap, CheckCircle,
  Lock, Play, Users, Menu, X, LogOut, Moon, Sun
} from 'lucide-react'

// ─── Types ─────────────────────────────────────────────────────────────────────
interface Profile {
  id: string; full_name: string; church_name: string; grade: string
  total_xp: number; current_level: number; streak_days: number; avatar_url?: string
}
interface Week {
  id: string; title: string; week_number: number; opens_at: string
  closes_at?: string; pdf_url?: string; xp_reward_full: number
}
interface Submission {
  id: string; week_id: string; score: number; xp_earned: number
  submitted_at: string; weeks?: { title: string; week_number: number }
}
interface Badge {
  id: string
  badges: { name_ar: string; description_ar: string; icon_url: string; rarity: string }
}
interface Notification {
  id: string; title_ar: string; message_ar: string; type: string
  is_read: boolean; created_at: string
}
interface LeaderboardEntry {
  rank: number; full_name: string; church_name: string; total_xp: number; current_level: number
}

// ─── XP / Level Helpers ────────────────────────────────────────────────────────
function getXPForLevel(level: number) { return Math.floor(100 * Math.pow(1.5, level - 1)) }
function getLevelInfo(totalXP: number) {
  let level = 1, remaining = totalXP
  while (remaining >= getXPForLevel(level)) { remaining -= getXPForLevel(level); level++ }
  return { level, currentXP: remaining, nextLevelXP: getXPForLevel(level) }
}

// ─── Rarity Colors ─────────────────────────────────────────────────────────────
const rarityStyles: Record<string, string> = {
  common: '#94a3b8, #64748b', rare: '#60a5fa, #2563eb',
  epic: '#a78bfa, #6d28d9', legendary: '#f59e0b, #ea580c',
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────
const mockProfile: Profile = {
  id: '1', full_name: 'يوسف مجدي', church_name: 'كنيسة مارمرقس',
  grade: 'الصف الثاني الإعدادي', total_xp: 1240, current_level: 4, streak_days: 7,
}
const mockWeeks: Week[] = [
  { id: 'w1', title: 'البشارة والكرازة', week_number: 1, opens_at: '2024-01-01', xp_reward_full: 100 },
  { id: 'w2', title: 'الإيمان والأعمال', week_number: 2, opens_at: '2024-01-08', xp_reward_full: 120 },
  { id: 'w3', title: 'الصلاة والتأمل', week_number: 3, opens_at: '2099-12-01', xp_reward_full: 150 },
]
const mockSubmissions: Submission[] = [
  { id: 's1', week_id: 'w1', score: 95, xp_earned: 95, submitted_at: '2024-01-05', weeks: { title: 'البشارة والكرازة', week_number: 1 } },
  { id: 's2', week_id: 'w2', score: 80, xp_earned: 72, submitted_at: '2024-01-12', weeks: { title: 'الإيمان والأعمال', week_number: 2 } },
]
const mockBadges: Badge[] = [
  { id: 'b1', badges: { name_ar: 'الخطوة الأولى', description_ar: 'أكمل أول امتحان', icon_url: '🎯', rarity: 'common' } },
  { id: 'b2', badges: { name_ar: 'علامة كاملة', description_ar: 'حصل على 100%', icon_url: '⭐', rarity: 'epic' } },
  { id: 'b3', badges: { name_ar: 'أسبوع متواصل', description_ar: '7 أيام متتالية', icon_url: '🔥', rarity: 'rare' } },
]
const mockNotifications: Notification[] = [
  { id: 'n1', title_ar: 'أسبوع جديد!', message_ar: 'الأسبوع الثالث متاح الآن للدراسة', type: 'week', is_read: false, created_at: '2024-01-15' },
  { id: 'n2', title_ar: 'مبروك!', message_ar: 'حصلت على شارة "الخطوة الأولى"', type: 'badge', is_read: true, created_at: '2024-01-05' },
]
const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, full_name: 'مريم فادي', church_name: 'كنيسة القديسة', total_xp: 2400, current_level: 7 },
  { rank: 2, full_name: 'بطرس نبيل', church_name: 'كنيسة مارجرجس', total_xp: 1890, current_level: 6 },
  { rank: 3, full_name: 'يوسف مجدي', church_name: 'كنيسة مارمرقس', total_xp: 1240, current_level: 4 },
  { rank: 4, full_name: 'هنا إيهاب', church_name: 'كنيسة أبوسيفين', total_xp: 1100, current_level: 4 },
  { rank: 5, full_name: 'كيرلس سامي', church_name: 'كنيسة مارمينا', total_xp: 980, current_level: 3 },
]

// ─── Design System ─────────────────────────────────────────────────────────────
const D = {
  gradPrimary:  'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)',
  gradSuccess:  'linear-gradient(135deg, #059669 0%, #0ea5e9 100%)',
  gradWarning:  'linear-gradient(135deg, #d97706 0%, #dc2626 100%)',
  gradStreak:   'linear-gradient(135deg, #f97316, #ef4444)',
  glowPurple:   '0 0 28px rgba(124,58,237,0.2), 0 4px 16px rgba(124,58,237,0.12)',
  glowGold:     '0 0 24px rgba(245,158,11,0.3)',
  glowTeal:     '0 0 20px rgba(14,165,233,0.22)',
}

const tokens = {
  dark: {
    bg:           'linear-gradient(160deg,#060818 0%,#0e1027 50%,#080f1f 100%)',
    cardBg:       'rgba(255,255,255,0.035)',
    surface:      'rgba(255,255,255,0.06)',
    border:       'rgba(255,255,255,0.07)',
    borderAccent: 'rgba(124,58,237,0.35)',
    text:         '#f1f5f9',
    textMuted:    '#94a3b8',
    textSubtle:   'rgba(255,255,255,0.38)',
    navBg:        'rgba(6,8,24,0.82)',
  },
  light: {
    bg:           'linear-gradient(160deg,#f8f9ff 0%,#eef1ff 50%,#f4f6ff 100%)',
    cardBg:       'rgba(255,255,255,0.9)',
    surface:      'rgba(255,255,255,0.98)',
    border:       'rgba(99,102,241,0.12)',
    borderAccent: 'rgba(124,58,237,0.28)',
    text:         '#1e1b4b',
    textMuted:    '#6366f1',
    textSubtle:   'rgba(30,27,75,0.42)',
    navBg:        'rgba(255,255,255,0.88)',
  },
}

// ─── Main Dashboard ─────────────────────────────────────────────────────────────
export default function DashboardClient({
  profile = mockProfile, weeks = mockWeeks, submissions = mockSubmissions,
  badges = mockBadges, notifications = mockNotifications, leaderboard = mockLeaderboard,
}: {
  profile?: Profile; weeks?: Week[]; submissions?: Submission[]
  badges?: Badge[]; notifications?: Notification[]; leaderboard?: LeaderboardEntry[]
}) {
  const [darkMode, setDarkMode] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'home' | 'weeks' | 'badges' | 'leaderboard'>('home')
  const [showLevelUp, setShowLevelUp] = useState(false)
  const [xpAnimated, setXpAnimated] = useState(0)
  const [loggingOut, setLoggingOut] = useState(false)

  const levelInfo = getLevelInfo(profile.total_xp)
  const submittedWeekIds = new Set(submissions.map(s => s.week_id))
  const unreadCount = notifications.filter(n => !n.is_read).length

  useEffect(() => {
    const timer = setTimeout(() => { setXpAnimated(profile.total_xp) }, 500)
    return () => clearTimeout(timer)
  }, [profile.total_xp])

  const isWeekOpen = (w: Week) => new Date(w.opens_at) <= new Date()
  const isWeekDone = (w: Week) => submittedWeekIds.has(w.id)

  async function handleLogout() {
    setLoggingOut(true)
    try { await fetch('/api/auth/logout', { method: 'POST' }) }
    finally { window.location.href = '/auth/login' }
  }

  const t = darkMode ? tokens.dark : tokens.light

  const tabLabels: Record<string, string> = {
    home: 'الرئيسية', weeks: 'الأسابيع', badges: 'الشارات', leaderboard: 'المتصدرون',
  }
  const tabIcons: Record<string, React.ReactNode> = {
    home: <Target size={14} />, weeks: <BookOpen size={14} />,
    badges: <Award size={14} />, leaderboard: <Trophy size={14} />,
  }

  // Shared card style
  const card = {
    background: t.cardBg, borderRadius: 20, padding: 22,
    border: `1px solid ${t.border}`, backdropFilter: 'blur(12px)',
  }

  // Icon button style
  const iconBtn = (active = false) => ({
    width: 36, height: 36, borderRadius: 10, border: `1px solid ${active ? 'rgba(124,58,237,0.4)' : t.border}`,
    background: active ? 'rgba(124,58,237,0.16)' : t.cardBg,
    cursor: 'pointer' as const, display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: active ? '#a78bfa' : t.textMuted, transition: 'all 0.2s',
  })

  return (
    <div dir="rtl" style={{
      minHeight: '100vh', background: t.bg,
      fontFamily: "'Cairo','Tajawal','Segoe UI',sans-serif",
      color: t.text, transition: 'background 0.4s ease, color 0.3s ease',
    }}>

      {/* ── Navbar ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: t.navBg,
        backdropFilter: 'blur(24px) saturate(160%)',
        WebkitBackdropFilter: 'blur(24px) saturate(160%)',
        borderBottom: `1px solid ${t.border}`,
        padding: '0 1.25rem',
        boxShadow: darkMode
          ? '0 1px 0 rgba(255,255,255,0.04),0 4px 24px rgba(0,0,0,0.4)'
          : '0 4px 20px rgba(99,102,241,0.08)',
      }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, background: D.gradPrimary,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 17, boxShadow: D.glowPurple,
            }}>✝</div>
            <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: '0.01em' }}>مهرجان الكرازة</span>
          </div>

          {/* Desktop tabs */}
          <div style={{
            display: 'flex', gap: 2, alignItems: 'center',
            background: t.surface, padding: 4, borderRadius: 14, border: `1px solid ${t.border}`,
          }}>
            {(['home', 'weeks', 'badges', 'leaderboard'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                padding: '7px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
                background: activeTab === tab ? D.gradPrimary : 'transparent',
                color: activeTab === tab ? '#fff' : t.textMuted,
                fontFamily: 'inherit', fontSize: 13, fontWeight: activeTab === tab ? 700 : 500,
                transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6,
                boxShadow: activeTab === tab ? D.glowPurple : 'none', whiteSpace: 'nowrap',
              }}>
                {tabIcons[tab]}{tabLabels[tab]}
              </button>
            ))}
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <button onClick={() => setNotifOpen(!notifOpen)} style={{ ...iconBtn(notifOpen), position: 'relative' }}>
              <Bell size={17} />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute', top: 7, right: 7, width: 7, height: 7,
                  borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 6px rgba(239,68,68,0.6)',
                }} />
              )}
            </button>
            <button onClick={() => setDarkMode(!darkMode)} style={iconBtn()}>
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button onClick={handleLogout} disabled={loggingOut} title="تسجيل الخروج" style={{
              height: 36, padding: '0 14px', borderRadius: 10,
              background: darkMode ? 'rgba(239,68,68,0.1)' : 'rgba(239,68,68,0.07)',
              border: '1px solid rgba(239,68,68,0.2)',
              cursor: loggingOut ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
              color: '#f87171', fontFamily: 'inherit', fontSize: 13, fontWeight: 700,
              opacity: loggingOut ? 0.6 : 1, transition: 'all 0.2s',
            }}>
              <LogOut size={15} />
              {loggingOut ? 'جاري الخروج...' : 'خروج'}
            </button>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={iconBtn(mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: 'hidden', borderTop: `1px solid ${t.border}` }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '10px 0 8px' }}>
                {(['home', 'weeks', 'badges', 'leaderboard'] as const).map(tab => (
                  <button key={tab} onClick={() => { setActiveTab(tab); setMobileMenuOpen(false) }} style={{
                    padding: '10px 16px', borderRadius: 10, border: 'none', cursor: 'pointer',
                    background: activeTab === tab ? 'rgba(124,58,237,0.12)' : 'transparent',
                    color: activeTab === tab ? '#a78bfa' : t.textMuted,
                    fontFamily: 'inherit', fontSize: 14, fontWeight: activeTab === tab ? 700 : 400,
                    textAlign: 'right', display: 'flex', alignItems: 'center', gap: 10,
                    borderRight: activeTab === tab ? '3px solid #7c3aed' : '3px solid transparent',
                  }}>
                    {tabIcons[tab]}{tabLabels[tab]}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Notification dropdown */}
        <AnimatePresence>
          {notifOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }} transition={{ duration: 0.18 }}
              style={{
                position: 'absolute', top: 68, left: 16, width: 340,
                background: darkMode ? '#0d1027' : '#fff',
                border: `1px solid ${t.border}`, borderRadius: 18, overflow: 'hidden', zIndex: 100,
                boxShadow: darkMode
                  ? '0 24px 60px rgba(0,0,0,0.6),0 0 0 1px rgba(255,255,255,0.04)'
                  : '0 16px 40px rgba(99,102,241,0.15)',
              }}
            >
              <div style={{
                padding: '14px 18px', borderBottom: `1px solid ${t.border}`,
                fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <span>الإشعارات</span>
                {unreadCount > 0 && (
                  <span style={{ background: D.gradPrimary, color: '#fff', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>
                    {unreadCount}
                  </span>
                )}
              </div>
              {notifications.map(n => (
                <div key={n.id} style={{
                  padding: '13px 18px',
                  background: !n.is_read ? (darkMode ? 'rgba(124,58,237,0.08)' : 'rgba(124,58,237,0.04)') : 'transparent',
                  borderBottom: `1px solid ${t.border}`,
                }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                      background: n.type === 'badge'
                        ? 'linear-gradient(135deg,rgba(245,158,11,0.2),rgba(234,88,12,0.2))'
                        : n.type === 'week'
                          ? 'linear-gradient(135deg,rgba(14,165,233,0.2),rgba(124,58,237,0.2))'
                          : t.surface,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                    }}>
                      {n.type === 'badge' ? '🏅' : n.type === 'week' ? '📖' : '🔔'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: 13 }}>{n.title_ar}</p>
                      <p style={{ margin: '3px 0 0', fontSize: 12, color: t.textMuted, lineHeight: 1.4 }}>{n.message_ar}</p>
                    </div>
                    {!n.is_read && (
                      <div style={{
                        width: 8, height: 8, borderRadius: '50%', background: '#7c3aed',
                        boxShadow: '0 0 8px rgba(124,58,237,0.6)', marginTop: 5, flexShrink: 0,
                      }} />
                    )}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ── Main Content ── */}
      <main style={{ maxWidth: 1240, margin: '0 auto', padding: '1.75rem 1.25rem 4rem' }}>

        {/* ── HOME TAB ── */}
        {activeTab === 'home' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,360px)', gap: 20 }}>

            {/* Left column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

              {/* Hero profile card */}
              <motion.div
                initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                style={{
                  background: 'linear-gradient(145deg,rgba(124,58,237,0.22) 0%,rgba(37,99,235,0.18) 60%,rgba(14,165,233,0.14) 100%)',
                  borderRadius: 22, padding: 26, border: `1px solid ${t.borderAccent}`,
                  backdropFilter: 'blur(12px)', position: 'relative', overflow: 'hidden',
                  boxShadow: D.glowPurple,
                }}
              >
                {/* Decorative orbs */}
                <div style={{
                  position: 'absolute', top: -60, left: -60, width: 200, height: 200,
                  borderRadius: '50%', background: 'radial-gradient(circle,rgba(124,58,237,0.25) 0%,transparent 70%)',
                  filter: 'blur(20px)', pointerEvents: 'none',
                }} />
                <div style={{
                  position: 'absolute', bottom: -40, right: -40, width: 180, height: 180,
                  borderRadius: '50%', background: 'radial-gradient(circle,rgba(14,165,233,0.2) 0%,transparent 70%)',
                  filter: 'blur(20px)', pointerEvents: 'none',
                }} />

                <div style={{ position: 'relative', display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap' }}>
                  {/* Avatar */}
                  <div style={{
                    width: 68, height: 68, borderRadius: '50%', background: D.gradPrimary,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 26, fontWeight: 800, color: '#fff', flexShrink: 0,
                    boxShadow: `0 0 0 3px rgba(255,255,255,0.12),${D.glowPurple}`,
                  }}>
                    {profile.full_name[0]}
                  </div>
                  <div style={{ flex: 1, minWidth: 140 }}>
                    <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, lineHeight: 1.2 }}>
                      أهلاً، {profile.full_name.split(' ')[0]} 👋
                    </h1>
                    <p style={{ margin: '5px 0 0', fontSize: 13, color: t.textMuted }}>
                      {profile.church_name} · {profile.grade}
                    </p>
                  </div>
                  {/* Streak */}
                  <div style={{
                    background: D.gradStreak, borderRadius: 12, padding: '8px 14px',
                    display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
                    boxShadow: '0 4px 16px rgba(239,68,68,0.3)',
                  }}>
                    <Flame size={16} color="#fff" />
                    <span style={{ color: '#fff', fontWeight: 800, fontSize: 16 }}>{profile.streak_days}</span>
                    <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11 }}>يوم</span>
                  </div>
                </div>

                {/* XP Bar */}
                <div style={{ position: 'relative', marginTop: 22 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 26, height: 26, borderRadius: 8, background: D.gradPrimary,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 800, color: '#fff', boxShadow: D.glowPurple,
                      }}>{levelInfo.level}</div>
                      <span style={{ fontSize: 14, fontWeight: 700 }}>المستوى {levelInfo.level}</span>
                    </div>
                    <span style={{ fontSize: 12, color: t.textMuted, fontWeight: 600 }}>
                      {levelInfo.currentXP.toLocaleString()} / {levelInfo.nextLevelXP.toLocaleString()} XP
                    </span>
                  </div>
                  <div style={{ height: 10, background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(99,102,241,0.12)', borderRadius: 10, overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(levelInfo.currentXP / levelInfo.nextLevelXP) * 100}%` }}
                      transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
                      style={{ height: '100%', background: D.gradPrimary, borderRadius: 10, boxShadow: '0 0 12px rgba(124,58,237,0.5)' }}
                    />
                  </div>
                  <p style={{ margin: '8px 0 0', fontSize: 12, color: t.textSubtle, textAlign: 'center' }}>
                    {(levelInfo.nextLevelXP - levelInfo.currentXP).toLocaleString()} XP للمستوى التالي
                  </p>
                </div>

                {/* Stats row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginTop: 18 }}>
                  {[
                    { icon: <Zap size={16} />, value: profile.total_xp.toLocaleString(), label: 'مجموع XP', color: '#f59e0b' },
                    { icon: <CheckCircle size={16} />, value: submissions.length, label: 'امتحان مكتمل', color: '#10b981' },
                    { icon: <Award size={16} />, value: badges.length, label: 'شارة', color: '#a78bfa' },
                  ].map(({ icon, value, label, color }) => (
                    <div key={label} style={{
                      background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.6)',
                      borderRadius: 14, padding: '12px 10px', border: `1px solid ${t.border}`,
                      textAlign: 'center', backdropFilter: 'blur(8px)',
                    }}>
                      <div style={{ color, display: 'flex', justifyContent: 'center', marginBottom: 5 }}>{icon}</div>
                      <div style={{ fontSize: 20, fontWeight: 800, lineHeight: 1 }}>{value}</div>
                      <div style={{ fontSize: 11, color: t.textMuted, marginTop: 3 }}>{label}</div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Recent activity */}
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                style={card}
              >
                <h2 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <TrendingUp size={18} color="#a78bfa" />
                  آخر النتائج
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {submissions.slice(-3).reverse().map((s, i) => (
                    <motion.div key={s.id}
                      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 * i }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 14, padding: '11px 14px',
                        background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(99,102,241,0.04)',
                        borderRadius: 14, border: `1px solid ${t.border}`,
                      }}
                    >
                      <div style={{
                        width: 42, height: 42, borderRadius: 12, flexShrink: 0, fontSize: 18,
                        background: s.score >= 90 ? D.gradWarning : s.score >= 60 ? D.gradSuccess : 'linear-gradient(135deg,#6b7280,#374151)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: s.score >= 90 ? D.glowGold : s.score >= 60 ? D.glowTeal : 'none',
                      }}>
                        {s.score >= 90 ? '⭐' : s.score >= 60 ? '✅' : '📝'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.weeks?.title}</p>
                        <p style={{ margin: '2px 0 0', fontSize: 12, color: t.textMuted }}>الأسبوع {s.weeks?.week_number}</p>
                      </div>
                      <div style={{ textAlign: 'center', flexShrink: 0 }}>
                        <div style={{ fontSize: 19, fontWeight: 800, color: s.score >= 90 ? '#f59e0b' : s.score >= 60 ? '#10b981' : '#ef4444' }}>
                          {s.score}%
                        </div>
                        <div style={{ fontSize: 11, color: t.textSubtle }}>+{s.xp_earned} XP</div>
                      </div>
                    </motion.div>
                  ))}
                  {submissions.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '32px 20px', color: t.textMuted }}>
                      <BookOpen size={38} style={{ margin: '0 auto 12px', opacity: 0.4, display: 'block' }} />
                      <p style={{ margin: 0, fontSize: 14 }}>لم تكمل أي امتحان بعد. ابدأ الآن!</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Right column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

              {/* Leaderboard preview */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} style={card}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Trophy size={18} color="#f59e0b" />المتصدرون
                  </h2>
                  <button onClick={() => setActiveTab('leaderboard')} style={{
                    background: 'none', border: 'none', cursor: 'pointer', color: '#a78bfa',
                    fontSize: 12, fontFamily: 'inherit', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4,
                  }}>
                    عرض الكل <ChevronRight size={13} />
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {leaderboard.slice(0, 5).map((entry, i) => {
                    const isMe = entry.full_name === profile.full_name
                    const rankEmoji = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`
                    return (
                      <div key={entry.rank} style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 12,
                        background: isMe
                          ? darkMode ? 'linear-gradient(135deg,rgba(124,58,237,0.2),rgba(37,99,235,0.18))' : 'linear-gradient(135deg,rgba(124,58,237,0.1),rgba(37,99,235,0.07))'
                          : 'transparent',
                        border: isMe ? '1px solid rgba(124,58,237,0.35)' : '1px solid transparent',
                        transition: 'all 0.2s',
                      }}>
                        <span style={{ fontSize: 15, minWidth: 22, textAlign: 'center' }}>{rankEmoji}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: 0, fontSize: 13, fontWeight: isMe ? 800 : 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {entry.full_name} {isMe && <span style={{ fontSize: 10, color: '#a78bfa', fontWeight: 700 }}>(أنت)</span>}
                          </p>
                          <p style={{ margin: 0, fontSize: 11, color: t.textMuted }}>{entry.church_name}</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                          <Zap size={13} color="#a78bfa" />
                          <span style={{ fontWeight: 800, fontSize: 14, color: isMe ? '#a78bfa' : t.text }}>{entry.total_xp}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </motion.div>

              {/* Badges preview */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} style={card}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Award size={18} color="#a78bfa" />
                    شاراتي ({badges.length})
                  </h2>
                  <button onClick={() => setActiveTab('badges')} style={{
                    background: 'none', border: 'none', cursor: 'pointer', color: '#a78bfa',
                    fontSize: 12, fontFamily: 'inherit', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4,
                  }}>
                    الكل <ChevronRight size={14} />
                  </button>
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {badges.map(b => (
                    <div key={b.id} title={b.badges.name_ar} style={{
                      width: 60, height: 60, borderRadius: 16,
                      background: `linear-gradient(135deg, ${rarityStyles[b.badges.rarity] || rarityStyles.common})`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 28, cursor: 'pointer',
                      boxShadow: b.badges.rarity === 'legendary' ? D.glowGold : b.badges.rarity === 'epic' ? D.glowPurple : 'none',
                      transition: 'transform 0.2s',
                    }}>
                      {b.badges.icon_url}
                    </div>
                  ))}
                  {badges.length === 0 && (
                    <p style={{ fontSize: 13, color: t.textMuted, margin: 0 }}>لم تحصل على شارات بعد. أكمل الامتحانات!</p>
                  )}
                </div>
              </motion.div>

              {/* Quick actions */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} style={{
                background: darkMode
                  ? 'linear-gradient(145deg,rgba(124,58,237,0.15) 0%,rgba(37,99,235,0.12) 100%)'
                  : 'linear-gradient(145deg,rgba(124,58,237,0.08) 0%,rgba(37,99,235,0.06) 100%)',
                borderRadius: 20, padding: 20, border: '1px solid rgba(124,58,237,0.25)',
              }}>
                <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700 }}>ابدأ الآن</h3>
                {weeks.filter(w => isWeekOpen(w) && !isWeekDone(w)).slice(0, 1).map(w => (
                  <button key={w.id} onClick={() => setActiveTab('weeks')} style={{
                    width: '100%', padding: '14px 16px', borderRadius: 14,
                    background: D.gradPrimary, border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 12,
                    color: '#fff', fontFamily: 'inherit',
                    boxShadow: D.glowPurple, transition: 'opacity 0.2s',
                  }}>
                    <Play size={20} fill="#fff" />
                    <div style={{ textAlign: 'right', flex: 1 }}>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>{w.title}</p>
                      <p style={{ margin: 0, fontSize: 12, opacity: 0.8 }}>الأسبوع {w.week_number} · يصل لـ {w.xp_reward_full} XP</p>
                    </div>
                    <ChevronRight size={18} style={{ transform: 'rotate(180deg)' }} />
                  </button>
                ))}
                {weeks.filter(w => isWeekOpen(w) && !isWeekDone(w)).length === 0 && (
                  <p style={{ margin: 0, fontSize: 13, color: t.textMuted, textAlign: 'center', padding: '8px 0' }}>
                    أحسنت! أكملت جميع الأسابيع المتاحة ✅
                  </p>
                )}
              </motion.div>
            </div>
          </div>
        )}

        {/* ── WEEKS TAB ── */}
        {activeTab === 'weeks' && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>خريطة الأسابيع</h2>
              <p style={{ margin: '6px 0 0', color: t.textMuted, fontSize: 13 }}>تتبع تقدمك في الأسابيع الدراسية</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {weeks.map((week, i) => {
                const open = isWeekOpen(week)
                const done = isWeekDone(week)
                const sub = submissions.find(s => s.week_id === week.id)
                return (
                  <motion.div key={week.id}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                    style={{
                      background: t.cardBg, borderRadius: 20, padding: 24,
                      border: done
                        ? '1px solid rgba(16,185,129,0.4)'
                        : open
                          ? '1px solid rgba(124,58,237,0.4)'
                          : `1px solid ${t.border}`,
                      opacity: open ? 1 : 0.6,
                      backdropFilter: 'blur(12px)',
                      boxShadow: done ? '0 4px 24px rgba(16,185,129,0.07)' : open ? '0 4px 24px rgba(124,58,237,0.08)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                      {/* Week number circle */}
                      <div style={{
                        width: 56, height: 56, borderRadius: '50%', flexShrink: 0,
                        background: done ? D.gradSuccess : open ? D.gradPrimary : darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: done ? D.glowTeal : open ? D.glowPurple : 'none',
                      }}>
                        {done ? <CheckCircle size={24} color="#fff" /> : open ? <BookOpen size={24} color="#fff" /> : <Lock size={24} color={t.textMuted} />}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>{week.title}</h3>
                          {done && (
                            <span style={{
                              background: 'rgba(16,185,129,0.15)', color: '#10b981',
                              fontSize: 11, padding: '2px 10px', borderRadius: 20, fontWeight: 700,
                              border: '1px solid rgba(16,185,129,0.25)',
                            }}>مكتمل</span>
                          )}
                          {!open && (
                            <span style={{
                              background: darkMode ? 'rgba(148,163,184,0.15)' : 'rgba(0,0,0,0.06)',
                              color: t.textMuted, fontSize: 11, padding: '2px 10px', borderRadius: 20,
                            }}>مقفل</span>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: 16, fontSize: 12, color: t.textMuted, flexWrap: 'wrap', alignItems: 'center' }}>
                          <span>الأسبوع {week.week_number}</span>
                          <span>•</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Zap size={12} />{week.xp_reward_full} XP كحد أقصى
                          </span>
                          {sub && <span style={{ color: sub.score >= 90 ? '#f59e0b' : '#10b981', fontWeight: 700 }}>• نتيجتك: {sub.score}%</span>}
                        </div>
                      </div>

                      {open && !done && (
                        <button
                          onClick={() => { window.location.href = `/student/weeks/${week.id}` }}
                          style={{
                            padding: '10px 20px', borderRadius: 12, border: 'none', cursor: 'pointer',
                            background: D.gradPrimary,
                            color: '#fff', fontFamily: 'inherit', fontWeight: 700, fontSize: 14,
                            display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
                            boxShadow: D.glowPurple, transition: 'opacity 0.2s',
                          }}>
                          ابدأ <Play size={14} fill="#fff" />
                        </button>
                      )}
                      {done && sub && (
                        <div style={{ textAlign: 'center', flexShrink: 0 }}>
                          <div style={{ fontSize: 24, fontWeight: 700, color: sub.score >= 90 ? '#f59e0b' : '#10b981' }}>
                            {sub.score}%
                          </div>
                          <div style={{ fontSize: 11, color: t.textSubtle }}>+{sub.xp_earned} XP</div>
                        </div>
                      )}
                    </div>

                    {/* Progress bar for done weeks */}
                    {done && sub && (
                      <div style={{ marginTop: 16 }}>
                        <div style={{ height: 6, background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{
                            height: '100%', width: `${sub.score}%`,
                            background: sub.score >= 90 ? D.gradWarning : D.gradSuccess,
                            borderRadius: 3, transition: 'width 1s ease',
                          }} />
                        </div>
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── BADGES TAB ── */}
        {activeTab === 'badges' && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>مجموعة الشارات</h2>
              <p style={{ margin: '6px 0 0', color: t.textMuted, fontSize: 13 }}>حصلت على {badges.length} شارة حتى الآن</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
              {badges.map((b, i) => (
                <motion.div key={b.id}
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.08 }}
                  style={{
                    background: t.cardBg, borderRadius: 20, padding: 24, textAlign: 'center',
                    border: `1px solid ${t.border}`, backdropFilter: 'blur(12px)',
                    boxShadow: b.badges.rarity === 'legendary' ? D.glowGold : b.badges.rarity === 'epic' ? D.glowPurple : 'none',
                  }}
                >
                  <div style={{
                    width: 68, height: 68, borderRadius: 18, margin: '0 auto 14px',
                    background: `linear-gradient(135deg, ${rarityStyles[b.badges.rarity] || rarityStyles.common})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34,
                    boxShadow: b.badges.rarity === 'legendary' ? D.glowGold : b.badges.rarity === 'epic' ? D.glowPurple : 'none',
                  }}>
                    {b.badges.icon_url}
                  </div>
                  <h3 style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 700 }}>{b.badges.name_ar}</h3>
                  <p style={{ margin: '0 0 12px', fontSize: 12, color: t.textMuted, lineHeight: 1.5 }}>{b.badges.description_ar}</p>
                  <span style={{
                    fontSize: 11, padding: '4px 14px', borderRadius: 20, fontWeight: 700,
                    background: b.badges.rarity === 'legendary' ? 'rgba(245,158,11,0.18)'
                      : b.badges.rarity === 'epic' ? 'rgba(124,58,237,0.18)'
                        : b.badges.rarity === 'rare' ? 'rgba(37,99,235,0.18)' : 'rgba(100,116,139,0.18)',
                    color: b.badges.rarity === 'legendary' ? '#f59e0b'
                      : b.badges.rarity === 'epic' ? '#a78bfa'
                        : b.badges.rarity === 'rare' ? '#60a5fa' : '#94a3b8',
                    border: `1px solid ${b.badges.rarity === 'legendary' ? 'rgba(245,158,11,0.25)'
                      : b.badges.rarity === 'epic' ? 'rgba(124,58,237,0.25)'
                        : b.badges.rarity === 'rare' ? 'rgba(37,99,235,0.25)' : 'rgba(100,116,139,0.2)'}`,
                  }}>
                    {b.badges.rarity === 'legendary' ? 'أسطوري' : b.badges.rarity === 'epic' ? 'ملحمي' : b.badges.rarity === 'rare' ? 'نادر' : 'شائع'}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* ── LEADERBOARD TAB ── */}
        {activeTab === 'leaderboard' && (
          <div>
            <div style={{ marginBottom: 28 }}>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
                <Trophy size={24} color="#f59e0b" />لوحة المتصدرين
              </h2>
              <p style={{ margin: '6px 0 0', color: t.textMuted, fontSize: 13 }}>أفضل الطلاب في مهرجان الكرازة</p>
            </div>

            {/* Top 3 podium */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 12, marginBottom: 32, flexWrap: 'wrap' }}>
              {[leaderboard[1], leaderboard[0], leaderboard[2]].map((entry, i) => {
                const heights = [140, 170, 120]
                const medals = ['🥈', '🥇', '🥉']
                const colors = [
                  'linear-gradient(135deg, #94a3b8, #64748b)',
                  'linear-gradient(135deg, #f59e0b, #d97706)',
                  'linear-gradient(135deg, #cd7f32, #a05c20)',
                ]
                const glows = ['none', D.glowGold, 'none']
                return (
                  <div key={`${i}-${entry?.rank ?? 'empty'}`} style={{ textAlign: 'center', width: 110 }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>{medals[i]}</div>
                    <div style={{
                      height: heights[i], borderRadius: '12px 12px 0 0',
                      background: colors[i], display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'flex-start', padding: 12,
                      boxShadow: glows[i],
                    }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: '50%',
                        background: 'rgba(255,255,255,0.25)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 8,
                        border: '2px solid rgba(255,255,255,0.35)',
                      }}>
                        {entry?.full_name[0]}
                      </div>
                      <p style={{ margin: 0, color: '#fff', fontSize: 12, fontWeight: 700, lineHeight: 1.3 }}>
                        {entry?.full_name.split(' ').slice(0, 2).join(' ')}
                      </p>
                      <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.85)', fontSize: 11, fontWeight: 600 }}>
                        {entry?.total_xp} XP
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Full list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {leaderboard.map((entry, i) => {
                const isMe = entry.full_name === profile.full_name
                return (
                  <motion.div key={entry.rank}
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 16,
                      padding: '14px 20px', borderRadius: 16,
                      background: isMe
                        ? darkMode ? 'linear-gradient(135deg,rgba(124,58,237,0.2),rgba(37,99,235,0.18))' : 'linear-gradient(135deg,rgba(124,58,237,0.1),rgba(37,99,235,0.08))'
                        : t.cardBg,
                      border: isMe ? '1px solid rgba(124,58,237,0.45)' : `1px solid ${t.border}`,
                      backdropFilter: 'blur(8px)',
                      boxShadow: isMe ? D.glowPurple : 'none',
                    }}
                  >
                    <span style={{ fontSize: 18, fontWeight: 700, minWidth: 32, textAlign: 'center' }}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                    </span>
                    <div style={{
                      width: 42, height: 42, borderRadius: '50%',
                      background: isMe ? D.gradPrimary : darkMode ? 'rgba(255,255,255,0.12)' : 'rgba(99,102,241,0.12)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 16, fontWeight: 700, flexShrink: 0,
                      color: isMe ? '#fff' : t.text,
                      boxShadow: isMe ? D.glowPurple : 'none',
                    }}>
                      {entry.full_name[0]}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {entry.full_name} {isMe && <span style={{ fontSize: 11, color: '#a78bfa', fontWeight: 700 }}>(أنت)</span>}
                      </p>
                      <p style={{ margin: 0, fontSize: 12, color: t.textMuted }}>{entry.church_name} • المستوى {entry.current_level}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                      <Zap size={16} color="#a78bfa" />
                      <span style={{ fontWeight: 700, fontSize: 16, color: isMe ? '#a78bfa' : t.text }}>{entry.total_xp}</span>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
