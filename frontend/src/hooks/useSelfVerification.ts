import { useState } from 'react';
import { SelfAppBuilder } from '@selfxyz/sdk-common';
import type { SelfApp } from '@selfxyz/sdk-common';
import { ethers } from 'ethers';
import { CHAIN_CONFIG } from '../config/contracts';

interface UseSelfVerificationProps {
  childAddress: string;
  endpoint?: string;
}

export function useSelfVerification({ childAddress, endpoint }: UseSelfVerificationProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selfApp, setSelfApp] = useState<SelfApp | null>(null);

  const initializeVerification = () => {
    if (!childAddress || childAddress.trim() === '') {
      console.error('Child address is required for verification');
      alert('Error: Child address not found. Please create a child account first.');
      return;
    }

    // Validate that it's a valid Ethereum address
    if (!ethers.isAddress(childAddress)) {
      console.error('Invalid Ethereum address:', childAddress);
      alert('Error: Invalid child address format. Please check your account data.');
      return;
    }

    // Convert to checksummed address (required by Self Protocol SDK)
    const checksummedAddress = ethers.getAddress(childAddress);
    console.log('Initializing verification for address:', checksummedAddress);

    // CRITICAL: Self Protocol converts the STRING to UTF-8 bytes
    // If we pass "0x1234...", it converts the ASCII characters to bytes
    // So we pass JUST the address (no 0x prefix, lowercase)
    // The contract will receive the address as a hex string in bytes format
    const userDefinedData = checksummedAddress.slice(2).toLowerCase();

    // Get verifier contract address from environment variables (via CHAIN_CONFIG)
    const verifierAddress = (endpoint || CHAIN_CONFIG.celoSepolia.verifierAddress || '0xa4Ca603a1BEb03F1C11bdeA90227855f67DFf796').toLowerCase();

    // Debug logging
    console.log('🔍 Self Protocol Configuration:', {
      appName: 'Scholar-Fi',
      scope: 'scholar-fi-v1',
      endpointType: 'staging_celo',
      endpoint: verifierAddress,
      userId: checksummedAddress,
      userIdType: 'hex',
      userDefinedData: userDefinedData,
      userDefinedDataLength: userDefinedData.length,
      version: 2,
      disclosures: {
        minimumAge: 18,
        ofac: false,
        excludedCountries: [],
      },
    });

    // Create SelfApp configuration for age verification
    // Using direct on-chain verification with Celo Sepolia contract
    // CRITICAL: These settings MUST match ScholarFiAgeVerifier.sol contract exactly
    const app = new SelfAppBuilder({
      appName: 'Scholar-Fi',
      scope: 'scholar-fi-v1', // Must match contract scopeSeed
      endpointType: 'staging_celo', // Direct on-chain verification on Celo Sepolia (REQUIRES MOCK PASSPORT)
      endpoint: verifierAddress, // ScholarFiAgeVerifier contract from env (MUST be lowercase)
      userId: checksummedAddress, // Use checksummed child address as user ID
      userIdType: 'hex', // REQUIRED: Specify that userId is an Ethereum address
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
