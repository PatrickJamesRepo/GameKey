import React from 'react';

interface Asset {
    unit: string;
    quantity: string;
    metadata?: {
        name?: string;
        description?: string;
        ipfsUrl?: string;
    };
}

interface AssetCardProps {
    asset: Asset;
}

const AssetCard: React.FC<AssetCardProps> = ({ asset }) => {
    return (
        <div className="asset-card">
            <div className="asset-card-image">
                {asset.metadata?.ipfsUrl ? (
                    <img src={asset.metadata.ipfsUrl} alt={asset.metadata?.name || asset.unit} />
                ) : (
                    <div>No Image</div>
                )}
            </div>
            <div className="asset-card-content">
                <h3>{asset.metadata?.name || asset.unit}</h3>
                <p><strong>Quantity:</strong> {asset.quantity}</p>
            </div>
        </div>
    );
};

export default AssetCard;
