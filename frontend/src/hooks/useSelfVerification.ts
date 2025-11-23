import { useState } from 'react';
import { SelfAppBuilder } from '@selfxyz/sdk-common';
import type { SelfApp } from '@selfxyz/sdk-common';
import { ethers } from 'ethers';

interface UseSelfVerificationProps {
  childAddress: string;
  endpoint?: string;
}

export function useSelfVerification({ childAddress, endpoint }: UseSelfVerificationProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selfApp, setSelfApp] = useState<SelfApp | null>(null);

  const initializeVerification = () => {
    if (!childAddress) {
      console.error('Child address is required for verification');
      return;
    }

    // ABI-encode the child address to match contract's abi.decode(userData, (address))
    const encodedAddress = ethers.AbiCoder.defaultAbiCoder().encode(
      ['address'],
      [childAddress]
    );

    // Convert to hex string without 0x prefix and pad to 64 bytes (128 hex chars)
    const userDefinedData = encodedAddress.slice(2).padEnd(128, '0');

    // Create SelfApp configuration for age verification
    // CRITICAL: These settings MUST match ScholarFiAgeVerifier.sol contract exactly
    const app = new SelfAppBuilder({
      appName: 'Scholar-Fi',
      scope: 'scholar-fi-v1', // Must match contract scopeSeed
      endpoint: endpoint || 'https://scholar-fi.vercel.app/api/verify', // Self Protocol requires non-localhost endpoint
      userId: childAddress, // Use child address as user ID
      userDefinedData, // ABI-encoded address matching contract's userData format
      version: 2,
      disclosures: {
        minimumAge: 18, // Must match contract olderThan: 18
        ofac: false, // Must match contract ofacEnabled: false
        excludedCountries: [], // Must match contract forbiddenCountries: []
      },
    }).build();

    setSelfApp(app);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelfApp(null);
  };

  const handleVerificationSuccess = async () => {
    console.log('✅ Age verification successful for:', childAddress);
    closeModal();
    // The smart contract will automatically be updated via the Self Protocol
    // The on-chain verification status will be checked by polling the contract
  };

  return {
    isModalOpen,
    selfApp,
    initializeVerification,
    closeModal,
    handleVerificationSuccess,
  };
}
