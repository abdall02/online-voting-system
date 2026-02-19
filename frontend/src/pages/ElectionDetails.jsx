import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import { CheckCircle, Loader2, ArrowLeft, Trophy, BarChart3, TrendingUp, PieChart as PieIcon, Clock } from 'lucide-react';
import { Pie, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title
} from 'chart.js';

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title
);
import toast from 'react-hot-toast';

const ElectionDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { API_URL, user } = useContext(AuthContext);
    const socket = useContext(SocketContext);

    const [election, setElection] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isVoting, setIsVoting] = useState(false);
    const [hasVotedLocally, setHasVotedLocally] = useState(false);
    const [stats, setStats] = useState({
        totalVotes: 0,
        totalEligibleVoters: 0,
        turnoutPercent: 0
    });
    const [timeLeft, setTimeLeft] = useState('');

    // Party colors for styling
    const partyColors = ['#0288D1', '#00897B', '#E65100', '#6A1B9A', '#C62828', '#2E7D32'];

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const [electionRes, resultsRes] = await Promise.all([
                    axios.get(`${API_URL}/elections/${id}`),
                    axios.get(`${API_URL}/votes/results/${id}`).catch(() => ({ data: { data: {} } }))
                ]);

                setElection(electionRes.data.data);
                setCandidates(electionRes.data.data.candidates);

                if (resultsRes.data.success) {
                    const { totalVotes, totalEligibleVoters, turnoutPercent } = resultsRes.data.data;
                    setStats({ totalVotes, totalEligibleVoters, turnoutPercent });
                }

                if (user && user.hasVoted) {
                    setHasVotedLocally(true);
                }
            } catch (err) {
                console.error(err);
                toast.error('Failed to load election details');
            } finally {
                setIsLoading(false);
            }
        };

        fetchDetails();
    }, [id, API_URL, user]);

    useEffect(() => {
        if (!election || election.status !== 'active') return;

        const timer = setInterval(() => {
            const end = new Date(election.endDate).getTime();
            const now = new Date().getTime();
            const distance = end - now;

            if (distance < 0) {
                setTimeLeft('EXPIRED');
                clearInterval(timer);
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            let timeStr = '';
            if (days > 0) timeStr += `${days}d `;
            timeStr += `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            setTimeLeft(timeStr);
        }, 1000);

        return () => clearInterval(timer);
    }, [election]);

    useEffect(() => {
        if (!socket) return;

        socket.on('voteUpdated', async (data) => {
            if (data.electionId === id) {
                setCandidates(data.candidates);
                // Refresh stats for turnout
                try {
                    const statsRes = await axios.get(`${API_URL}/votes/results/${id}`);
                    if (statsRes.data.success) {
                        const { totalVotes, totalEligibleVoters, turnoutPercent } = statsRes.data.data;
                        setStats({ totalVotes, totalEligibleVoters, turnoutPercent });
                    }
                } catch (e) { console.error('Stats update error', e); }

                toast.success('Live update: New vote recorded!', {
                    icon: '⚡',
                    duration: 3000,
                });
            }
        });

        return () => socket.off('voteUpdated');
    }, [socket, id]);

    const handleVote = async (candidateId) => {
        if (!user) {
            toast.error('Please login to vote');
            return navigate('/login');
        }

        setIsVoting(true);
        try {
            const res = await axios.post(`${API_URL}/votes`, { candidateId, electionId: id });
            setHasVotedLocally(true);
            toast.success(res.data.message || 'Vote cast successfully!');

            // Refresh candidates and stats to show updated results
            try {
                const updatedRes = await axios.get(`${API_URL}/votes/results/${id}`);
                if (updatedRes.data.success) {
                    setCandidates(updatedRes.data.data.candidates);
                    const { totalVotes, totalEligibleVoters, turnoutPercent } = updatedRes.data.data;
                    setStats({ totalVotes, totalEligibleVoters, turnoutPercent });
                }
            } catch (refreshErr) {
                console.warn('Could not refresh standings, but vote was successful');
            }
        } catch (err) {
            console.error('Vote error:', err);
            const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Vote failed. Please try again.';
            toast.error(errorMsg);

            if (errorMsg.toLowerCase().includes('already cast')) {
                setHasVotedLocally(true);
            }
        } finally {
            setIsVoting(false);
        }
    };

    if (isLoading) return (
        <div className="voting-loading">
            <Loader2 className="animate-spin" size={48} style={{ color: '#0288D1' }} />
            <p>Loading election...</p>
        </div>
    );

    if (!election) return <div className="voting-loading"><p>Election not found</p></div>;

    return (
        <div className="voting-page-container">
            <div className="voting-card-layout">
                {/* Header with Logo */}
                <div className="voting-header">
                    <div className="voting-header-logo">
                        <img src="/download.jpg" alt="University of Bosaso Logo" className="w-20 h-20 object-contain mx-auto" />
                    </div>

                    <h1 className="university-title-small text-center mt-2">University of Bosaso</h1>
                    <p className="election-subtitle text-center">{election.title}</p>

                    {/* Student Info Bar */}
                    {user && (
                        <div className="student-info-bar mt-6">
                            <div className="info-item">
                                <span className="info-label">Student Name</span>
                                <span className="info-value">{user.name}</span>
                            </div>
                            <div className="info-divider"></div>
                            <div className="info-item">
                                <span className="info-label">Student ID</span>
                                <span className="info-value">{user.studentId || user.email}</span>
                            </div>
                        </div>
                    )}

                    {/* Countdown Timer Display */}
                    {election.status === 'active' && timeLeft && (
                        <div className="election-timer-section text-center mt-4">
                            <div className={`timer-container inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border ${timeLeft === 'EXPIRED' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                                <Clock size={16} />
                                <span>{timeLeft === 'EXPIRED' ? 'Voting Period Ended' : `Time Remaining: ${timeLeft}`}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Vote Content */}
                <div className="voting-content-area lg:mt-6 mt-1">
                    {/* Show results if: election ended OR student already voted */}
                    {election.status === 'ended' || hasVotedLocally ? (
                        <div className="vote-results-container">
                            {election.status === 'ended' && !hasVotedLocally ? (
                                // Student didn't vote but election ended
                                <div className="vote-success-banner" style={{ background: 'linear-gradient(135deg, #455A64, #263238)' }}>
                                    <div className="vote-success-icon">
                                        <Clock size={32} color="#fff" />
                                    </div>
                                    <div className="vote-success-text">
                                        <h2>Election Concluded</h2>
                                        <p>Voting has ended. Below are the final results.</p>
                                    </div>
                                </div>
                            ) : election.status === 'ended' && hasVotedLocally ? (
                                // Student voted and election ended
                                <div className="vote-success-banner" style={{ background: 'linear-gradient(135deg, #1565C0, #0D47A1)' }}>
                                    <div className="vote-success-icon">
                                        <Trophy size={32} color="#fff" />
                                    </div>
                                    <div className="vote-success-text">
                                        <h2>Election Concluded</h2>
                                        <p>You voted! The election has ended. Here are the final results.</p>
                                    </div>
                                </div>
                            ) : (
                                // Student voted, election still active
                                <div className="vote-success-banner">
                                    <div className="vote-success-icon">
                                        <CheckCircle size={32} color="#fff" />
                                    </div>
                                    <div className="vote-success-text">
                                        <h2>Vote Recorded!</h2>
                                        <p>Your participation has been successfully registered.</p>
                                    </div>
                                </div>
                            )}

                            {/* Live Results Dashboard for Students */}
                            <div className="student-results-dashboard">
                                <div className="flex items-center gap-2 mb-6">
                                    <Trophy size={20} className="text-yellow-500" />
                                    <h3 className="section-title text-lg font-bold">
                                        {election.isCertified ? 'Final Certified Results' : 'Live Election Standings'}
                                    </h3>
                                </div>

                                {election.isCertified && candidates.length > 0 && (
                                    <div className="official-winner-celebration mb-10 p-8 rounded-3xl bg-gradient-to-br from-yellow-500 via-amber-600 to-yellow-700 text-white shadow-2xl relative overflow-hidden text-center transform hover:scale-[1.01] transition-all">
                                        <div className="relative z-10">
                                            <div className="inline-block p-4 bg-white/20 backdrop-blur-md rounded-full mb-4 animate-bounce">
                                                <Trophy size={48} className="text-white" />
                                            </div>
                                            <h2 className="text-sm font-black uppercase tracking-[0.2em] mb-2 opacity-90">Official Winner Declared</h2>
                                            <h1 className="text-4xl font-black mb-2 drop-shadow-lg">
                                                {[...candidates].sort((a, b) => b.voteCount - a.voteCount)[0].name}
                                            </h1>
                                            <p className="text-lg font-medium opacity-80">
                                                Congratulations! Elected with {stats.totalVotes > 0 ? (([...candidates].sort((a, b) => b.voteCount - a.voteCount)[0].voteCount / stats.totalVotes) * 100).toFixed(1) : 0}% of the total votes.
                                            </p>
                                        </div>
                                        {/* Decorative background trophy */}
                                        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
                                            <Trophy size={240} />
                                        </div>
                                    </div>
                                )}

                                {!election.isCertified && candidates.length > 0 && (
                                    <div className="current-leader-card mb-6">
                                        <div className="leader-info">
                                            <div className="leader-badge">Current Leader</div>
                                            <h2 className="leader-name">
                                                {[...candidates].sort((a, b) => b.voteCount - a.voteCount)[0].name}
                                            </h2>
                                            <p className="leader-votes">
                                                {[...candidates].sort((a, b) => b.voteCount - a.voteCount)[0].voteCount} Votes
                                                <span className="ml-2 opacity-60">
                                                    ({stats.totalVotes > 0 ? (([...candidates].sort((a, b) => b.voteCount - a.voteCount)[0].voteCount / stats.totalVotes) * 100).toFixed(1) : 0}%)
                                                </span>
                                            </p>
                                        </div>
                                        <div className="leader-trophy opacity-50">
                                            <Trophy size={60} />
                                        </div>
                                    </div>
                                )}

                                <div className="turnout-metric-bar mb-6 bg-blue-50/50 p-4 rounded-xl border border-blue-100/50">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-bold uppercase text-blue-800 tracking-wider">Voter Turnout</span>
                                        <span className="text-sm font-black text-blue-900">{stats.turnoutPercent}%</span>
                                    </div>
                                    <div className="w-full bg-blue-100 h-2 rounded-full overflow-hidden">
                                        <div
                                            className="bg-blue-600 h-full transition-all duration-1000"
                                            style={{ width: `${stats.turnoutPercent}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-[10px] text-blue-500 mt-2 font-medium">
                                        {stats.totalVotes} votes cast out of {stats.totalEligibleVoters} registered students
                                    </p>
                                </div>

                                <div className="results-grid">
                                    <div className="result-chart-card">
                                        <div className="chart-header">
                                            <PieIcon size={16} />
                                            <span>Vote Share</span>
                                        </div>
                                        <div style={{ height: '220px' }}>
                                            <Pie
                                                data={{
                                                    labels: candidates.map(c => c.name),
                                                    datasets: [{
                                                        data: candidates.map(c => c.voteCount),
                                                        backgroundColor: partyColors,
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

                                    <div className="result-chart-card">
                                        <div className="chart-header">
                                            <TrendingUp size={16} />
                                            <span>Candidate Comparison</span>
                                        </div>
                                        <div style={{ height: '220px' }}>
                                            <Bar
                                                data={{
                                                    labels: candidates.map(c => c.name),
                                                    datasets: [{
                                                        label: 'Votes',
                                                        data: candidates.map(c => c.voteCount),
                                                        backgroundColor: partyColors,
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
                                </div>

                                {/* Candidate Performance List */}
                                <div className="mt-8 space-y-4">
                                    <h4 className="text-xs font-bold uppercase text-gray-500 tracking-wider mb-2">Detailed Results</h4>
                                    {candidates.sort((a, b) => b.voteCount - a.voteCount).map((candidate, index) => {
                                        const percentage = stats.totalVotes > 0 ? ((candidate.voteCount / stats.totalVotes) * 100).toFixed(1) : 0;
                                        const color = partyColors[index % partyColors.length];
                                        return (
                                            <div key={candidate._id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm transition-all hover:border-blue-200">
                                                <div className="flex justify-between items-center mb-2">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></div>
                                                        <span className="font-bold text-gray-800">{candidate.name}</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-sm font-black text-gray-900">{percentage}%</span>
                                                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">{candidate.voteCount} Votes</p>
                                                    </div>
                                                </div>
                                                <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full transition-all duration-700 ease-out"
                                                        style={{ width: `${percentage}%`, backgroundColor: color }}
                                                    ></div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <button onClick={() => navigate('/')} className="vote-back-btn mt-8 w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-all">
                                    <ArrowLeft size={18} />
                                    <span>Back to Home</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Selection Prompt */}
                            <div className="vote-prompt text-center mb-6">
                                <h3 className="section-title text-xl font-bold text-gray-800 mb-2">Cast Your Ballot</h3>
                                <p className="text-gray-500 font-medium bg-blue-50/50 py-2 rounded-lg border border-blue-100/50">
                                    Click the <span className="text-blue-600 font-bold">Vote Now</span> button for your preferred candidate
                                </p>
                            </div>

                            {candidates.length === 0 && (
                                <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                    <div className="mb-4 text-gray-300 flex justify-center"><UserPlus size={48} /></div>
                                    <h3 className="text-lg font-bold text-gray-400">No Candidates Registered</h3>
                                    <p className="text-sm text-gray-400">Please wait for the administration to add candidates to this ballot.</p>
                                </div>
                            )}

                            {/* Party Cards */}
                            <div className="party-cards-grid">
                                {candidates.map((candidate, index) => {
                                    const color = partyColors[index % partyColors.length];
                                    return (
                                        <div key={candidate._id} className="party-card-new" style={{ '--party-color': color }}>
                                            {/* Party Top Border */}
                                            <div className="party-card-accent" style={{ backgroundColor: color }}></div>

                                            {/* Ballot Selection Circle (Calaamad) */}
                                            <div className="ballot-selection-circle" style={{ borderColor: `${color}40` }}>
                                                <div className="inner-circle" style={{ backgroundColor: color }}></div>
                                            </div>

                                            {/* Party Logo */}
                                            <div className="party-image-container">
                                                {candidate.image && candidate.image !== 'no-photo.jpg' ? (
                                                    <img
                                                        src={candidate.image.startsWith('http') ? candidate.image : `${API_URL.replace('/api', '')}${candidate.image}`}
                                                        alt={candidate.name}
                                                        className="party-image"
                                                    />
                                                ) : (
                                                    <div className="party-image-placeholder" style={{ backgroundColor: `${color}15`, color: color }}>
                                                        <span>{candidate.name.charAt(0)}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Party Name */}
                                            <h3 className="party-name-new">{candidate.name}</h3>

                                            {/* Party Slogan */}
                                            <p className="party-slogan-new">
                                                {candidate.slogan}
                                            </p>

                                            {/* Vote Button */}
                                            <button
                                                onClick={() => handleVote(candidate._id)}
                                                disabled={isVoting || timeLeft === 'EXPIRED'}
                                                className="party-vote-btn-new"
                                                style={{
                                                    backgroundColor: timeLeft === 'EXPIRED' ? '#94A3B8' : color,
                                                    cursor: timeLeft === 'EXPIRED' ? 'not-allowed' : 'pointer'
                                                }}
                                            >
                                                {isVoting ? (
                                                    <Loader2 className="animate-spin" size={20} />
                                                ) : (
                                                    <>
                                                        <CheckCircle size={22} strokeWidth={2.5} />
                                                        <span>{timeLeft === 'EXPIRED' ? 'Closed' : 'Vote Now'}</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>

                {/* Footer Back Link */}
                {!hasVotedLocally && (
                    <div className="voting-footer-area mt-8 border-t pt-4">
                        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-400 hover:text-blue-500 transition-colors mx-auto text-sm font-medium">
                            <ArrowLeft size={16} />
                            <span>Back to Home</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ElectionDetails;
