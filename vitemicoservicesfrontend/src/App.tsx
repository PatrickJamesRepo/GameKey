import React, { useState } from 'react';
import { Buffer } from 'buffer';
import { Address, BaseAddress } from '@emurgo/cardano-serialization-lib-browser';

const App: React.FC = () => {
    const [authMethod, setAuthMethod] = useState('base_address');
    const [wallet, setWallet] = useState<any>(null);
    const [adahandleSelected, setAdahandleSelected] = useState<string | null>(null);
    const [adahandles, setAdahandles] = useState<string[]>([]);
    const [walletBaseAddress, setWalletBaseAddress] = useState<string | null>(null);
    const [jwtToken, setJwtToken] = useState<string | null>(null);
    const [walletType, setWalletType] = useState<string | null>(null); // Store the selected wallet type
    const [availableWallets, setAvailableWallets] = useState<string[]>([]); // To store available wallets
    const [step, setStep] = useState(1); // Step control for the flow
    const [dropdownVisible, setDropdownVisible] = useState(false); // State to toggle dropdown visibility

    // Wallet detection logic
    const detectWallet = async () => {
        const detectedWallets: string[] = [];

        if (window.cardano) {
            if (window.cardano.nami) {
                detectedWallets.push('nami');
            }
            if (window.cardano.flint) {
                detectedWallets.push('flint');
            }

            if (detectedWallets.length > 0) {
                setAvailableWallets(detectedWallets);
                alert(`Available Wallets: ${detectedWallets.join(', ')}`);
                setStep(2); // Move to the next step (Select Wallet)
            } else {
                alert('No compatible wallet found!');
            }
        } else {
            alert('Please install a Cardano wallet!');
        }
    };

    const connect = async (walletType: string) => {
        try {
            let walletInstance;
            if (walletType === 'nami') {
                walletInstance = await window.cardano.nami.enable();
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

            // Fetch Ada handles from the backend
            const response = await fetch(
                `http://localhost:8080/auth/adahandles?base_address=${baseAddress}`,
                {
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                }
            );
            const handles = await response.json();
            setAdahandles(handles);

            setStep(3); // Move to the next step (Login)

        } catch (error) {
            console.error('Failed to connect to wallet:', error);
        }
    };

    const login = async () => {
        if (!walletBaseAddress) {
            alert('Please connect your wallet first.');
            return;
        }
        try {
            let messageToSign;

            if (authMethod === 'base_address') {
                const res = await fetch(
                    `http://localhost:8080/auth/nonce?base_address=${walletBaseAddress}`,
                    {
                        method: 'GET',
                        headers: {
                            Accept: 'application/json',
                            'Content-Type': 'application/json',
                        },
                    }
                );
                messageToSign = await res.text();
            } else if (authMethod === 'ada_handle') {
                const res = await fetch(
                    `http://localhost:8080/auth/nonce?base_address=${walletBaseAddress}&ada_handle=${adahandleSelected}`,
                    {
                        method: 'GET',
                        headers: {
                            Accept: 'application/json',
                            'Content-Type': 'application/json',
                        },
                    }
                );
                messageToSign = await res.text();
            }

            const addresses = await wallet.getUsedAddresses();

            // Sign the message with the wallet
            const signedData = await wallet.signData(
                addresses[0],
                Buffer.from(messageToSign).toString('hex')
            );

            // Send the signed data to the backend to log in
            const res = await fetch('http://localhost:8080/auth/login', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    data_signature: JSON.stringify(signedData),
                }),
            });

            const jwt = await res.text();
            setJwtToken(jwt);

            setStep(4); // Move to the next step (Endpoints Interaction)

        } catch (error) {
            console.error('Login failed:', error);
        }
    };

    const invoke = async (path: string) => {
        try {
            const headers: HeadersInit = jwtToken
                ? {
                    Authorization: `Bearer ${jwtToken}`,
                }
                : {};

            const res = await fetch(`http://localhost:8080${path}`, {
                method: 'GET',
                headers,
            });

            const status = res.status;
            const txt = await res.text();

            console.log('Status:', status);
            console.log('Response:', txt);
        } catch (error) {
            console.error('Error invoking endpoint:', error);
        }
    };

    return (
        <div>
            {/* Dropdown menu in the top right */}
            <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                <button onClick={() => setDropdownVisible(!dropdownVisible)}>Wallet Actions</button>
                {dropdownVisible && (
                    <div
                        style={{
                            position: 'absolute',
                            top: '40px',
                            right: '0',
                            background: 'white',
                            border: '1px solid #ccc',
                            padding: '10px',
                            width: '200px',
                        }}
                    >
                        {step === 1 && (
                            <div>
                                <button onClick={detectWallet}>Detect Wallet</button>
                            </div>
                        )}
                        {step === 2 && (
                            <div>
                                <h3>Select Wallet:</h3>
                                {availableWallets.map((wallet) => (
                                    <button
                                        key={wallet}
                                        onClick={() => connect(wallet)}
                                        disabled={walletType !== null}
                                    >
                                        Connect {wallet.charAt(0).toUpperCase() + wallet.slice(1)}
                                    </button>
                                ))}
                            </div>
                        )}
                        {step === 3 && (
                            <div>
                                <div>Selected Wallet: {walletType}</div>
                                <div>Selected Authentication Method: {authMethod}</div>
                                <input
                                    type="radio"
                                    id="baseAddress"
                                    value="base_address"
                                    checked={authMethod === 'base_address'}
                                    onChange={() => setAuthMethod('base_address')}
                                />
                                <label htmlFor="baseAddress">Base Address</label>

                                <input
                                    type="radio"
                                    id="adaHandle"
                                    value="ada_handle"
                                    checked={authMethod === 'ada_handle'}
                                    onChange={() => setAuthMethod('ada_handle')}
                                />
                                <label htmlFor="adaHandle">Ada Handle</label>

                                {authMethod === 'ada_handle' && (
                                    <div>
                                        <div>Selected Ada Handle: {adahandleSelected}</div>
                                        <select
                                            value={adahandleSelected || ''}
                                            onChange={(e) => setAdahandleSelected(e.target.value)}
                                        >
                                            {adahandles.map((handle) => (
                                                <option key={handle} value={handle}>
                                                    {handle}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                <button onClick={login} disabled={jwtToken !== null}>
                                    Login
                                </button>
                            </div>
                        )}
                        {step === 4 && (
                            <div>
                                <button onClick={() => invoke('/public/endpoint')}>Hit public endpoint</button>
                                <button onClick={() => invoke('/secured/endpoint')}>Hit secured endpoint</button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default App;
