// Sidebar.tsx
import React from 'react';

interface SidebarProps {
    step: number;
    availableWallets: string[];
    walletType: string | null;
    detectWallet: () => void;
    connect: (walletType: string) => void;
    login: () => void;
    authMethod: 'base_address' | 'ada_handle' | 'pcs';
    setAuthMethod: (method: 'base_address' | 'ada_handle' | 'pcs') => void;
    adahandles: string[];
    adahandleSelected: string | null;
    setAdahandleSelected: (handle: string) => void;
    pcsCollectionSelected: string | null;
    setPcsCollectionSelected: (collection: string) => void;
    pcsCollections: { id: string; name: string }[];
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    showDashboardButton: boolean;
    openDashboard: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
                                             step,
                                             availableWallets,
                                             walletType,
                                             detectWallet,
                                             connect,
                                             login,
                                             authMethod,
                                             setAuthMethod,
                                             adahandles,
                                             adahandleSelected,
                                             setAdahandleSelected,
                                             pcsCollectionSelected,
                                             setPcsCollectionSelected,
                                             pcsCollections,
                                             theme,
                                             toggleTheme,
                                             showDashboardButton,
                                             openDashboard,
                                         }) => {
    return (
        <aside className="sidebar">
            <h2>GameKey</h2>

            {/* Light/Dark Mode Toggle */}
            <button className="theme-toggle" onClick={toggleTheme}>
                {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
            </button>

            {/* Step 1: Detect Wallet */}
            {step === 1 && <button onClick={detectWallet} className="button">Detect Wallet</button>}

            {/* Step 2: Connect Wallet */}
            {step === 2 && (
                <div>
                    <h3>Select Wallet:</h3>
                    {availableWallets.map((wallet) => (
                        <button
                            key={wallet}
                            onClick={() => connect(wallet)}
                            className={`button ${walletType === wallet ? "active" : ""}`}
                        >
                            Connect {wallet.charAt(0).toUpperCase() + wallet.slice(1)}
                        </button>
                    ))}
                </div>
            )}

            {/* Steps 3 & 4: Authentication & Login */}
            {step >= 3 && walletType && (
                <div>
                    <h3>Authentication Method:</h3>
                    <div className="auth-options">
                        <button
                            className={`button ${authMethod === 'base_address' ? "active" : ""}`}
                            onClick={() => setAuthMethod('base_address')}
                        >
                            Base Address
                        </button>
                        <button
                            className={`button ${authMethod === 'ada_handle' ? "active" : ""}`}
                            onClick={() => setAuthMethod('ada_handle')}
                        >
                            ADA Handle
                        </button>
                        <button
                            className={`button ${authMethod === 'pcs' ? "active" : ""}`}
                            onClick={() => setAuthMethod('pcs')}
                        >
                            PCS Collection
                        </button>
                    </div>

                    {authMethod === 'ada_handle' && (
                        <div className="dropdown-wrapper">
                            <label>Select ADA Handle:</label>
                            <select
                                value={adahandleSelected || ''}
                                onChange={(e) => setAdahandleSelected(e.target.value)}
                                className="select"
                            >
                                <option value="">Select</option>
                                {adahandles.length > 0 ? (
                                    adahandles.map((handle) => (
                                        <option key={handle} value={handle}>{handle}</option>
                                    ))
                                ) : (
                                    <option disabled>No ADA Handles Available</option>
                                )}
                            </select>
                        </div>
                    )}

                    {authMethod === 'pcs' && (
                        <div className="dropdown-wrapper">
                            <label>Select PCS Collection:</label>
                            <select
                                value={pcsCollectionSelected || ''}
                                onChange={(e) => setPcsCollectionSelected(e.target.value)}
                                className="select"
                            >
                                <option value="">Select PCS Collection</option>
                                {pcsCollections.length > 0 ? (
                                    pcsCollections.map((pcs) => (
                                        <option key={pcs.id} value={pcs.id}>{pcs.name}</option>
                                    ))
                                ) : (
                                    <option disabled>No PCS Collections Available</option>
                                )}
                            </select>
                        </div>
                    )}

                    <button onClick={login} className="button" disabled={step >= 4 || !authMethod}>
                        Login
                    </button>
                </div>
            )}

            {/* Dashboard Button */}
            {showDashboardButton && (
                <button onClick={openDashboard} className="button dashboard-button">
                    Dashboard
                </button>
            )}
        </aside>
    );
};

export default Sidebar;
