/**
 * BOARD SAFETY & DIAGNOSTIC GATEKEEPER
 * Role: Provides high-integrity board manipulation utilities with integrated telemetry.
 * Integration: Acts as the primary safety layer for chess board state mutations, 
 * connecting to the system-wide diagnostic observability contract.
 */

import { Chess, Square } from 'chess.js';
import { validateBoardMutation } from './board-diagnostic-gatekeeper';

export const safeRemove = (board: Chess, square: Square): boolean => {
  const startTime = performance.now();
  try {
    const piece = board.get(square);
    if (piece?.type === 'k') return false;
    
    board.remove(square);
    
    validateBoardMutation('remove', square, true, performance.now() - startTime);
    return true;
  } catch (error) {
    validateBoardMutation('remove', square, false, performance.now() - startTime, error);
    return false;
  }
};

export const safePut = (board: Chess, piece: { type: string; color: string }, square: Square): boolean => {
  const startTime = performance.now();
  try {
    const existing = board.get(square);
    if (existing?.type === 'k') return false;
    
    board.put(piece as any, square);
    
    validateBoardMutation('put', square, true, performance.now() - startTime);
    return true;
  } catch (error) {
    validateBoardMutation('put', square, false, performance.now() - startTime, error);
    return false;
  }
};