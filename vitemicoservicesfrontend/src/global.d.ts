// Extend the global Window interface to include Cardano wallets
interface CardanoWallet {
    enable: () => Promise<void>; // Enables the wallet
    getUsedAddresses: () => Promise<string[]>; // Retrieves the used addresses
    getChangeAddress: () => Promise<string>; // Retrieves the change address
    signData: (address: string, message: string) => Promise<{ signature: string; key: string }>; // Signs data
}

interface Cardano {
    flint: CardanoWallet;
    nami?: CardanoWallet;
    yoroi?: CardanoWallet;
    vespr?: CardanoWallet;
    eternl?: CardanoWallet;
}

interface LaceWallet {
    cardano?: CardanoWallet;
}

declare global {
    interface Window {
        cardano?: Cardano;
        lace?: LaceWallet;
    }
}

export {};
