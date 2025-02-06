import React, { useState } from 'react';
import '../App.css';

interface DashboardModalProps {
    walletAddress: string;
    score: number;
    gamesPlayed: number;
    statistics: { [key: string]: string | number };
    selectedGame: string;
    onClose: () => void;
    onMint: () => void;
    onSelectGame?: (game: string) => void;
}

const DashboardModal: React.FC<DashboardModalProps> = ({
                                                           walletAddress,
                                                           score,
                                                           gamesPlayed,
                                                           statistics,
                                                           selectedGame,
                                                           onClose,
                                                           onMint,
                                                           onSelectGame = () => {},
                                                       }) => {
    return (
        <div className="modal-overlay">
            <div className="modal-content dashboard-modal">
                <button className="close-button" onClick={onClose}>X</button>
                <h2>User Dashboard</h2>
                <div className="dropdown-wrapper">
                    <label htmlFor="gameSelect">Select Game:</label>
                    <select id="gameSelect" value={selectedGame} onChange={(e) => onSelectGame(e.target.value)}>
                        <option value="PCS Realms">PCS Realms</option>
                        <option value="BoB - Bay Of Bones">BoB - Bay Of Bones</option>
                    </select>
                </div>
                <div className="dashboard-grid">
                    <div className="card">
                        <h3>Wallet Info</h3>
                        <p><strong>Wallet Address:</strong> {walletAddress}</p>
                    </div>
                    <div className="card">
                        <h3>Game Stats ({selectedGame})</h3>
                        <p><strong>Score:</strong> {score}</p>
                        <p><strong>Games Played:</strong> {gamesPlayed}</p>
                    </div>
                    <div className="card statistics">
                        <h3>Statistics</h3>
                        <ul>
                            {Object.entries(statistics).map(([key, value]) => (
                                <li key={key}><strong>{key}:</strong> {value}</li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className="mint-token">
                    <button onClick={onMint} className="primary-button">Mint GameKey Token</button>
                </div>
            </div>
        </div>
    );
};

export default DashboardModal;