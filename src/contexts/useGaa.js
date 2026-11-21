import { useContext } from 'react';
import { GaaContext } from './GaaState';
export function useGaa() { return useContext(GaaContext); }
