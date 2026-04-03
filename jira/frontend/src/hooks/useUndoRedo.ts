import { useReducer, useCallback } from "react"

/**
 * useUndoRedo - Manages undo/redo history with useReducer.
 * Demonstrates: useReducer with complex state, discriminated union actions,
 *   immutable state transitions, useCallback
 * Use case: Undo task moves on the board, form editing history
 */

interface UndoRedoState<T> {
  past: T[]
  present: T
  future: T[]
}

type UndoRedoAction<T> =
  | { type: "SET"; payload: T }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "RESET"; payload: T }

function undoRedoReducer<T>(state: UndoRedoState<T>, action: UndoRedoAction<T>): UndoRedoState<T> {
  switch (action.type) {
    case "SET":
      return {
        past: [...state.past, state.present],
        present: action.payload,
        future: [],
      }
    case "UNDO": {
      if (state.past.length === 0) return state
      const previous = state.past[state.past.length - 1]
      return {
        past: state.past.slice(0, -1),
        present: previous,
        future: [state.present, ...state.future],
      }
    }
    case "REDO": {
      if (state.future.length === 0) return state
      const next = state.future[0]
      return {
        past: [...state.past, state.present],
        present: next,
        future: state.future.slice(1),
      }
    }
    case "RESET":
      return { past: [], present: action.payload, future: [] }
    default:
      return state
  }
}

export function useUndoRedo<T>(initialPresent: T) {
  const [state, dispatch] = useReducer(undoRedoReducer<T>, {
    past: [],
    present: initialPresent,
    future: [],
  })

  const set = useCallback((newPresent: T) => dispatch({ type: "SET", payload: newPresent }), [])
  const undo = useCallback(() => dispatch({ type: "UNDO" }), [])
  const redo = useCallback(() => dispatch({ type: "REDO" }), [])
  const reset = useCallback((newPresent: T) => dispatch({ type: "RESET", payload: newPresent }), [])

  return {
    state: state.present,
    set,
    undo,
    redo,
    reset,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
    pastLength: state.past.length,
    futureLength: state.future.length,
  }
}
