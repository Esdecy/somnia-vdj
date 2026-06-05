/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TrackClip {
  id: string;
  name: string;
  start: number; // in seconds
  duration: number; // in seconds
}

export interface DreamTracks {
  visuals: TrackClip[];
  atmosphere: TrackClip[];
  lighting: TrackClip[];
}

export interface DreamDetails {
  entities: string[];
  entityTags: string[];
  spatialContext: string;
  spatialTags: string[];
  atmosphere: string;
  emotion: string;
  tags: string[];
  clarity: string; // e.g., "High Clarity", "Low Control"
  control: string;
}

export interface DreamVisuals {
  imageUrl: string;
  style: string; // Synthwave, Ghibli, Noir, Hyper-real
  refinePrompt: string;
  videoSequence: string;
}

export interface Dream {
  id: string;
  title: string;
  date: string; // Readable date like "Oct 24"
  timestamp: string; // Full ISO string
  text: string;
  voiceUrl?: string;
  duration: number; // Total duration in seconds (e.g. 45)
  visuals: DreamVisuals;
  details: DreamDetails;
  tracks: DreamTracks;
}
