import React, { useState } from 'react';
import './GameDashboard.css';

interface UpcomingGame {
    id: string;
    name: string;
    startTime: string;
}

interface GameDashboardProps {
    walletAddress: string;
    score: number;
    upcomingGames: UpcomingGame[];
    onMint: () => void;
}

const GameDashboard: React.FC<GameDashboardProps> = ({
                                                         walletAddress,
                                                         score,
                                                         upcomingGames,
                                                         onMint,
                                                     }) => {
    const [selectedGame, setSelectedGame] = useState("PCS Realms");

    return (
        <div className="game-dashboard">
            <h1>Game Dashboard</h1>
            <div className="dropdown-wrapper">
                <label htmlFor="gameSelect">Select Game:</label>
                <select id="gameSelect" value={selectedGame} onChange={(e) => setSelectedGame(e.target.value)}>
                    <option value="PCS Realms">PCS Realms</option>
                    <option value="BoB - Bay Of Bones">BoB - Bay Of Bones</option>
                </select>
            </div>
            <div className="dashboard-grid">
                <div className="card">
                    <h3>User Info</h3>
                    <p><strong>Wallet:</strong> {walletAddress}</p>
                    <p><strong>Score ({selectedGame}):</strong> {score}</p>
                </div>
                <div className="card upcoming-games">
                    <h3>Upcoming Games</h3>
                    {upcomingGames.length > 0 ? (
                        <ul>
                            {upcomingGames.map(game => (
                                <li key={game.id} className="game-item">
                                    <span className="game-name">{game.name}</span>
                                    <span className="game-time">{game.startTime}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No upcoming games scheduled.</p>
                    )}
                </div>
            </div>
            <div className="mint-token">
                <button onClick={onMint} className="primary-button">Mint GameKey Token</button>
            </div>
        </div>
    );
};

export default GameDashboard;