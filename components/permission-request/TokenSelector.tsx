'use client';

import { useState, useEffect, useRef } from 'react';
import { COMMON_TOKENS, NATIVE_TOKEN, TokenInfo } from '@/lib/metamask-permissions/types';

interface TokenSelectorProps {
  value: string | null; // null for native ETH, address string for ERC-20
  onChange: (token: TokenInfo) => void;
  disabled?: boolean;
}

export default function TokenSelector({ value, onChange, disabled }: TokenSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCustom, setIsCustom] = useState(false);
  const [customAddress, setCustomAddress] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Find selected token - null means native ETH
  // First check if it's a custom token (not in COMMON_TOKENS)
  const isCustomToken = value && value !== 'native' && value !== 'CUSTOM_PLACEHOLDER' && !COMMON_TOKENS.find(t => t.address?.toLowerCase() === value.toLowerCase());
  const isCustomPlaceholder = value === 'CUSTOM_PLACEHOLDER';
  
  const selectedToken = value === null 
    ? NATIVE_TOKEN 
    : isCustomPlaceholder
    ? { address: 'CUSTOM_PLACEHOLDER', symbol: 'CUSTOM', decimals: 18, name: 'Custom Token', isNative: false } as TokenInfo
    : isCustomToken
    ? { address: value, symbol: 'CUSTOM', decimals: 18, name: 'Custom Token', isNative: false } as TokenInfo
    : COMMON_TOKENS.find(t => t.address?.toLowerCase() === value.toLowerCase());
  
  const getTokenIcon = (token: TokenInfo) => {
    if (token.isNative) {
      return '🌐';
    }
    switch (token.symbol) {
      case 'USDC':
        return '💵';
      default:
        return '🪙';
    }
  };

  const handleTokenSelect = (token: TokenInfo) => {
    setIsCustom(false);
    setCustomAddress('');
    onChange(token);
    setIsOpen(false);
  };

  const handleCustomSelect = () => {
    setIsCustom(true);
    setIsOpen(false);
    // Clear any previous selection
    setCustomAddress('');
    // Notify parent that custom token is selected (even without address yet)
    onChange({
      address: 'CUSTOM_PLACEHOLDER',
      symbol: 'CUSTOM',
      decimals: 18,
      name: 'Custom Token',
      isNative: false,
    });
  };

  const handleCustomTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const address = e.target.value;
    setCustomAddress(address);
    if (address && address.startsWith('0x') && address.length === 42) {
      onChange({
        address,
        symbol: 'CUSTOM',
        decimals: 18,
        name: 'Custom Token',
        isNative: false,
      });
    } else {
      // If address is invalid, don't change the selection
      // Keep the previous token selected
    }
  };

  // Check if current value is a custom token (not in COMMON_TOKENS)
  useEffect(() => {
    if (value && value !== 'native') {
      const foundToken = COMMON_TOKENS.find(t => t.address?.toLowerCase() === value.toLowerCase());
      if (!foundToken) {
        // It's a custom token - keep input empty, just set isCustom flag
        setIsCustom(true);
        // Don't set customAddress here - keep it empty for user to fill
      } else {
        // It's a known token
        setIsCustom(false);
        setCustomAddress('');
      }
    } else if (value === null) {
      // Native ETH selected
      setIsCustom(false);
      setCustomAddress('');
    }
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="form-group">
      <label className="token-selector-label">
        Token Type <span style={{ color: '#dc3545' }}>*</span>
      </label>
      
      <div className="token-dropdown-container" ref={dropdownRef}>
        <button
          type="button"
          className="token-dropdown-trigger"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
        >
          <div className="token-dropdown-selected">
            <span className="token-dropdown-icon">
              {(isCustom || isCustomToken || isCustomPlaceholder) && customAddress ? '🪙' : selectedToken && !isCustomToken && !isCustomPlaceholder ? getTokenIcon(selectedToken) : (isCustom || isCustomToken || isCustomPlaceholder) ? '➕' : '🌐'}
            </span>
            <div className="token-dropdown-info">
              <span className="token-dropdown-symbol">
                {(isCustom || isCustomToken || isCustomPlaceholder) && customAddress
                  ? 'CUSTOM' 
                  : selectedToken && !isCustomToken && !isCustomPlaceholder
                    ? (selectedToken.isNative ? 'ETH' : selectedToken.symbol) 
                    : (isCustom || isCustomToken || isCustomPlaceholder) ? 'Custom Token' : 'Select token'}
              </span>
              <span className="token-dropdown-name">
                {(isCustom || isCustomToken || isCustomPlaceholder) && customAddress
                  ? customAddress.slice(0, 10) + '...' + customAddress.slice(-8)
                  : selectedToken && !isCustomToken && !isCustomPlaceholder
                    ? (selectedToken.isNative ? 'Native Ethereum' : selectedToken.name)
                    : (isCustom || isCustomToken || isCustomPlaceholder) ? 'Enter ERC-20 address' : ''}
              </span>
            </div>
          </div>
          <svg 
            className={`token-dropdown-chevron ${isOpen ? 'open' : ''}`}
            width="20" 
            height="20" 
            viewBox="0 0 20 20" 
            fill="none"
          >
            <path 
              d="M5 7.5L10 12.5L15 7.5" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {isOpen && (
          <div className="token-dropdown-menu">
            <div
              className={`token-dropdown-item ${selectedToken?.isNative ? 'selected' : ''}`}
              onClick={() => handleTokenSelect(NATIVE_TOKEN)}
            >
              <span className="token-dropdown-item-icon">🌐</span>
              <div className="token-dropdown-item-content">
                <div className="token-dropdown-item-symbol">ETH</div>
                <div className="token-dropdown-item-details">Native Ethereum • 18 decimals</div>
              </div>
              {selectedToken?.isNative && <span className="token-dropdown-check">✓</span>}
            </div>

            {COMMON_TOKENS.filter(t => !t.isNative).map((token) => {
              // Only show as selected if it's not a custom token and matches the address
              const isSelected = !isCustomToken && !isCustomPlaceholder && !isCustom && selectedToken?.address?.toLowerCase() === token.address?.toLowerCase();
              return (
                <div
                  key={token.address}
                  className={`token-dropdown-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleTokenSelect(token)}
                >
                  <span className="token-dropdown-item-icon">{getTokenIcon(token)}</span>
                  <div className="token-dropdown-item-content">
                    <div className="token-dropdown-item-symbol">{token.symbol}</div>
                    <div className="token-dropdown-item-details">{token.name} • {token.decimals} decimals</div>
                  </div>
                  {isSelected && <span className="token-dropdown-check">✓</span>}
                </div>
              );
            })}

            <div
              className={`token-dropdown-item ${(isCustom || isCustomToken || isCustomPlaceholder) ? 'selected' : ''}`}
              onClick={handleCustomSelect}
            >
              <span className="token-dropdown-item-icon">➕</span>
              <div className="token-dropdown-item-content">
                <div className="token-dropdown-item-symbol">Custom Token</div>
                <div className="token-dropdown-item-details">Enter ERC-20 address</div>
              </div>
              {(isCustom || isCustomToken || isCustomPlaceholder) && <span className="token-dropdown-check">✓</span>}
            </div>
          </div>
        )}
      </div>

      {selectedToken && !isCustomToken && (
        <div className="token-selector-info">
          <span className="token-selector-info-item">
            <strong>Symbol:</strong> {selectedToken.symbol}
          </span>
          <span className="token-selector-info-item">
            <strong>Decimals:</strong> {selectedToken.decimals}
          </span>
          {selectedToken.address && (
            <span className="token-selector-info-item token-selector-address">
              <strong>Address:</strong> {selectedToken.address.slice(0, 10)}...{selectedToken.address.slice(-8)}
            </span>
          )}
        </div>
      )}

      {(isCustom || isCustomToken || isCustomPlaceholder) && (
        <div style={{ marginTop: '0.75rem' }}>
          <label htmlFor="custom-token-input" className="token-selector-label">
            Custom Token Address <span style={{ color: '#dc3545' }}>*</span>
          </label>
          <input
            id="custom-token-input"
            type="text"
            placeholder="0x..."
            value={customAddress}
            onChange={handleCustomTokenChange}
            disabled={disabled}
            pattern="^0x[a-fA-F0-9]{40}$"
            title="Enter a valid Ethereum address (0x followed by 40 hex characters)"
            className="token-custom-input"
          />
          {customAddress && customAddress.startsWith('0x') && customAddress.length === 42 && (
            <div className="token-custom-success">
              ✓ Valid address (assuming 18 decimals)
            </div>
          )}
        </div>
      )}
    </div>
  );
}
