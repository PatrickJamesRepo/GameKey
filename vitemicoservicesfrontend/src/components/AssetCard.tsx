// AssetCard.tsx
import React, { useState } from "react";
import { Asset } from "@meshsdk/core";

interface Asset {
    unit: string;
    quantity: string;
    metadata?: {
        name?: string;
        description?: string;
        ipfsUrl?: string;
        collectionName?: string;
        extraMetadata?: Record<string, any>;
    };
    ipfsUrl?: string;
    name?: string;
    description?: string | null;
    extraMetadata?: Record<string, any>;
}

interface AssetCardProps {
    asset: Asset;
    assetId: string;
}

/**
 * Converts an IPFS URL to a fully qualified gateway URL if necessary.
 * For example, transforms "ipfs://QmUbyuf..." into "https://ipfs.io/ipfs/QmUbyuf..."
 */
const normalizeIpfsUrl = (url: string): string => {
    if (!url) return "";
    if (url.startsWith("ipfs://")) {
        return url.replace("ipfs://", "https://ipfs.io/ipfs/");
    }
    return url;
};

const AssetCard: React.FC<AssetCardProps> = ({ asset, assetId }) => {
    // Get the IPFS URL from metadata or the top level.
    const rawIpfsUrl = asset.metadata?.ipfsUrl || asset.ipfsUrl || "";
    const ipfsUrl = normalizeIpfsUrl(rawIpfsUrl);
    const [imageError, setImageError] = useState(false);
    const [showAttributes, setShowAttributes] = useState(false);

    // Display name, quantity, policy ID, and collection name.
    const displayName = asset.metadata?.name || asset.name || asset.unit;
    const displayQuantity = asset.quantity;
    const policyId = asset.unit;
    const collectionName = asset.metadata?.collectionName || "Unknown Collection";

    // Merge extra metadata from both places.
    const extraMeta = {
        ...(asset.metadata?.extraMetadata || {}),
        ...(asset.extraMetadata || {})
    };

    // Sort extra metadata keys alphabetically.
    const sortedKeys = Object.keys(extraMeta).sort();

    return (
        <div className="asset-card small" data-asset-id={assetId}>
            <div className="asset-card-image">
                {ipfsUrl && !imageError ? (
                    <img
                        src={ipfsUrl}
                        alt={displayName}
                        style={{ width: 200, height: "auto" }}
                        onError={() => {
                            console.error("Image failed to load:", ipfsUrl);
                            setImageError(true);
                        }}
                    />
                ) : (
                    <div className="no-image">⚠️ No Image Available</div>
                )}
            </div>
            <div className="asset-card-content">
                <h3>{displayName}</h3>
                <p>
                    <strong>Quantity:</strong> {displayQuantity}
                </p>
                <p className="policy-id">
                    <strong>Policy ID:</strong> {policyId}
                </p>
                <p className="collection-name">
                    <strong>Collection:</strong> {collectionName}
                </p>
            </div>
            {sortedKeys.length > 0 && (
                <div className="attributes-toggle">
                    <button
                        className="toggle-attributes"
                        onClick={() => setShowAttributes(!showAttributes)}
                    >
                        {showAttributes ? "Hide Attributes" : "Show Attributes"}
                    </button>
                </div>
            )}
            {showAttributes && sortedKeys.length > 0 && (
                <div className="asset-card-attributes">
                    <h4>Attributes</h4>
                    <dl>
                        {sortedKeys.map((key) => (
                            <div key={key} className="metadata-row">
                                <dt className="metadata-key">{key}:</dt>
                                <dd className="metadata-value">{String(extraMeta[key])}</dd>
                            </div>
                        ))}
                    </dl>
                </div>
            )}
        </div>
    );
};

export default AssetCard;