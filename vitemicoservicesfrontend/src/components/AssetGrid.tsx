import React from 'react';
import AssetCard from './AssetCard.tsx';

interface Asset {
    unit: string;
    quantity: string;
    metadata?: {
        name?: string;
        description?: string;
        ipfsUrl?: string;
        [key: string]: any;
    };
}

interface AssetGridProps {
    assets: Asset[];
}

const AssetGrid: React.FC<AssetGridProps> = ({ assets }) => {
    return (
        <div className="asset-grid">
            {assets.length > 0 ? (
                assets.map((asset, index) => <AssetCard key={`${asset.unit}-${index}`} asset={asset} />)
            ) : (
                <p>No assets available.</p>
            )}
        </div>
    );
};

export default AssetGrid;
