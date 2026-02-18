import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import {
    Trophy, BarChart3, Vote, Clock, CheckCircle,
    LogOut, User, ChevronDown, ChevronUp, TrendingUp,
    Loader2, Calendar, Archive, AlertCircle
} from 'lucide-react';
import { Bar, Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS, ArcElement, Tooltip, Legend,
    CategoryScale, LinearScale, BarElement, Title
} from 'chart.js';
import toast from 'react-hot-toast';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const COLORS = ['#0288D1', '#00897B', '#E65100', '#6A1B9A', '#C62828', '#2E7D32'];

// ─── Single ended-election result card ───────────────────────────────────────
const EndedElectionCard = ({ election, API_URL }) => {
    const [open, setOpen] = useState(false);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    const load = async () => {
        if (data) { setOpen(o => !o); return; }
        setLoading(true);
        try {
            const [elRes, stRes] = await Promise.all([
                axios.get(`${API_URL}/elections/${election._id}`),
                axios.get(`${API_URL}/votes/results/${election._id}`).catch(() => ({ data: { data: {} } }))
            ]);
            setData({
                candidates: elRes.data.data.candidates || [],
                stats: stRes.data.data || {}
            });
            setOpen(true);
        } catch { toast.error('Failed to load results'); }
        finally { setLoading(false); }
    };

    const sorted = data ? [...data.candidates].sort((a, b) => b.voteCount - a.voteCount) : [];
    const total = data?.stats?.totalVotes || 0;
    const winner = sorted[0];

    return (
        <div style={{
            background: '#fff',
            borderRadius: 18,
            border: '1px solid #e5e7eb',
            overflow: 'hidden',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            marginBottom: 14
        }}>
            {/* Header */}
            <div style={{
                background: election.isCertified
                    ? 'linear-gradient(135deg,#1B5E20,#2E7D32)'
                    : 'linear-gradient(135deg,#37474F,#546E7A)',
                padding: '16px 20px',
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', gap: 10, flexWrap: 'wrap'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: 8 }}>
                        <Trophy size={20} color={election.isCertified ? '#FFD700' : '#fff'} />
                    </div>
                    <div>
                        <p style={{ color: '#fff', fontWeight: 700, fontSize: 15, margin: 0 }}>{election.title}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                            <Calendar size={11} color="rgba(255,255,255,0.65)" />
                            <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11 }}>
                                {new Date(election.endDate).toLocaleDateString()}
                            </span>
                            {election.isCertified && (
                                <span style={{
                                    background: '#FFD700', color: '#1B5E20',
                                    borderRadius: 999, padding: '1px 8px', fontSize: 10, fontWeight: 700
                                }}>✓ Certified</span>
                            )}
                        </div>
                    </div>
                </div>
                <button onClick={load} disabled={loading} style={{
                    background: 'rgba(255,255,255,0.15)', color: '#fff',
                    border: '1px solid rgba(255,255,255,0.3)', borderRadius: 9,
                    padding: '7px 14px', fontWeight: 600, fontSize: 12,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5
                }}>
                    {loading ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
                        : open ? <><ChevronUp size={13} /> Hide</>
                            : <><BarChart3 size={13} /> Results</>}
                </button>
            </div>

            {/* Expanded body */}
            {open && data && (
                <div style={{ padding: '20px' }}>
                    {/* Stats row */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 18 }}>
                        {[
                            { label: 'Total Votes', value: total, bg: '#eff6ff', color: '#1d4ed8' },
                            { label: 'Turnout', value: `${data.stats.turnoutPercent || 0}%`, bg: '#f0fdf4', color: '#15803d' },
                            { label: 'Candidates', value: data.candidates.length, bg: '#fefce8', color: '#a16207' }
                        ].map(s => (
                            <div key={s.label} style={{ background: s.bg, borderRadius: 10, padding: '10px 12px', textAlign: 'center' }}>
                                <p style={{ color: s.color, fontSize: 10, fontWeight: 600, textTransform: 'uppercase', margin: 0 }}>{s.label}</p>
                                <p style={{ color: s.color, fontSize: 22, fontWeight: 800, margin: '3px 0 0' }}>{s.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Winner */}
                    {winner && (
                        <div style={{
                            background: election.isCertified
                                ? 'linear-gradient(135deg,#F59E0B,#D97706)'
                                : 'linear-gradient(135deg,#0288D1,#0D47A1)',
                            borderRadius: 14, padding: '14px 18px',
                            display: 'flex', alignItems: 'center', gap: 14,
                            color: '#fff', marginBottom: 18
                        }}>
                            <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 50, padding: 10 }}>
                                <Trophy size={22} color={election.isCertified ? '#fff' : '#FFD700'} />
                            </div>
                            <div>
                                <p style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', opacity: 0.85, margin: 0 }}>
                                    {election.isCertified ? '🏆 Official Winner' : '📊 Leading'}
                                </p>
                                <p style={{ fontSize: 19, fontWeight: 800, margin: '2px 0 0' }}>{winner.name}</p>
                                <p style={{ fontSize: 12, opacity: 0.8, margin: '1px 0 0' }}>
                                    {winner.voteCount} votes{total > 0 && ` · ${((winner.voteCount / total) * 100).toFixed(1)}%`}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Charts */}
                    {data.candidates.length > 0 && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 14, marginBottom: 18 }}>
                            <div style={{ background: '#f8fafc', borderRadius: 12, padding: 14 }}>
                                <p style={{ fontWeight: 700, fontSize: 12, color: '#374151', marginBottom: 10 }}>Vote Comparison</p>
                                <div style={{ height: 170 }}>
                                    <Bar
                                        data={{
                                            labels: data.candidates.map(c => c.name),
                                            datasets: [{ label: 'Votes', data: data.candidates.map(c => c.voteCount), backgroundColor: COLORS, borderRadius: 5 }]
                                        }}
                                        options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1, font: { size: 9 } } }, x: { ticks: { font: { size: 9 } } } } }}
                                    />
                                </div>
                            </div>
                            <div style={{ background: '#f8fafc', borderRadius: 12, padding: 14 }}>
                                <p style={{ fontWeight: 700, fontSize: 12, color: '#374151', marginBottom: 10 }}>Vote Share</p>
                                <div style={{ height: 170, display: 'flex', justifyContent: 'center' }}>
                                    <Pie
                                        data={{
                                            labels: data.candidates.map(c => c.name),
                                            datasets: [{ data: data.candidates.map(c => c.voteCount), backgroundColor: COLORS, borderWidth: 0 }]
                                        }}
                                        options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 8, font: { size: 9 } } } } }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Candidate list */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {sorted.map((c, i) => {
                            const pct = total > 0 ? ((c.voteCount / total) * 100).toFixed(1) : 0;
                            const col = COLORS[i % COLORS.length];
                            return (
                                <div key={c._id} style={{
                                    background: i === 0 ? `${col}0d` : '#f9fafb',
                                    border: i === 0 ? `1.5px solid ${col}30` : '1px solid #f3f4f6',
                                    borderRadius: 10, padding: '10px 14px'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            {i === 0 && <Trophy size={12} color={col} />}
                                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: col }} />
                                            <span style={{ fontWeight: 700, color: '#1e293b', fontSize: 13 }}>{i + 1}. {c.name}</span>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <span style={{ fontWeight: 800, color: col, fontSize: 14 }}>{pct}%</span>
                                            <p style={{ color: '#9ca3af', fontSize: 10, margin: 0 }}>{c.voteCount} votes</p>
                                        </div>
                                    </div>
                                    <div style={{ background: '#e5e7eb', borderRadius: 999, height: 5, overflow: 'hidden' }}>
                                        <div style={{ width: `${pct}%`, height: '100%', background: col, borderRadius: 999, transition: 'width 0.7s ease' }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── Main StudentDashboard ────────────────────────────────────────────────────
const StudentDashboard = () => {
    const { user, logout, API_URL } = useContext(AuthContext);
    const navigate = useNavigate();
    const [elections, setElections] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await axios.get(`${API_URL}/elections`);
                setElections(res.data.data || []);
            } catch { toast.error('Failed to load elections'); }
            finally { setLoading(false); }
        };
        fetch();
    }, [API_URL]);

    const activeElections = elections.filter(e => e.status === 'active');
    const endedElections = elections
        .filter(e => e.status === 'ended')
        .sort((a, b) => new Date(b.endDate) - new Date(a.endDate));

    const handleLogout = () => { logout(); navigate('/'); };

    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
            <div style={{ textAlign: 'center' }}>
                <Loader2 size={44} color="#0288D1" style={{ animation: 'spin 1s linear infinite', marginBottom: 12 }} />
                <p style={{ color: '#94a3b8' }}>Loading your dashboard...</p>
            </div>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0f172a 0%,#1e293b 60%,#0f172a 100%)' }}>

            {/* ── Top Nav ── */}
            <div style={{
                background: 'rgba(255,255,255,0.04)',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                padding: '14px 24px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <img src="/download.jpg" alt="logo" style={{ width: 36, height: 36, objectFit: 'contain', borderRadius: 8 }} />
                    <div>
                        <p style={{ color: '#fff', fontWeight: 700, fontSize: 14, margin: 0 }}>University of Bosaso</p>
                        <p style={{ color: '#64748b', fontSize: 11, margin: 0 }}>Online Voting System</p>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                        background: 'rgba(255,255,255,0.07)', borderRadius: 10,
                        padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 7
                    }}>
                        <User size={14} color="#94a3b8" />
                        <span style={{ color: '#cbd5e1', fontSize: 13, fontWeight: 600 }}>{user?.name}</span>
                        {user?.studentId && (
                            <span style={{ color: '#475569', fontSize: 11 }}>· {user.studentId}</span>
                        )}
                    </div>
                    <button onClick={handleLogout} style={{
                        background: 'rgba(239,68,68,0.12)', color: '#f87171',
                        border: '1px solid rgba(239,68,68,0.2)', borderRadius: 9,
                        padding: '6px 12px', cursor: 'pointer', fontWeight: 600, fontSize: 12,
                        display: 'flex', alignItems: 'center', gap: 5
                    }}>
                        <LogOut size={13} /> Logout
                    </button>
                </div>
            </div>

            {/* ── Body ── */}
            <div style={{ maxWidth: 820, margin: '0 auto', padding: '28px 16px 60px' }}>

                {/* Welcome */}
                <div style={{ marginBottom: 28 }}>
                    <h1 style={{ color: '#f1f5f9', fontSize: 22, fontWeight: 800, margin: 0 }}>
                        Welcome back, {user?.name?.split(' ')[0]} 👋
                    </h1>
                    <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>
                        Here's everything happening in your elections.
                    </p>
                </div>

                {/* ── ACTIVE ELECTIONS ── */}
                {activeElections.length > 0 && (
                    <div style={{ marginBottom: 32 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e' }} />
                            <h2 style={{ color: '#f1f5f9', fontSize: 16, fontWeight: 700, margin: 0 }}>Active Election</h2>
                        </div>
                        {activeElections.map(el => (
                            <div key={el._id} style={{
                                background: 'linear-gradient(135deg,#0c4a6e,#0369a1)',
                                borderRadius: 20, padding: '22px 24px',
                                display: 'flex', alignItems: 'center',
                                justifyContent: 'space-between', gap: 16,
                                boxShadow: '0 8px 32px rgba(3,105,161,0.35)', flexWrap: 'wrap'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                    <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 14, padding: 14 }}>
                                        <Vote size={28} color="#fff" />
                                    </div>
                                    <div>
                                        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', margin: 0 }}>
                                            Election In Progress
                                        </p>
                                        <p style={{ color: '#fff', fontWeight: 800, fontSize: 18, margin: '4px 0 0' }}>{el.title}</p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                                            <Clock size={12} color="rgba(255,255,255,0.6)" />
                                            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>
                                                Ends: {new Date(el.endDate).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigate(`/elections/${el._id}`)}
                                    style={{
                                        background: '#fff', color: '#0369a1',
                                        border: 'none', borderRadius: 12,
                                        padding: '12px 24px', fontWeight: 800,
                                        fontSize: 14, cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', gap: 7,
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                        transition: 'transform 0.15s'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
                                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                    <Vote size={16} />
                                    {user?.hasVoted ? 'View Results' : 'Vote Now'}
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── NO ACTIVE ELECTION notice ── */}
                {activeElections.length === 0 && (
                    <div style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px dashed rgba(255,255,255,0.1)',
                        borderRadius: 16, padding: '20px 24px',
                        display: 'flex', alignItems: 'center', gap: 12,
                        marginBottom: 28
                    }}>
                        <AlertCircle size={20} color="#64748b" />
                        <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>
                            No active election at the moment. Check back later.
                        </p>
                    </div>
                )}

                {/* ── ENDED ELECTIONS ── */}
                {endedElections.length > 0 && (
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                            <Archive size={16} color="#94a3b8" />
                            <h2 style={{ color: '#f1f5f9', fontSize: 16, fontWeight: 700, margin: 0 }}>
                                Past Election Results
                            </h2>
                            <span style={{
                                background: 'rgba(255,255,255,0.08)', color: '#94a3b8',
                                borderRadius: 999, padding: '2px 10px', fontSize: 12, fontWeight: 600
                            }}>{endedElections.length}</span>
                        </div>
                        {endedElections.map(el => (
                            <EndedElectionCard key={el._id} election={el} API_URL={API_URL} />
                        ))}
                    </div>
                )}

                {/* ── EMPTY STATE ── */}
                {elections.length === 0 && (
                    <div style={{
                        textAlign: 'center', padding: '60px 20px',
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: 20, border: '1px dashed rgba(255,255,255,0.08)'
                    }}>
                        <Trophy size={48} color="#334155" style={{ marginBottom: 16 }} />
                        <h3 style={{ color: '#64748b', fontWeight: 700, fontSize: 18 }}>No Elections Yet</h3>
                        <p style={{ color: '#475569', fontSize: 14 }}>Elections will appear here once created by the administration.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentDashboard;
