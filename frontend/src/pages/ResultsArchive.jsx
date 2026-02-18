import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import {
    Trophy, BarChart3, ArrowLeft, ChevronDown, ChevronUp,
    Calendar, Users, TrendingUp, CheckCircle, Loader2
} from 'lucide-react';
import { Bar, Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS, ArcElement, Tooltip, Legend,
    CategoryScale, LinearScale, BarElement, Title
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const PARTY_COLORS = ['#0288D1', '#00897B', '#E65100', '#6A1B9A', '#C62828', '#2E7D32'];

const ElectionResultCard = ({ election, API_URL }) => {
    const [expanded, setExpanded] = useState(false);
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchResults = async () => {
        if (results) { setExpanded(!expanded); return; }
        setLoading(true);
        try {
            const [electionRes, statsRes] = await Promise.all([
                axios.get(`${API_URL}/elections/${election._id}`),
                axios.get(`${API_URL}/votes/results/${election._id}`).catch(() => ({ data: { data: {} } }))
            ]);
            const candidates = electionRes.data.data.candidates || [];
            const stats = statsRes.data.data || {};
            setResults({ candidates, stats });
            setExpanded(true);
        } catch (err) {
            console.error('Failed to load results:', err);
        } finally {
            setLoading(false);
        }
    };

    const winner = results?.candidates?.length > 0
        ? [...results.candidates].sort((a, b) => b.voteCount - a.voteCount)[0]
        : null;

    const totalVotes = results?.stats?.totalVotes || 0;
    const turnout = results?.stats?.turnoutPercent || 0;

    return (
        <div style={{
            background: '#fff',
            borderRadius: 20,
            boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
            border: '1px solid #e5e7eb',
            overflow: 'hidden',
            marginBottom: 20,
            transition: 'box-shadow 0.2s'
        }}>
            {/* Card Header */}
            <div style={{
                background: election.isCertified
                    ? 'linear-gradient(135deg, #1B5E20, #2E7D32)'
                    : 'linear-gradient(135deg, #37474F, #455A64)',
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 12
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{
                        background: 'rgba(255,255,255,0.15)',
                        borderRadius: 12,
                        padding: 10,
                        backdropFilter: 'blur(8px)'
                    }}>
                        <Trophy size={24} color={election.isCertified ? '#FFD700' : '#fff'} />
                    </div>
                    <div>
                        <h3 style={{ color: '#fff', fontWeight: 700, fontSize: 17, margin: 0 }}>
                            {election.title}
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                            <Calendar size={12} color="rgba(255,255,255,0.7)" />
                            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>
                                {new Date(election.startDate).toLocaleDateString()} – {new Date(election.endDate).toLocaleDateString()}
                            </span>
                            {election.isCertified && (
                                <span style={{
                                    background: '#FFD700', color: '#1B5E20',
                                    borderRadius: 999, padding: '1px 10px',
                                    fontSize: 11, fontWeight: 700
                                }}>✓ Certified</span>
                            )}
                        </div>
                    </div>
                </div>

                <button
                    onClick={fetchResults}
                    disabled={loading}
                    style={{
                        background: 'rgba(255,255,255,0.15)',
                        color: '#fff',
                        border: '1px solid rgba(255,255,255,0.3)',
                        borderRadius: 10,
                        padding: '8px 18px',
                        fontWeight: 600,
                        fontSize: 13,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        backdropFilter: 'blur(8px)',
                        transition: 'background 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                >
                    {loading ? (
                        <Loader2 size={15} className="animate-spin" />
                    ) : expanded ? (
                        <><ChevronUp size={15} /> Hide Results</>
                    ) : (
                        <><BarChart3 size={15} /> View Results</>
                    )}
                </button>
            </div>

            {/* Expanded Results */}
            {expanded && results && (
                <div style={{ padding: '24px' }}>
                    {/* Summary Stats */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                        gap: 12,
                        marginBottom: 24
                    }}>
                        <div style={{ background: '#f0f9ff', borderRadius: 12, padding: '14px 16px', textAlign: 'center' }}>
                            <p style={{ color: '#0369a1', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', margin: 0 }}>Total Votes</p>
                            <p style={{ color: '#0c4a6e', fontSize: 26, fontWeight: 800, margin: '4px 0 0' }}>{totalVotes}</p>
                        </div>
                        <div style={{ background: '#f0fdf4', borderRadius: 12, padding: '14px 16px', textAlign: 'center' }}>
                            <p style={{ color: '#15803d', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', margin: 0 }}>Turnout</p>
                            <p style={{ color: '#14532d', fontSize: 26, fontWeight: 800, margin: '4px 0 0' }}>{turnout}%</p>
                        </div>
                        <div style={{ background: '#fefce8', borderRadius: 12, padding: '14px 16px', textAlign: 'center' }}>
                            <p style={{ color: '#a16207', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', margin: 0 }}>Candidates</p>
                            <p style={{ color: '#713f12', fontSize: 26, fontWeight: 800, margin: '4px 0 0' }}>{results.candidates.length}</p>
                        </div>
                        <div style={{ background: '#fdf4ff', borderRadius: 12, padding: '14px 16px', textAlign: 'center' }}>
                            <p style={{ color: '#7e22ce', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', margin: 0 }}>Eligible Voters</p>
                            <p style={{ color: '#581c87', fontSize: 26, fontWeight: 800, margin: '4px 0 0' }}>{results.stats.totalEligibleVoters || '—'}</p>
                        </div>
                    </div>

                    {/* Winner Banner */}
                    {winner && (
                        <div style={{
                            background: election.isCertified
                                ? 'linear-gradient(135deg, #F59E0B, #D97706)'
                                : 'linear-gradient(135deg, #0288D1, #0D47A1)',
                            borderRadius: 16,
                            padding: '20px 24px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 16,
                            marginBottom: 24,
                            color: '#fff'
                        }}>
                            <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 50, padding: 12 }}>
                                <Trophy size={28} color={election.isCertified ? '#fff' : '#FFD700'} />
                            </div>
                            <div>
                                <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', opacity: 0.85, margin: 0 }}>
                                    {election.isCertified ? '🏆 Official Winner' : '📊 Leading Candidate'}
                                </p>
                                <p style={{ fontSize: 22, fontWeight: 800, margin: '2px 0 0' }}>{winner.name}</p>
                                <p style={{ fontSize: 13, opacity: 0.85, margin: '2px 0 0' }}>
                                    {winner.voteCount} votes
                                    {totalVotes > 0 && ` · ${((winner.voteCount / totalVotes) * 100).toFixed(1)}% of total`}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Charts */}
                    {results.candidates.length > 0 && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, marginBottom: 24 }}>
                            <div style={{ background: '#f8fafc', borderRadius: 14, padding: 16 }}>
                                <p style={{ fontWeight: 700, fontSize: 13, color: '#374151', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <TrendingUp size={14} /> Vote Comparison
                                </p>
                                <div style={{ height: 200 }}>
                                    <Bar
                                        data={{
                                            labels: results.candidates.map(c => c.name),
                                            datasets: [{
                                                label: 'Votes',
                                                data: results.candidates.map(c => c.voteCount),
                                                backgroundColor: PARTY_COLORS,
                                                borderRadius: 6,
                                            }]
                                        }}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: { legend: { display: false } },
                                            scales: {
                                                y: { beginAtZero: true, ticks: { stepSize: 1, font: { size: 10 } } },
                                                x: { ticks: { font: { size: 10 } } }
                                            }
                                        }}
                                    />
                                </div>
                            </div>

                            <div style={{ background: '#f8fafc', borderRadius: 14, padding: 16 }}>
                                <p style={{ fontWeight: 700, fontSize: 13, color: '#374151', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <BarChart3 size={14} /> Vote Share
                                </p>
                                <div style={{ height: 200, display: 'flex', justifyContent: 'center' }}>
                                    <Pie
                                        data={{
                                            labels: results.candidates.map(c => c.name),
                                            datasets: [{
                                                data: results.candidates.map(c => c.voteCount),
                                                backgroundColor: PARTY_COLORS,
                                                borderWidth: 0,
                                            }]
                                        }}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } } }
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Detailed Candidate Results */}
                    <div>
                        <p style={{ fontWeight: 700, fontSize: 13, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
                            Detailed Results
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {[...results.candidates]
                                .sort((a, b) => b.voteCount - a.voteCount)
                                .map((candidate, index) => {
                                    const pct = totalVotes > 0 ? ((candidate.voteCount / totalVotes) * 100).toFixed(1) : 0;
                                    const color = PARTY_COLORS[index % PARTY_COLORS.length];
                                    const isWinner = index === 0;
                                    return (
                                        <div key={candidate._id} style={{
                                            background: isWinner ? `${color}08` : '#f9fafb',
                                            border: isWinner ? `1.5px solid ${color}30` : '1px solid #f3f4f6',
                                            borderRadius: 12,
                                            padding: '12px 16px'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                    {isWinner && <Trophy size={14} color={color} />}
                                                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
                                                    <span style={{ fontWeight: 700, color: '#1e293b', fontSize: 14 }}>
                                                        {index + 1}. {candidate.name}
                                                    </span>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <span style={{ fontWeight: 800, color, fontSize: 16 }}>{pct}%</span>
                                                    <p style={{ color: '#9ca3af', fontSize: 11, margin: 0 }}>{candidate.voteCount} votes</p>
                                                </div>
                                            </div>
                                            <div style={{ background: '#e5e7eb', borderRadius: 999, height: 6, overflow: 'hidden' }}>
                                                <div style={{
                                                    width: `${pct}%`, height: '100%',
                                                    background: color,
                                                    borderRadius: 999,
                                                    transition: 'width 0.8s ease'
                                                }} />
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const ResultsArchive = () => {
    const { API_URL } = useContext(AuthContext);
    const navigate = useNavigate();
    const [endedElections, setEndedElections] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchElections = async () => {
            try {
                const res = await axios.get(`${API_URL}/elections`);
                const all = res.data.data || [];
                // Show ended elections sorted by most recent first
                const ended = all
                    .filter(e => e.status === 'ended')
                    .sort((a, b) => new Date(b.endDate) - new Date(a.endDate));
                setEndedElections(ended);
            } catch (err) {
                console.error('Failed to load elections:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchElections();
    }, [API_URL]);

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
            padding: '0 0 60px'
        }}>
            {/* Header */}
            <div style={{
                background: 'linear-gradient(135deg, #1B5E20, #2E7D32)',
                padding: '32px 24px',
                textAlign: 'center',
                position: 'relative'
            }}>
                <button
                    onClick={() => navigate('/')}
                    style={{
                        position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)',
                        background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none',
                        borderRadius: 10, padding: '8px 14px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, fontSize: 13
                    }}
                >
                    <ArrowLeft size={16} /> Back
                </button>

                <div style={{
                    background: 'rgba(255,255,255,0.15)',
                    borderRadius: 16, padding: 16,
                    display: 'inline-flex', marginBottom: 12
                }}>
                    <Trophy size={36} color="#FFD700" />
                </div>
                <h1 style={{ color: '#fff', fontSize: 26, fontWeight: 800, margin: 0 }}>
                    Election Results Archive
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, marginTop: 6 }}>
                    University of Bosaso — All Concluded Elections
                </p>
                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    background: 'rgba(255,255,255,0.15)', borderRadius: 999,
                    padding: '4px 14px', marginTop: 10
                }}>
                    <CheckCircle size={13} color="#FFD700" />
                    <span style={{ color: '#fff', fontSize: 12, fontWeight: 600 }}>
                        {endedElections.length} Concluded Election{endedElections.length !== 1 ? 's' : ''}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div style={{ maxWidth: 860, margin: '32px auto', padding: '0 16px' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: 60 }}>
                        <Loader2 size={40} color="#4ade80" style={{ animation: 'spin 1s linear infinite' }} />
                        <p style={{ color: '#94a3b8', marginTop: 12 }}>Loading election results...</p>
                    </div>
                ) : endedElections.length === 0 ? (
                    <div style={{
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: 20, padding: 60,
                        textAlign: 'center', border: '1px dashed rgba(255,255,255,0.1)'
                    }}>
                        <Trophy size={48} color="#4b5563" style={{ marginBottom: 16 }} />
                        <h3 style={{ color: '#9ca3af', fontWeight: 700, fontSize: 18 }}>No Concluded Elections Yet</h3>
                        <p style={{ color: '#6b7280', fontSize: 14 }}>Results will appear here once elections have ended.</p>
                        <button
                            onClick={() => navigate('/')}
                            style={{
                                marginTop: 20, background: '#2E7D32', color: '#fff',
                                border: 'none', borderRadius: 10, padding: '10px 24px',
                                fontWeight: 700, cursor: 'pointer', fontSize: 14
                            }}
                        >
                            Go to Home
                        </button>
                    </div>
                ) : (
                    endedElections.map(election => (
                        <ElectionResultCard
                            key={election._id}
                            election={election}
                            API_URL={API_URL}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default ResultsArchive;
