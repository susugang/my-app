import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  addNote,
  deleteNote,
  getNotes,
  getNotesByPage,
  updateNote,
  deleteAllNotes,
} from "../notes-manager";

// AsyncStorage 모킹
vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  },
}));

describe("Notes Manager", () => {
  const mockDocumentId = "test-doc-123";
  const mockAsyncStorage = AsyncStorage as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("addNote", () => {
    it("should add a note successfully", async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);
      mockAsyncStorage.setItem.mockResolvedValue(undefined);

      const note = await addNote(mockDocumentId, 1, "Test note", 10, 20);

      expect(note).toBeDefined();
      expect(note.text).toBe("Test note");
      expect(note.page).toBe(1);
      expect(note.x).toBe(10);
      expect(note.y).toBe(20);
      expect(mockAsyncStorage.setItem).toHaveBeenCalled();
    });

    it("should add multiple notes to the same document", async () => {
      const existingNotes = JSON.stringify([
        {
          id: "note_1",
          documentId: mockDocumentId,
          page: 1,
          text: "First note",
          x: 0,
          y: 0,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ]);

      mockAsyncStorage.getItem.mockResolvedValue(existingNotes);
      mockAsyncStorage.setItem.mockResolvedValue(undefined);

      const note = await addNote(mockDocumentId, 2, "Second note", 5, 15);

      expect(note.text).toBe("Second note");
      expect(mockAsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  describe("getNotes", () => {
    it("should return empty array when no notes exist", async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const notes = await getNotes(mockDocumentId);

      expect(notes).toEqual([]);
    });

    it("should return all notes for a document", async () => {
      const mockNotes = [
        {
          id: "note_1",
          documentId: mockDocumentId,
          page: 1,
          text: "Note 1",
          x: 0,
          y: 0,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: "note_2",
          documentId: mockDocumentId,
          page: 2,
          text: "Note 2",
          x: 10,
          y: 20,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockNotes));

      const notes = await getNotes(mockDocumentId);

      expect(notes).toHaveLength(2);
      expect(notes[0].text).toBe("Note 1");
      expect(notes[1].text).toBe("Note 2");
    });
  });

  describe("getNotesByPage", () => {
    it("should return notes for a specific page", async () => {
      const mockNotes = [
        {
          id: "note_1",
          documentId: mockDocumentId,
          page: 1,
          text: "Note 1",
          x: 0,
          y: 0,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: "note_2",
          documentId: mockDocumentId,
          page: 1,
          text: "Note 2",
          x: 10,
          y: 20,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: "note_3",
          documentId: mockDocumentId,
          page: 2,
          text: "Note 3",
          x: 5,
          y: 15,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockNotes));

      const pageNotes = await getNotesByPage(mockDocumentId, 1);

      expect(pageNotes).toHaveLength(2);
      expect(pageNotes.every((n) => n.page === 1)).toBe(true);
    });
  });

  describe("updateNote", () => {
    it("should update a note successfully", async () => {
      const mockNotes = [
        {
          id: "note_1",
          documentId: mockDocumentId,
          page: 1,
          text: "Original text",
          x: 0,
          y: 0,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockNotes));
      mockAsyncStorage.setItem.mockResolvedValue(undefined);

      const updatedNote = await updateNote(mockDocumentId, "note_1", "Updated text");

      expect(updatedNote).toBeDefined();
      expect(updatedNote?.text).toBe("Updated text");
      expect(mockAsyncStorage.setItem).toHaveBeenCalled();
    });

    it("should return null if note not found", async () => {
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify([]));

      const result = await updateNote(mockDocumentId, "nonexistent", "Text");

      expect(result).toBeNull();
    });
  });

  describe("deleteNote", () => {
    it("should delete a note successfully", async () => {
      const mockNotes = [
        {
          id: "note_1",
          documentId: mockDocumentId,
          page: 1,
          text: "Note 1",
          x: 0,
          y: 0,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: "note_2",
          documentId: mockDocumentId,
          page: 1,
          text: "Note 2",
          x: 10,
          y: 20,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockNotes));
      mockAsyncStorage.setItem.mockResolvedValue(undefined);

      await deleteNote(mockDocumentId, "note_1");

      expect(mockAsyncStorage.setItem).toHaveBeenCalled();
      const callArgs = mockAsyncStorage.setItem.mock.calls[0];
      const savedNotes = JSON.parse(callArgs[1]);
      expect(savedNotes).toHaveLength(1);
      expect(savedNotes[0].id).toBe("note_2");
    });
  });

  describe("deleteAllNotes", () => {
    it("should delete all notes for a document", async () => {
      mockAsyncStorage.removeItem.mockResolvedValue(undefined);

      await deleteAllNotes(mockDocumentId);

      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith(
        `notes_${mockDocumentId}`
      );
    });
  });
});
