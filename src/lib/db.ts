import Dexie, { Table } from 'dexie';
import { Track, Playlist } from '../types';

export class EmityDatabase extends Dexie {
  tracks!: Table<Track>;
  playlists!: Table<Playlist>;
  favorites!: Table<Track>;
  history!: Table<Track & { playedAt: number }>;

  constructor() {
    super('EmityDB');
    this.version(1).stores({
      tracks: 'id, title, artist',
      playlists: 'id, name',
      favorites: 'id, title, artist',
      history: '++autoId, id, playedAt'
    });
  }
}

export const db = new EmityDatabase();
