import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useMultiChain } from "./useMultiChain";

export interface ChildProfile {
  name: string;
  walletAddress: string;
  vaultGrowth: string;
  parentApprovals: number;
  createdAt: number;
  exists: boolean;
}

/**
 * Hook for reading encrypted child profiles from Oasis Sapphire
 * Data is confidentially stored with TEE-backed encryption
 */
export function useOasisProfile(childAddress: string) {
  const [profile, setProfile] = useState<ChildProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { datastoreContract, oasisProvider, address } = useMultiChain();

  useEffect(() => {
    async function fetchProfile() {
      if (!datastoreContract || !childAddress || !ethers.isAddress(childAddress)) {
        setProfile(null);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Call getChildProfile on Oasis datastore
        const result = await datastoreContract.getChildProfile(childAddress);

        // Check if profile exists
        if (!result[0] || result[0] === ethers.ZeroAddress) {
          setProfile({
            name: "",
            walletAddress: childAddress,
            vaultGrowth: "0",
            parentApprovals: 0,
            createdAt: 0,
            exists: false
          });
          return;
        }

        // Parse profile data
        setProfile({
          name: result[1] || "Unknown",
          walletAddress: result[0],
          vaultGrowth: ethers.formatEther(result[2] || 0),
          parentApprovals: Number(result[3] || 0),
          createdAt: Number(result[4] || 0),
          exists: true
        });
      } catch (err: any) {
        console.error("Failed to fetch Oasis profile:", err);
        setError(err.message || "Failed to load profile");
        setProfile(null);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfile();
  }, [datastoreContract, childAddress]);

  return { profile, isLoading, error };
}
