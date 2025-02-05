// CollectionGrid.tsx
import React from 'react';
import AssetCard from './AssetCard';

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

interface CollectionGridProps {
    // The nftCollections is an object with policyId keys mapping to arrays of assets.
    nftCollections: { [policyId: string]: Asset[] };
}

const CollectionGrid: React.FC<CollectionGridProps> = ({ nftCollections }) => {
    return (
        <div>
            {Object.entries(nftCollections).map(([policyId, assets]) => {
                // Use the "collection" field from extra metadata if available.
                const collectionName =
                    assets[0]?.metadata?.extraMetadata?.collection ||
                    assets[0]?.extraMetadata?.collection ||
                    policyId;
                return (
                    <div key={policyId} className="collection-section">
                        <h2 className="collection-title">{collectionName}</h2>
                        <div className="asset-grid">
                            {assets.map((asset) => (
                                <AssetCard key={asset.unit} asset={asset} />
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default CollectionGrid;
