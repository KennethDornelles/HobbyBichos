/**
 * Tipos para Google Maps Platform APIs
 */

// ============= PLACES API (Nearby Search) =============
export interface PlacesLocation {
  lat: number;
  lng: number;
}

export interface PlaceOpeningHours {
  open_now: boolean;
  weekday_text?: string[];
}

export interface PlacesPhoto {
  height: number;
  html_attributions: string[];
  photo_reference: string;
  width: number;
}

export interface NearbyPlace {
  business_status?: string;
  geometry: {
    location: PlacesLocation;
    viewport?: {
      northeast: PlacesLocation;
      southwest: PlacesLocation;
    };
  };
  icon?: string;
  icon_mask_base_uri?: string;
  icon_background_color?: string;
  name: string;
  opening_hours?: PlaceOpeningHours;
  photos?: PlacesPhoto[];
  place_id: string;
  plus_code?: {
    compound_code: string;
    global_code: string;
  };
  types: string[];
  formatted_address?: string;
  rating?: number;
  user_ratings_total?: number;
}

export interface NearbySearchResponse {
  results: NearbyPlace[];
  status: 'OK' | 'ZERO_RESULTS' | 'INVALID_REQUEST' | 'OVER_QUERY_LIMIT' | 'REQUEST_DENIED' | 'UNKNOWN_ERROR';
  next_page_token?: string;
  error_message?: string;
}

// ============= DISTANCE MATRIX API =============
export interface DistanceMatrixElement {
  distance: {
    text: string;
    value: number; // metros
  };
  duration: {
    text: string;
    value: number; // segundos
  };
  status: string;
}

export interface DistanceMatrixRow {
  elements: DistanceMatrixElement[];
}

export interface DistanceMatrixResponse {
  destination_addresses: string[];
  origin_addresses: string[];
  rows: DistanceMatrixRow[];
  status: 'OK' | 'INVALID_REQUEST' | 'MAX_ELEMENTS_EXCEEDED' | 'OVER_QUERY_LIMIT' | 'REQUEST_DENIED' | 'UNKNOWN_ERROR';
  error_message?: string;
}

// ============= DIRECTIONS API =============
export interface Leg {
  distance: {
    text: string;
    value: number;
  };
  duration: {
    text: string;
    value: number;
  };
  end_address: string;
  end_location: PlacesLocation;
  start_address: string;
  start_location: PlacesLocation;
  steps: Step[];
}

export interface Step {
  distance: {
    text: string;
    value: number;
  };
  duration: {
    text: string;
    value: number;
  };
  end_location: PlacesLocation;
  html_instructions: string;
  maneuver?: string;
  polyline: {
    points: string;
  };
  start_location: PlacesLocation;
  travel_mode: string;
}

export interface Route {
  bounds: {
    northeast: PlacesLocation;
    southwest: PlacesLocation;
  };
  copyrights: string;
  legs: Leg[];
  overview_polyline: {
    points: string;
  };
  summary: string;
  warnings: string[];
  waypoint_order: number[];
}

export interface DirectionsResponse {
  routes: Route[];
  status: 'OK' | 'NOT_FOUND' | 'ZERO_RESULTS' | 'MAX_WAYPOINTS_EXCEEDED' | 'INVALID_REQUEST' | 'OVER_QUERY_LIMIT' | 'REQUEST_DENIED' | 'UNKNOWN_ERROR';
  error_message?: string;
}

// ============= PET SHOP ESPECÍFICO =============
export interface PetShop {
  id: string;
  name: string;
  place_id: string;
  latitude: number;
  longitude: number;
  address: string;
  distance: string; // ex: "1.2 km"
  distance_meters: number;
  duration: string; // ex: "5 mins"
  duration_seconds: number;
  rating?: number;
  user_ratings_total?: number;
  phone?: string;
  icon?: string;
}

export interface NearbyPetShopsResult {
  shops: PetShop[];
  userLocation: PlacesLocation;
  totalResults: number;
}

// ============= ENTREGA (DELIVERY TRACKING) =============
export interface DeliveryRoute {
  destination_name: string;
  destination_address: string;
  destination_lat: number;
  destination_lng: number;
  origin_lat: number;
  origin_lng: number;
  polyline: string; // polyline codificado
  distance_meters: number;
  distance_text: string;
  duration_seconds: number;
  duration_text: string;
}

export interface DriverLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
}

// ============= ERROS =============
export interface GoogleMapsError {
  status: string;
  error_message?: string;
  type: 'PLACES_API' | 'DISTANCE_MATRIX' | 'DIRECTIONS_API' | 'LOCATION_ERROR' | 'UNKNOWN';
}
