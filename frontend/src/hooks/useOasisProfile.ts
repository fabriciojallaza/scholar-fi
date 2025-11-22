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
        // Returns: [encryptedName, dateOfBirth, parentEmail, baseCheckingWallet, baseVaultWallet, parentBaseWallet, ageVerifiedOnCelo, totalDeposited, vaultGrowth, lastUpdated]
        const result = await datastoreContract.getChildProfile(childAddress);

        // Check if profile exists (first returned value is encryptedName string)
        if (!result || result[0] === "") {
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

        // Parse profile data according to new ABI
        setProfile({
          name: result[0] || "Unknown", // encryptedName
          walletAddress: childAddress,
          vaultGrowth: ethers.formatEther(result[8] || 0), // vaultGrowth
          parentApprovals: result[6] ? 1 : 0, // ageVerifiedOnCelo as approval count
          createdAt: Number(result[9] || 0), // lastUpdated
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
