// App.tsx
import React, { useState, useEffect } from 'react';
import { Buffer } from 'buffer';
import { Address, BaseAddress } from '@emurgo/cardano-serialization-lib-browser';
import Sidebar from './components/Sidebar';
import CollectionGrid from './components/CollectionGrid';
import DashboardModal from './components/DashboardModal';
import useTheme from "./hooks/useTheme";
import './App.css';

const App: React.FC = () => {
    const { theme, toggleTheme } = useTheme();

    const [wallet, setWallet] = useState<any>(null);
    const [walletBaseAddress, setWalletBaseAddress] = useState<string | null>(null);
    const [walletType, setWalletType] = useState<string | null>(null);
    const [didToken, setDidToken] = useState<string | null>(null); // Using DID token instead of JWT
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

    const handleMint = () => {
        console.log("Mint GameKey Token clicked!");
    };

    // Detect Available Wallets with enhanced logging and prioritize Nami
    const detectWallet = async () => {
        const detectedWallets: string[] = [];
        if (window.cardano) {
            console.log("window.cardano keys:", Object.keys(window.cardano));

            // Prioritize Nami
            if (window.cardano.nami) {
                console.log("Nami wallet detected.");
                detectedWallets.push('nami');
            }
            if (window.cardano.flint) {
                console.log("Flint wallet detected.");
                detectedWallets.push('flint');
            }
            if (window.cardano.vespr) {
                console.log("Vespr wallet detected.");
                detectedWallets.push('vespr');
            }
            if (window.cardano.eternl) {
                console.log("Eternl wallet detected.");
                detectedWallets.push('eternl');
            }
            if (window.cardano.yoroi) {
                console.log("Yoroi wallet detected.");
                detectedWallets.push('yoroi');
            }
            if (window.cardano.lace) {
                console.log("Lace wallet detected.");
                detectedWallets.push('lace');
            }
            if (window.cardano.gero) {
                console.log("Gero wallet detected.");
                detectedWallets.push('gero');
            }
            console.log("Detected wallets array:", detectedWallets);

            if (detectedWallets.length > 0) {
                setAvailableWallets(detectedWallets);
                // Set default wallet to Nami if available; otherwise, use the first detected wallet.
                if (detectedWallets.includes('nami')) {
                    setWalletType('nami');
                    console.log("Default wallet set to Nami.");
                } else {
                    setWalletType(detectedWallets[0]);
                    console.log("Default wallet set to:", detectedWallets[0]);
                }
                setStep(2);
            } else {
                alert('No compatible wallet found!');
            }
        } else {
            alert('Please install a Cardano wallet!');
        }
    };

    // Connect Wallet - supports all detected wallets
    const connect = async (walletType: string) => {
        try {
            let walletInstance;
            if (walletType === 'nami') {
                if ("nami" in window.cardano && "enable" in window.cardano.nami) {
                    walletInstance = await window.cardano.nami.enable();
                    console.log("Connected to Nami wallet.");
                }
            } else if (walletType === 'flint') {
                if ("flint" in window.cardano && "enable" in window.cardano.flint) {
                    walletInstance = await window.cardano.flint.enable();
                    console.log("Connected to Flint wallet.");
                }
            } else if (walletType === 'vespr') {
                if ("vespr" in window.cardano && "enable" in window.cardano.vespr) {
                    walletInstance = await window.cardano.vespr.enable();
                    console.log("Connected to Vespr wallet.");
                }
            } else if (walletType === 'eternl') {
                if ("eternl" in window.cardano && "enable" in window.cardano.eternl) {
                    walletInstance = await window.cardano.eternl.enable();
                    console.log("Connected to Eternl wallet.");
                }
            } else if (walletType === 'yoroi') {
                if ("yoroi" in window.cardano && "enable" in window.cardano.yoroi) {
                    walletInstance = await window.cardano.yoroi.enable();
                    console.log("Connected to Yoroi wallet.");
                }
            } else if (walletType === 'lace') {
                if ("lace" in window.cardano && "enable" in window.cardano.lace) {
                    walletInstance = await window.cardano.lace.enable();
                    console.log("Connected to Lace wallet.");
                }
            } else if (walletType === 'gero') {
                if ("gero" in window.cardano && "enable" in window.cardano.gero) {
                    walletInstance = await window.cardano.gero.enable();
                    console.log("Connected to Gero wallet.");
                }
            }

            if (!walletInstance) {
                throw new Error(`Wallet ${walletType} is not available or failed to enable.`);
            }

            setWallet(walletInstance);
            setWalletType(walletType);

            // Retrieve base address using the first used address
            const addresses = await walletInstance.getUsedAddresses();
            if (addresses.length === 0) {
                throw new Error("No addresses available in wallet.");
            }
            const addressHex = Buffer.from(addresses[0], 'hex');
            const address = BaseAddress.from_address(Address.from_bytes(addressHex)).to_address();
            const baseAddress = address.to_bech32();
            setWalletBaseAddress(baseAddress);
            console.log("Base address retrieved:", baseAddress);
            setStep(3);

            // Fetch ADA Handles
            const response = await fetch(`http://localhost:8080/auth/adahandles?base_address=${baseAddress}`, {
                headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
            });
            const handles = await response.json();
            console.log("ADA Handles received:", handles);
            setAdahandles(handles);

            // Default PCS Selection
            setPcsCollectionSelected(PCS_COLLECTIONS[0].id);
        } catch (error) {
            console.error('Failed to connect to wallet:', error);
        }
    };

    // Login (DID Auth instead of JWT)
    // - For Nami, use getChangeAddress() (payment address)
    // - For all other wallets, use the first address from getUsedAddresses()
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

            console.log("Fetching nonce from:", endpoint);
            const res = await fetch(endpoint, {
                method: "GET",
                headers: { Accept: "application/json", "Content-Type": "application/json" },
            });
            if (!res.ok) {
                throw new Error(`Failed to fetch nonce: ${res.status}`);
            }
            const messageToSign = await res.text();
            console.log("Nonce to sign:", messageToSign);

            if (!wallet) {
                alert("Wallet is not connected.");
                return;
            }

            let signingAddress: string;
            if (walletType === 'nami' && wallet.getChangeAddress) {
                // For Nami, sign with the change (payment) address
                signingAddress = await wallet.getChangeAddress();
                console.log("Using Nami change address for signing:", signingAddress);
            } else if (wallet.getUsedAddresses) {
                // For all other wallets, use the first used address
                const usedAddresses = await wallet.getUsedAddresses();
                if (usedAddresses.length === 0) {
                    alert("No used addresses found.");
                    return;
                }
                signingAddress = usedAddresses[0];
                console.log("Using first used address for signing:", signingAddress);
            } else {
                throw new Error("Wallet does not support required address retrieval methods.");
            }

            // Sign data with the chosen address
            const signedData = await wallet.signData(
                signingAddress,
                Buffer.from(messageToSign).toString("hex")
            );
            console.log("Signed data:", signedData);

            // Send signed data to backend for authentication
            const loginRes = await fetch("http://localhost:8080/auth/login", {
                method: "POST",
                headers: { Accept: "application/json", "Content-Type": "application/json" },
                body: JSON.stringify({ data_signature: JSON.stringify(signedData) }),
            });
            if (!loginRes.ok) {
                throw new Error(`Login request failed: ${loginRes.status}`);
            }
            // Instead of a JWT, the backend returns a Decentralized Digital Identity.
            const did = await loginRes.text();
            console.log("Received Decentralized Digital Identity from backend:", did);
            setDidToken(did);
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
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: `DID ${didToken}` // Use DID token here
                },
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
    }, [step, walletBaseAddress, didToken]);

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
                    onClose={() => setDashboardOpen(false)}
                    onMint={handleMint}
                />
            )}
        </div>
    );
};

export default App;
