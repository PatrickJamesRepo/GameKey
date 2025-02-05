// AssetGrid.tsx
import React from "react";
import AssetCard from "./AssetCard";

interface Asset {
    unit: string;
    quantity: string;
    metadata?: {
        name?: string;
        description?: string;
        ipfsUrl?: string;
        extraMetadata?: Record<string, any>;
    };
    ipfsUrl?: string;
    name?: string;
    description?: string | null;
    extraMetadata?: Record<string, any>;
}

interface AssetGridProps {
    assets: Asset[];
}

const AssetGrid: React.FC<AssetGridProps> = ({ assets }) => {
    return (
        <div className="asset-grid">
            {assets.map((asset) => (
                <AssetCard key={asset.unit} asset={asset} />
            ))}
        </div>
    );
};

export default AssetGrid;
