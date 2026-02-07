export type ArtistType = "GROUP" | "SOLO";

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
      display_name: string;
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
