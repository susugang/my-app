import React from "react";
import { View, Text, FlatList, TouchableOpacity, ScrollView } from "react-native";
import { Note } from "@/lib/notes-manager";

interface NotesListProps {
  notes: Note[];
  onEditNote?: (note: Note) => void;
  onDeleteNote?: (noteId: string) => void;
  onClose?: () => void;
}

export function NotesList({
  notes,
  onEditNote,
  onDeleteNote,
  onClose,
}: NotesListProps) {
  if (notes.length === 0) {
    return (
      <View className="bg-surface rounded-lg p-4 items-center">
        <Text className="text-muted">이 페이지에 메모가 없습니다.</Text>
      </View>
    );
  }

  return (
    <ScrollView className="max-h-64 bg-surface rounded-lg">
      {notes.map((note, index) => (
        <View
          key={note.id}
          className={`p-4 border-b border-border ${
            index === notes.length - 1 ? "border-b-0" : ""
          }`}
        >
          <View className="flex-row items-start justify-between mb-2">
            <Text className="text-xs text-muted flex-1">
              {new Date(note.createdAt).toLocaleString("ko-KR")}
            </Text>
            <View className="flex-row gap-2">
              {onEditNote && (
                <TouchableOpacity
                  onPress={() => onEditNote(note)}
                  className="active:opacity-70"
                >
                  <Text className="text-primary text-sm font-semibold">수정</Text>
                </TouchableOpacity>
              )}
              {onDeleteNote && (
                <TouchableOpacity
                  onPress={() => onDeleteNote(note.id)}
                  className="active:opacity-70"
                >
                  <Text className="text-error text-sm font-semibold">삭제</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
          <Text className="text-foreground text-sm leading-relaxed">{note.text}</Text>
        </View>
      ))}
    </ScrollView>
  );
}
