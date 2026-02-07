import { useState, useEffect } from 'react';

export const useEarlyAccess = () => {
  // 🚀 LIVE MODE: Everyone has access now!
  const [hasAccess] = useState(true);
  const [isLoading] = useState(false);

  const grantAccess = (token: string, expiresAt: string) => {
    // No-op: Everyone already has access
  };

  const revokeAccess = () => {
    // No-op: Everyone already has access
  };

  return { hasAccess, isLoading, grantAccess, revokeAccess };
};
