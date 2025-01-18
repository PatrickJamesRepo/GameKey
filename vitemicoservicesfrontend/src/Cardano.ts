export class Cardano {
    private wallets: Record<string, any>;

    constructor() {
        this.wallets = {
            nami: window.cardano?.nami,
            yoroi: window.cardano?.yoroi,
            vespr: window.cardano?.vespr,
            eternl: window.cardano?.eternl,
            lace: window.lace?.cardano,
        };
    }

    getAvailableWallets(): string[] {
        const availableWallets = Object.keys(this.wallets).filter(
            (key) => this.wallets[key] && typeof this.wallets[key].enable === 'function'
        );
        console.log("Available wallets:", availableWallets);
        return availableWallets;
    }

    async enableWallet(walletName: string | undefined): Promise<any> {
        console.log(`Attempting to enable wallet: ${walletName}`);
        const wallet = this.wallets[walletName.toLowerCase()];
        if (!wallet) {
            const errorMessage = `Wallet ${walletName} is not available.`;
            console.error(errorMessage);
            throw new Error(errorMessage);
        }

        try {
            await wallet.enable();
            console.log(`${walletName} wallet enabled successfully.`);
            return wallet;
        } catch (error) {
            console.error(`Failed to enable wallet ${walletName}:`, error);
            throw error;
        }
    }

    async getAddress(wallet: any): Promise<string> {
        console.log("Attempting to retrieve address...");
        const methods = [
            { name: "getUsedAddresses", retriever: wallet.getUsedAddresses?.bind(wallet) },
            { name: "getChangeAddress", retriever: wallet.getChangeAddress?.bind(wallet) },
            { name: "getRewardAddresses", retriever: wallet.getRewardAddresses?.bind(wallet) }
        ];

        for (const method of methods) {
            if (method.retriever) {
                try {
                    const result = await method.retriever();
                    if (Array.isArray(result) && result.length > 0) {
                        return this.convertHexToBech32(result[0]);
                    } else if (typeof result === 'string') {
                        return this.convertHexToBech32(result);
                    }
                } catch (error) {
                    console.warn(`Error using ${method.name}:`, error);
                }
            } else {
                console.log(`${method.name} is not implemented in the wallet.`);
            }
        }

        const errorMessage = "This wallet does not support address retrieval.";
        console.error(errorMessage);
        throw new Error(errorMessage);
    }

    async signData(wallet: any, address: string, message: string): Promise<any> {
        console.log(`Attempting to sign data for address ${address}`);
        if (!wallet.signData) {
            const errorMessage = "This wallet does not support data signing.";
            console.error(errorMessage);
            throw new Error(errorMessage);
        }

        try {
            const signature = await wallet.signData(address, message);
            console.log(`Successfully signed data:`, signature);
            return signature;
        } catch (error) {
            console.error("Error signing data:", error);
            throw error;
        }
    }

    private convertHexToBech32(hexAddress: string): string {
        console.log(`Converting hex address to Bech32: ${hexAddress}`);
        // Properly implement hex to Bech32 conversion.
        return hexAddress; // Replace with actual conversion logic.
    }
}
