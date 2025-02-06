// App.tsx
import React, { useState, useEffect } from 'react';
import { Buffer } from 'buffer';
import { Address, BaseAddress } from '@emurgo/cardano-serialization-lib-browser';
import Sidebar from './components/Sidebar';
import CollectionGrid from './components/CollectionGrid';
import GameDashboard from './components/GameDashboard';
import DashboardModal from './components/DashboardModal';

import useTheme from "./hooks/useTheme";
import './App.css';

const App: React.FC = () => {
    const { theme, toggleTheme } = useTheme();

    const [wallet, setWallet] = useState<any>(null);
    const [walletBaseAddress, setWalletBaseAddress] = useState<string | null>(null);
    const [walletType, setWalletType] = useState<string | null>(null);
    const [jwtToken, setJwtToken] = useState<string | null>(null);
    const [availableWallets, setAvailableWallets] = useState<string[]>([]);
    const [step, setStep] = useState<number>(1);

    // ADA Handle & PCS Collection Selection
    const [authMethod, setAuthMethod] = useState<'base_address' | 'ada_handle' | 'pcs'>('base_address');
    const [adahandleSelected, setAdahandleSelected] = useState<string | null>(null);
    const [adahandles, setAdahandles] = useState<string[]>([]);
    const [pcsCollectionSelected, setPcsCollectionSelected] = useState<string | null>(null);

    // Hardcoded PCS Collections (same as backend)
    const PCS_COLLECTIONS = [
        { id: "f96584c4fcd13cd1702c9be683400072dd1aac853431c99037a3ab1e", name: "OG Collection" },
        { id: "d91b5642303693f5e7a188748bfd1a26c925a1c5e382e19a13dd263c", name: "Yummi" },
        { id: "52f53a3eb07121fcbec36dae79f76abedc6f3a877f8c8857e6c204d1", name: "Halloween" }
    ];

    // Asset & Metadata State
    const [loading, setLoading] = useState<boolean>(false);
    const [walletData, setWalletData] = useState<any>(null);

    // Dashboard Modal State
    const [dashboardOpen, setDashboardOpen] = useState<boolean>(false);

    // Dummy game dashboard data (update with real values as needed)
    const score = 1000;
    const gamesPlayed = 25;
    const statistics = {
        "Total Games": 25,
        "Wins": 10,
        "Losses": 15,
    };

    const handleMint = () => {
        console.log("Mint GameKey Token clicked!");
    };

    // Detect Available Wallets
    const detectWallet = async () => {
        const detectedWallets: string[] = [];
        if (window.cardano) {
            if (window.cardano.nami) detectedWallets.push('nami');
            if (window.cardano.flint) detectedWallets.push('flint');

            if (detectedWallets.length > 0) {
                setAvailableWallets(detectedWallets);
                setStep(2);
            } else {
                alert('No compatible wallet found!');
            }
        } else {
            alert('Please install a Cardano wallet!');
        }
    };

    // Connect Wallet
    const connect = async (walletType: string) => {
        try {
            let walletInstance;
            if (walletType === 'nami') {
                if ("nami" in window.cardano) {
                    if ("enable" in window.cardano.nami) {
                        walletInstance = await window.cardano.nami.enable();
                    }
                }
            } else if (walletType === 'flint') {
                walletInstance = await window.cardano.flint.enable();
            }

            setWallet(walletInstance);
            setWalletType(walletType);

            const addresses = await walletInstance.getUsedAddresses();
            const addressHex = Buffer.from(addresses[0], 'hex');
            const address = BaseAddress.from_address(Address.from_bytes(addressHex)).to_address();
            const baseAddress = address.to_bech32();
            setWalletBaseAddress(baseAddress);
            setStep(3);

            // Fetch ADA Handles
            const response = await fetch(`http://localhost:8080/auth/adahandles?base_address=${baseAddress}`, {
                headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
            });
            const handles = await response.json();
            setAdahandles(handles);

            // Default PCS Selection
            setPcsCollectionSelected(PCS_COLLECTIONS[0].id);
        } catch (error) {
            console.error('Failed to connect to wallet:', error);
        }
    };

    // Login (JWT Auth)
    const login = async () => {
        if (!walletBaseAddress) {
            alert("Please connect your wallet first.");
            return;
        }

        try {
            let endpoint = `http://localhost:8080/auth/nonce?base_address=${walletBaseAddress}`;

            if (authMethod === "ada_handle") {
                if (!adahandleSelected) {
                    alert("Select an ADA Handle");
                    return;
                }
                endpoint += `&ada_handle=${adahandleSelected}`;
            } else if (authMethod === "pcs") {
                if (!pcsCollectionSelected) {
                    alert("Select a PCS Collection");
                    return;
                }
                endpoint += `&pcs=${pcsCollectionSelected}`;
            }

            // Fetch nonce message to sign
            const res = await fetch(endpoint, {
                method: "GET",
                headers: { Accept: "application/json", "Content-Type": "application/json" },
            });

            if (!res.ok) {
                throw new Error(`Failed to fetch nonce: ${res.status}`);
            }

            const messageToSign = await res.text();

            if (!wallet) {
                alert("Wallet is not connected.");
                return;
            }

            const addresses = await wallet.getUsedAddresses();
            if (addresses.length === 0) {
                alert("No used addresses found.");
                return;
            }

            // Sign data
            const signedData = await wallet.signData(addresses[0], Buffer.from(messageToSign).toString("hex"));

            // Send signed data to backend for authentication
            const loginRes = await fetch("http://localhost:8080/auth/login", {
                method: "POST",
                headers: { Accept: "application/json", "Content-Type": "application/json" },
                body: JSON.stringify({ data_signature: JSON.stringify(signedData) }),
            });

            if (!loginRes.ok) {
                throw new Error(`Login request failed: ${loginRes.status}`);
            }

            const jwt = await loginRes.text();
            setJwtToken(jwt);
            setStep(4);
        } catch (error: any) {
            console.error("Login failed:", error);
            alert(`Login failed: ${error.message}`);
        }
    };

    // Fetch Wallet Data & Assets
    const fetchWalletData = async () => {
        if (!walletBaseAddress) {
            alert('Connect your wallet first.');
            return;
        }
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:8080/wallet/${walletBaseAddress}`, {
                headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: `Bearer ${jwtToken}` },
            });

            if (!response.ok) {
                console.error(`Error: ${response.status}`);
                return;
            }

            const data = await response.json();
            console.log("Fetched Wallet Data:", data);
            setWalletData(data);
        } catch (error) {
            console.error('Error fetching wallet data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (step === 4 && walletBaseAddress) {
            fetchWalletData();
        }
    }, [step, walletBaseAddress]);

    return (
        <div className="app-container">
            <Sidebar
                step={step}
                availableWallets={availableWallets}
                walletType={walletType}
                authMethod={authMethod}
                setAuthMethod={setAuthMethod}
                adahandles={adahandles}
                adahandleSelected={adahandleSelected}
                setAdahandleSelected={setAdahandleSelected}
                pcsCollections={PCS_COLLECTIONS}
                pcsCollectionSelected={pcsCollectionSelected}
                setPcsCollectionSelected={setPcsCollectionSelected}
                detectWallet={detectWallet}
                connect={connect}
                login={login}
                theme={theme}
                toggleTheme={toggleTheme}
                // Show Dashboard button only if wallet is connected and we have NFT assets
                showDashboardButton={walletBaseAddress !== null && walletData && walletData.nftCollections}
                openDashboard={() => setDashboardOpen(true)}
            />

            <div className="main-content">
                {loading ? (
                    <p>Loading assets...</p>
                ) : walletData && walletData.nftCollections ? (
                    <CollectionGrid nftCollections={walletData.nftCollections} />
                ) : (
                    <p>No NFT assets found.</p>
                )}
            </div>

            {dashboardOpen && walletBaseAddress && (
                <DashboardModal
                    walletAddress={walletBaseAddress}
                    score={score}
                    gamesPlayed={gamesPlayed}
                    statistics={statistics}
                    onClose={() => setDashboardOpen(false)}
                    onMint={handleMint}
                />
            )}
        </div>
    );
};

export default App;
