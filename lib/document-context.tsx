import React, { createContext, useContext, useReducer, ReactNode } from "react";
import { DocumentMetadata } from "./file-manager";

export interface DocumentState {
  currentDocument: DocumentMetadata | null;
  currentPage: number;
  totalPages: number;
  zoom: number;
  isLoading: boolean;
  error: string | null;
  notes: Array<{
    id: string;
    page: number;
    text: string;
    x: number;
    y: number;
    createdAt: number;
  }>;
  croppedRegions: Array<{
    id: string;
    page: number;
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
}

export interface DocumentContextType {
  state: DocumentState;
  openDocument: (doc: DocumentMetadata, totalPages: number) => void;
  closeDocument: () => void;
  goToPage: (page: number) => void;
  setZoom: (zoom: number) => void;
  addNote: (page: number, text: string, x: number, y: number) => void;
  removeNote: (noteId: string) => void;
  addCroppedRegion: (page: number, x: number, y: number, width: number, height: number) => void;
  removeCroppedRegion: (regionId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

type DocumentAction =
  | { type: "OPEN_DOCUMENT"; payload: { doc: DocumentMetadata; totalPages: number } }
  | { type: "CLOSE_DOCUMENT" }
  | { type: "GO_TO_PAGE"; payload: number }
  | { type: "SET_ZOOM"; payload: number }
  | { type: "ADD_NOTE"; payload: { page: number; text: string; x: number; y: number } }
  | { type: "REMOVE_NOTE"; payload: string }
  | { type: "ADD_CROPPED_REGION"; payload: { page: number; x: number; y: number; width: number; height: number } }
  | { type: "REMOVE_CROPPED_REGION"; payload: string }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null };

const initialState: DocumentState = {
  currentDocument: null,
  currentPage: 1,
  totalPages: 0,
  zoom: 1,
  isLoading: false,
  error: null,
  notes: [],
  croppedRegions: [],
};

function documentReducer(state: DocumentState, action: DocumentAction): DocumentState {
  switch (action.type) {
    case "OPEN_DOCUMENT":
      return {
        ...state,
        currentDocument: action.payload.doc,
        totalPages: action.payload.totalPages,
        currentPage: 1,
        zoom: 1,
        notes: [],
        croppedRegions: [],
        error: null,
      };

    case "CLOSE_DOCUMENT":
      return initialState;

    case "GO_TO_PAGE":
      return {
        ...state,
        currentPage: Math.max(1, Math.min(action.payload, state.totalPages)),
      };

    case "SET_ZOOM":
      return {
        ...state,
        zoom: Math.max(0.5, Math.min(action.payload, 3)),
      };

    case "ADD_NOTE":
      return {
        ...state,
        notes: [
          ...state.notes,
          {
            id: `note_${Date.now()}`,
            page: action.payload.page,
            text: action.payload.text,
            x: action.payload.x,
            y: action.payload.y,
            createdAt: Date.now(),
          },
        ],
      };

    case "REMOVE_NOTE":
      return {
        ...state,
        notes: state.notes.filter((n) => n.id !== action.payload),
      };

    case "ADD_CROPPED_REGION":
      return {
        ...state,
        croppedRegions: [
          ...state.croppedRegions,
          {
            id: `crop_${Date.now()}`,
            page: action.payload.page,
            x: action.payload.x,
            y: action.payload.y,
            width: action.payload.width,
            height: action.payload.height,
          },
        ],
      };

    case "REMOVE_CROPPED_REGION":
      return {
        ...state,
        croppedRegions: state.croppedRegions.filter((r) => r.id !== action.payload),
      };

    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };

    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
      };

    default:
      return state;
  }
}

export function DocumentProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(documentReducer, initialState);

  const value: DocumentContextType = {
    state,
    openDocument: (doc, totalPages) =>
      dispatch({ type: "OPEN_DOCUMENT", payload: { doc, totalPages } }),
    closeDocument: () => dispatch({ type: "CLOSE_DOCUMENT" }),
    goToPage: (page) => dispatch({ type: "GO_TO_PAGE", payload: page }),
    setZoom: (zoom) => dispatch({ type: "SET_ZOOM", payload: zoom }),
    addNote: (page, text, x, y) =>
      dispatch({ type: "ADD_NOTE", payload: { page, text, x, y } }),
    removeNote: (noteId) => dispatch({ type: "REMOVE_NOTE", payload: noteId }),
    addCroppedRegion: (page, x, y, width, height) =>
      dispatch({ type: "ADD_CROPPED_REGION", payload: { page, x, y, width, height } }),
    removeCroppedRegion: (regionId) =>
      dispatch({ type: "REMOVE_CROPPED_REGION", payload: regionId }),
    setLoading: (loading) => dispatch({ type: "SET_LOADING", payload: loading }),
    setError: (error) => dispatch({ type: "SET_ERROR", payload: error }),
  };

  return <DocumentContext.Provider value={value}>{children}</DocumentContext.Provider>;
}

export function useDocument(): DocumentContextType {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error("useDocument must be used within DocumentProvider");
  }
  return context;
}
