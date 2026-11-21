import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { GaaContext } from './GaaState';
import { GAA_ENABLED, getGaaContext } from '../api/gaaApi';
import { errorMessage } from '../pages/Home/AgentAnalysis/agentResults';

export default function GaaProvider({ children }) {
  const { isAuthenticated, fullUser } = useAuth();
  const identity = isAuthenticated && fullUser ? `${fullUser.id}|${fullUser.organization_id ?? ''}` : '';
  const [state, setState] = useState({ identity: '', capabilities: null, loading: false, error: null });
  const epoch = useRef(0);
  const invalidate = useCallback(() => { ++epoch.current; }, []);
  const refresh = useCallback(async (signal) => {
    if (!GAA_ENABLED || !identity) return null;
    const ticket = ++epoch.current;
    setState({ identity, capabilities: null, loading: true, error: null });
    try {
      const value = await getGaaContext({ signal });
      if (!Array.isArray(value.perms) || !Array.isArray(value.denied_perms) || typeof value.sub !== 'string' || typeof value.org !== 'string') throw new Error('Invalid context');
      if (ticket !== epoch.current || signal?.aborted) return null;
      const capabilities = { ...value, perms: value.perms.filter(permission => !value.denied_perms.includes(permission)) };
      setState({ identity, capabilities, loading: false, error: null });
      return capabilities;
    } catch (error) {
      if (ticket === epoch.current && !signal?.aborted) setState({ identity, capabilities: null, loading: false, error: errorMessage(error) });
      return null;
    }
  }, [identity]);
  useEffect(() => {
    const controller = new AbortController();
    if (GAA_ENABLED && identity) refresh(controller.signal);
    return () => { invalidate(); controller.abort(); };
  }, [identity, refresh, invalidate]);
  const current = GAA_ENABLED && identity && state.identity === identity ? state : { capabilities: null, loading: Boolean(GAA_ENABLED && identity), error: null };
  return <GaaContext.Provider value={{ ...current, identity, enabled: GAA_ENABLED, refresh }}>{children}</GaaContext.Provider>;
}
