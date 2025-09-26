import React, { useState, useEffect } from 'react';
// const API_URL = 'http://localhost:3001/api';
const API_URL = import.meta.env.VITE_API_BASE_URL;

// 1. Login Page
const LoginPage = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const handleSubmit = (e) => {
        e.preventDefault();
        if (username.trim()) onLogin(username.trim());
    };
    return (
        <div className="w-full max-w-sm p-8 bg-white rounded-xl shadow-lg animate-fade-in-down">
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Voting App Login</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button type="submit" className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition transform hover:scale-105">
                    Enter
                </button>
            </form>
        </div>
    );
};

// 2. Voting Page
const VotingPage = ({ username, options, hasVoted, onVote, onShowResults }) => (
    <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg animate-fade-in">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">Welcome, {username}!</h1>
        <p className="text-center text-gray-600 mb-6">Please enter your vote.</p>
        <div className="space-y-4">
            {options.map((option) => (
                <button
                    key={option}
                    onClick={() => onVote(option)}
                    disabled={hasVoted}
                    className={`w-full text-lg font-semibold py-4 rounded-lg transition transform ${
                        hasVoted ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600 text-white hover:scale-105'
                    }`}
                >
                    {option}
                </button>
            ))}
        </div>
        {hasVoted && <p className="text-center text-blue-600 font-semibold mt-6 bg-blue-100 p-3 rounded-lg">Thank you for giving the vote!</p>}
        <div className="mt-6 text-center">
            <button onClick={onShowResults} className="text-blue-600 hover:underline font-semibold">
                View Results &rarr;
            </button>
        </div>
    </div>
);

// 3. Results Page
const ResultsPage = ({ votes, onBack, onRefresh, isLoading }) => {
    const totalVotes = Object.values(votes).reduce((sum, count) => sum + count, 0);
    return (
        <div className="w-full max-w-2xl p-8 bg-white rounded-xl shadow-lg animate-fade-in">
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Voting Results</h1>
            <div className="mb-6 space-y-4">
                {Object.keys(votes).length > 0 ? (
                    Object.entries(votes)
                        .sort((a, b) => b[1] - a[1]) 
                        .map(([option, count]) => {
                            const percentage = totalVotes > 0 ? ((count / totalVotes) * 100) : 0;
                            return (
                                <div key={option}>
                                    <div className="flex justify-between items-center mb-1 text-gray-700">
                                        <span className="font-semibold">{option}</span>
                                        <span className="text-sm font-bold">{count} Votes</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                                        <div className="bg-blue-500 h-full flex items-center justify-center text-white text-xs font-bold" style={{ width: `${percentage}%` }}>
                                            {percentage > 10 && `${percentage.toFixed(1)}%`}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                ) : <p className="text-center text-gray-500">No one has voted.</p>}
            </div>
            <div className="text-center text-xl font-bold text-gray-700 mt-4">Total votes:  {totalVotes}</div>
            <div className="mt-8 flex justify-center items-center space-x-6">
                <button onClick={onBack} className="text-sm text-gray-600 hover:text-black font-semibold hover:underline">&larr; Go back</button>
                <button onClick={onRefresh} disabled={isLoading} className="px-6 py-2 bg-indigo-500 text-white font-semibold rounded-lg hover:bg-indigo-600 transition disabled:bg-indigo-300">
                    {isLoading ? 'Refreshing...' : 'Refresh Results'}
                </button>
            </div>
        </div>
    );
};

// --- Main App Component ---
function App() {
    const [page, setPage] = useState('login'); 
    const [username, setUsername] = useState('');
    const [votes, setVotes] = useState({});
    const [hasVoted, setHasVoted] = useState(false); 
    const [isLoading, setIsLoading] = useState(true);

    const fetchVotes = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/votes`);
            const data = await response.json();
            setVotes(data);
        } catch (err) {
            console.error("Error in fetching votes:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchVotes(); }, []);

    const handleLogin = (name) => {
        setUsername(name);
        setPage('vote');
    };

    const handleVote = async (option) => {
        if (hasVoted) return;
        try {
            await fetch(`${API_URL}/vote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ option }),
            });
            setHasVoted(true);
            fetchVotes(); 
        } catch (error) {
            console.error("Error in casting votes:", error);
        }
    };

    const showResults = () => {
        fetchVotes(); 
        setPage('results');
    };
    
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center font-sans p-4">
            {page === 'login' && <LoginPage onLogin={handleLogin} />}
            {page === 'vote' && (
                <VotingPage
                    username={username}
                    options={Object.keys(votes)}
                    hasVoted={hasVoted}
                    onVote={handleVote}
                    onShowResults={showResults}
                />
            )}
            {page === 'results' && (
                <ResultsPage
                    votes={votes}
                    onBack={() => setPage('vote')}
                    onRefresh={fetchVotes}
                    isLoading={isLoading}
                />
            )}
        </div>
    );
}

export default App;

