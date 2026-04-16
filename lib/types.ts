export type WorkflowKind = "festival" | "recent" | "history";
export type DestinationMode = "new" | "existing";

export interface PlaylistSummary {
  id: string;
  name: string;
  description: string | null;
  url: string;
}

export interface PlaylistDestinationInput {
  destinationMode: DestinationMode;
  existingPlaylistId?: string;
  newPlaylistName?: string;
  newPlaylistPublic: boolean;
}

export interface WorkflowResult {
  workflow: WorkflowKind;
  playlist: {
    id: string;
    name: string;
    url: string;
    isNew: boolean;
    visibility: "public" | "private";
  };
  counts: {
    candidates: number;
    matched: number;
    added: number;
    existing: number;
    skipped: number;
  };
  warnings: string[];
  details: {
    artistCount?: number;
    lineupUrl?: string;
    note?: string;
    unmatchedTracks?: Array<{
      artist: string;
      track: string;
    }>;
  };
}

export interface HistoryTrackRecord {
  artistName: string;
  trackName: string;
  endTime: string;
}

export interface PlaylistDestinationState {
  destinationMode: DestinationMode;
  existingPlaylistId: string;
  newPlaylistName: string;
  newPlaylistPublic: boolean;
}
