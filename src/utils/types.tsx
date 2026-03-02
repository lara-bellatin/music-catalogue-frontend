export type ArtistType = "solo" | "group";

export type VersionType =
  | "original"
  | "cover"
  | "remix"
  | "live"
  | "mashup"
  | "demo"
  | "radio_edit"
  | "acoustic"
  | "instrumental"
  | "a_cappella"
  | "extended"
  | "remaster"
  | "arrangement"
  | "transcription"
  | "excerpt"
  | "medley"
  | "other";

export type CompletenessLevel = "sparse" | "partial" | "complete";

export type EntityType =
  | "person"
  | "artist"
  | "work"
  | "version"
  | "release"
  | "media_item"
  | "credit"
  | "genre"
  | "performance";

export const ENTITY_TYPES: { label: string; value: EntityType }[] = [
  { label: "Person", value: "person" },
  { label: "Artist", value: "artist" },
  { label: "Work", value: "work" },
  { label: "Version", value: "version" },
  { label: "Release", value: "release" },
  { label: "Media Item", value: "media_item" },
  { label: "Credit", value: "credit" },
  { label: "Genre", value: "genre" },
  { label: "Performance", value: "performance" },
];

export type Version = {
  id: string;
  title: string;
  work?: {
    id: string;
    title: string;
    language?: string;
  };
  version_type: VersionType;
  based_on_version?: {
    id: string;
    title: string;
  };
  primary_artist: {
    id: string;
    name: string;
    artist_type: ArtistType;
  };
  release_date?: string;
  release_year?: number;
  duration_seconds?: number;
  bpm?: number;
  key_signature?: string;
  lyrics_reference?: string;
  completeness_level: CompletenessLevel;
  notes?: string;
  credits?: {
    artist?: {
      id: string;
      name: string;
      artist_type: ArtistType;
    };
    person?: {
      id: string;
      name: string;
    };
    role?: string;
    is_primary: boolean;
    credit_order?: number;
    instruments?: string[];
    notes?: string;
  }[];
  external_links?: {
    label: string;
    url: string;
    source_verified: boolean;
  }[];
  derived_versions?: {
    id: string;
    title: string;
    version_type: VersionType;
    primary_artist: {
      id: string;
      name: string;
    };
    release_year?: number;
  }[];
};

export type Artist = {
  id: string;
  person?: {
    id: string;
    name: string;
  };
  artist_type: ArtistType;
  display_name: string;
  sort_name?: string;
  alternative_names?: string[];
  start_year?: number;
  end_year?: number;
  members?: {
    id: string;
    person?: {
      id: string;
      name: string;
    };
    start_year?: number;
    end_year?: number;
    role?: string;
    notes?: string;
  }[];
  releases?: {
    id: string;
    title: string;
    release_year?: string;
    release_category: string;
    cover_art_url?: string;
  }[];
  versions?: {
    id: string;
    title: string;
    work: {
      id: string;
      title: string;
      language: string;
    };
    version_type: string;
    release_year: number;
  }[];
  credits?: {
    work?: {
      id: string;
      title: string;
      language: string;
    };
    version?: {
      id: string;
      title: string;
      version_type: string;
      primary_artist: {
        id: string;
        name: string;
        artist_type: ArtistType;
      };
      release_year: number;
    };
    role?: string;
    is_primary: boolean;
    credit_order?: number;
    instruments?: string[];
    notes?: string;
  }[];
  external_links?: {
    label: string;
    url: string;
    source_verified: boolean;
  }[];
};

export type Person = {
  id: string;
  legal_name: string;
  birth_date: string;
  death_date: string;
  pronouns: string;
  notes: string;
  artist?: {
    id: string;
    name: string;
    artist_type: ArtistType;
  };
  memberships?: {
    id: string;
    artist: {
      id: string;
      name: string;
      artist_type: ArtistType;
    };
    start_year: number;
    end_year: number;
    role: string;
    notes: string;
  }[];
  credits?: {
    work?: {
      id: string;
      title: string;
      language: string;
    };
    version?: {
      id: string;
      title: string;
      version_type: string;
      primary_artist: {
        id: string;
        name: string;
        artist_type: ArtistType;
      };
      release_year: number;
    };
    role?: string;
    is_primary: boolean;
    credit_order?: number;
    instruments?: string[];
    notes?: string;
  }[];
  external_links?: {
    label: string;
    url: string;
    source_verified: boolean;
  }[];
};

export type Work = {
  id: string;
  title: string;
  language?: string;
  titles?: {
    title: string;
    type: string;
    language: string;
  }[];
  description?: string;
  identifiers?: {
    label: string;
    value: string;
    url: string;
  }[];
  origin_year_start?: number;
  origin_year_end?: number;
  origin_country?: string;
  themes?: string[];
  sentiment?: string;
  notes?: string;
  versions?: {
    id: string;
    title: string;
    version_type?: string;
    primary_artist?: {
      id: string;
      name: string;
      artist_type: ArtistType;
    };
    release_year?: number;
    completeness_level?: string;
  }[];
  genres?: {
    id: string;
    name: string;
  }[];
  credits?: {
    artist?: {
      id: string;
      name: string;
      artist_type: ArtistType;
    };
    person?: {
      id: string;
      name: string;
    };
    role?: string;
    is_primary: boolean;
    credit_order?: number;
    instruments?: string[];
    notes?: string;
  }[];
  based_on_work?: {
    id: string;
    title: string;
  };
  derived_works?: {
    id: string;
    title: string;
    language?: string;
    origin_year_start?: number;
  }[];
  external_links?: {
    label: string;
    url: string;
    source_verified: boolean;
  }[];
};

export type Performance = {
  id: string;
  name: string;
  performance_date?: string;
  venue?: string;
  city?: string;
  country?: string;
  notes?: string;
  artists?: {
    role?: string;
    billing_order?: number;
    notes?: string;
    artist?: {
      id: string;
      name: string;
      artist_type: ArtistType;
    };
    person?: {
      id: string;
      name: string;
    };
  }[];
  works?: {
    set_order?: number;
    set_name?: string;
    notes?: string;
    work?: {
      id: string;
      title: string;
      language?: string;
    };
    version?: {
      id: string;
      title: string;
      version_type?: string;
      primary_artist?: {
        id: string;
        name: string;
      };
    };
  }[];
  external_links?: {
    label: string;
    url: string;
    source_verified: boolean;
  }[];
};

export type ReleaseMediaItem = {
  id: string;
  medium_type: string;
  format_name: string;
  platform_or_vendor?: string;
  bitrate_kbps?: number;
  sample_rate_hz?: number;
  bit_depth?: number;
  rpm?: number;
  channels?: string;
  packaging?: string;
  accessories?: string;
  pressing_details?: any;
  sku?: string;
  barcode?: string;
  catalog_variation?: string;
  availability_status: string;
  notes?: string;
};

export type ReleaseTrack = {
  id: string;
  version: {
    id: string;
    title: string;
    version_type: string;
    primary_artist: {
      id: string;
      name: string;
    };
    release_year?: number;
  };
  track_number: number;
  disc_number: number;
  side?: string;
  is_hidden: boolean;
  notes?: string;
};

export type Release = {
  id: string;
  title: string;
  release_date?: string;
  release_category: string;
  catalog_number?: string;
  publisher_number?: string;
  label?: string;
  region?: string;
  release_stage: string;
  cover_art_url?: string;
  total_discs: number;
  total_tracks: number;
  notes?: string;
  primary_artist?: {
    id: string;
    name: string;
    artist_type: ArtistType;
  };
  media_items?: ReleaseMediaItem[];
  tracks?: ReleaseTrack[];
  credits?: {
    artist?: {
      id: string;
      name: string;
      artist_type: ArtistType;
    };
    person?: {
      id: string;
      name: string;
    };
    role?: string;
    is_primary: boolean;
    credit_order?: number;
    instruments?: string[];
    notes?: string;
  }[];
  external_links?: {
    label: string;
    url: string;
    source_verified: boolean;
  }[];
};

export type SearchResult = {
  entity_type: EntityType;
  entity_id: string;
  display_text: string;
  secondary_text?: string;
  rank: number;
};

export type LineageVersionNode = {
  id: string;
  title: string;
  version_type: VersionType;
  primary_artist: { id: string; name: string };
  release_year?: number;
  workId?: string;
  based_on_version_id?: string;
  derived_version_ids: string[];
};

export type LineageWorkGroup = {
  id: string;
  title: string;
  language?: string;
  origin_year_start?: number;
  versionIds: string[];
  based_on_work_id?: string;
  derived_work_ids: string[];
};

export type LineageGraph = {
  versions: Map<string, LineageVersionNode>;
  works: Map<string, LineageWorkGroup>;
};
