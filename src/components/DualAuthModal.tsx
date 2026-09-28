import React, { useState } from 'react';
import { validateTwoFactorAuth } from '../shared/schemas/index.ts';

interface DualAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (officerKeyId: string) => void;
  userRole: string;
  advisoryCode?: string;
  targetFootprint?: number;
}

export const DualAuthModal: React.FC<DualAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  userRole,
  advisoryCode = 'ADV-2025-089-REV2',
  targetFootprint = 184200,
}) => {
  const [pin, setPin] = useState('849201');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsVerifying(true);

    setTimeout(() => {
      const validation = validateTwoFactorAuth(pin, userRole);
      if (!validation.success) {
        setErrorMessage(validation.errors?.[0] || 'Verification failed');
        setIsVerifying(false);
      } else {
        setIsVerifying(false);
        onSuccess(validation.data!.officerKeyId);
        onClose();
      }
    }, 700);
  };

  return (
    <div className="fixed inset-0 bg-[#060e20]/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#222a3d] rounded-xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-4 relative border border-[#3198dc]/40 text-[#dae2fd]">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-[#2d3449]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#93ccff] text-[24px]">fingerprint</span>
            <h2 className="font-['Public_Sans'] text-lg font-bold text-white">
              Tactile 2FA Hardware Signing Station
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#89929b] hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Operational Context */}
        <div className="bg-[#060e20] p-3.5 rounded-lg flex flex-col gap-1.5 text-[11px] font-mono border border-[#3f4850]/40">
          <div className="flex justify-between">
            <span className="text-[#bfc7d2]">Statutory Authority:</span>
            <span className="text-[#6bd8cb] font-bold">DM Act 2005 (Sec 30/34)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#bfc7d2]">Advisory Digest:</span>
            <span className="text-[#93ccff] font-bold">{advisoryCode}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#bfc7d2]">Target Footprint:</span>
            <span className="text-white font-semibold">
              {targetFootprint.toLocaleString()} Citizens • Dhamra &amp; Basudevpur
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#bfc7d2]">Active Channels:</span>
            <span className="text-[#6bd8cb] font-bold">WEA, SMS Gateway, Sirens, WhatsApp</span>
          </div>
          <div className="flex justify-between pt-1 border-t border-[#171f33]">
            <span className="text-[#bfc7d2]">Signing Escrow:</span>
            <span className="text-[#ffb77d] font-bold">Quorum Verified (1 Officer Signed + Pin Challenge)</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label
              className="text-[11px] font-bold uppercase tracking-wider text-[#bfc7d2] flex items-center justify-between"
              htmlFor="pinInput"
            >
              <span>Commander Hardware Token / FIDO2 PIN</span>
              <span className="text-[#6bd8cb] font-mono text-[10px]">Active Role: {userRole}</span>
            </label>
            <input
              id="pinInput"
              type="password"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full bg-[#060e20] text-[#93ccff] font-mono text-xl tracking-[0.3em] text-center py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3198dc] border border-[#2d3449]"
              placeholder="••••••"
              autoFocus
            />
            {errorMessage && (
              <span className="text-xs text-[#ffb4ab] mt-1 font-mono">{errorMessage}</span>
            )}
            <div className="flex items-center justify-between text-[11px] font-mono text-[#bfc7d2] pt-1">
              <span className="text-[#6bd8cb] flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">key</span> Token Slot 1 Attested
              </span>
              <span className="text-[#89929b]">Fingerprint: 0x9B4F82E1CA73</span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="submit"
              disabled={isVerifying}
              className="flex-1 bg-gradient-to-r from-[#3198dc] to-[#0284c7] hover:brightness-110 text-white font-['Public_Sans'] font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-700/20 active:scale-[0.98] disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">verified</span>
              <span>{isVerifying ? 'Verifying Hardware Token...' : 'Cryptographically Sign & Dispatch'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-[#171f33] hover:bg-[#2d3449] text-[#bfc7d2] font-semibold py-2.5 px-4 rounded-lg text-xs"
            >
              Cancel
            </button>
          </div>
        </form>

        <span className="text-[10px] font-mono text-[#89929b] text-center">
          Simulated cryptographic handshake with National CAP Broadcast Ledger &amp; BigQuery Audit Stream
        </span>
      </div>
    </div>
  );
};
