import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Note {
  id: string;
  documentId: string;
  page: number;
  text: string;
  x: number;
  y: number;
  createdAt: number;
  updatedAt: number;
}

const NOTES_PREFIX = "notes_";

/**
 * 문서의 모든 메모 조회
 */
export async function getNotes(documentId: string): Promise<Note[]> {
  try {
    const key = `${NOTES_PREFIX}${documentId}`;
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to get notes:", error);
    return [];
  }
}

/**
 * 메모 추가
 */
export async function addNote(
  documentId: string,
  page: number,
  text: string,
  x: number,
  y: number
): Promise<Note> {
  try {
    const notes = await getNotes(documentId);
    const newNote: Note = {
      id: `note_${Date.now()}`,
      documentId,
      page,
      text,
      x,
      y,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    notes.push(newNote);
    const key = `${NOTES_PREFIX}${documentId}`;
    await AsyncStorage.setItem(key, JSON.stringify(notes));

    return newNote;
  } catch (error) {
    console.error("Failed to add note:", error);
    throw error;
  }
}

/**
 * 메모 업데이트
 */
export async function updateNote(
  documentId: string,
  noteId: string,
  text: string
): Promise<Note | null> {
  try {
    const notes = await getNotes(documentId);
    const noteIndex = notes.findIndex((n) => n.id === noteId);

    if (noteIndex === -1) return null;

    notes[noteIndex].text = text;
    notes[noteIndex].updatedAt = Date.now();

    const key = `${NOTES_PREFIX}${documentId}`;
    await AsyncStorage.setItem(key, JSON.stringify(notes));

    return notes[noteIndex];
  } catch (error) {
    console.error("Failed to update note:", error);
    throw error;
  }
}

/**
 * 메모 삭제
 */
export async function deleteNote(documentId: string, noteId: string): Promise<void> {
  try {
    const notes = await getNotes(documentId);
    const filtered = notes.filter((n) => n.id !== noteId);

    const key = `${NOTES_PREFIX}${documentId}`;
    await AsyncStorage.setItem(key, JSON.stringify(filtered));
  } catch (error) {
    console.error("Failed to delete note:", error);
    throw error;
  }
}

/**
 * 특정 페이지의 메모 조회
 */
export async function getNotesByPage(
  documentId: string,
  page: number
): Promise<Note[]> {
  try {
    const notes = await getNotes(documentId);
    return notes.filter((n) => n.page === page);
  } catch (error) {
    console.error("Failed to get notes by page:", error);
    return [];
  }
}

/**
 * 모든 메모 삭제
 */
export async function deleteAllNotes(documentId: string): Promise<void> {
  try {
    const key = `${NOTES_PREFIX}${documentId}`;
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error("Failed to delete all notes:", error);
    throw error;
  }
}
