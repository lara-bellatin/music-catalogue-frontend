export type ArtistType = "GROUP" | "SOLO";

export type VersionType =
  | "ORIGINAL"
  | "COVER"
  | "REMIX"
  | "LIVE"
  | "ACOUSTIC"
  | "INSTRUMENTAL"
  | "DEMO"
  | "REMASTER"
  | "RADIO_EDIT"
  | "EXTENDED"
  | "ALTERNATE";

export type CompletenessLevel = "COMPLETE" | "PARTIAL" | "FRAGMENT";

export type EntityType =
  | "artist"
  | "person"
  | "version"
  | "work"
  | "performance";

export const ENTITY_TYPES: { label: string; value: EntityType }[] = [
  { label: "Artist", value: "artist" },
  { label: "Person", value: "person" },
  { label: "Version", value: "version" },
  { label: "Work", value: "work" },
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
      artist: string;
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

export type SearchResult = {
  entity_type: EntityType;
  entity_id: string;
  display_text: string;
  secondary_text?: string;
  rank: number;
};
