declare global {
  interface Window {
    google: any;
  }
}

// Minimal ambient types to satisfy google.maps usages in the project
declare namespace google {
  namespace maps {
    export type Map = any;
    export type MapOptions = any;
    export type Marker = any;
    export type TrafficLayer = any;
    export type MapMouseEvent = any;
    export type MapTypeId = any;
    export type DirectionsService = any;
    export type DirectionsRenderer = any;
    export type Geocoder = any;
    export type DistanceMatrixService = any;
    export type DirectionsStep = any;
    export type DistanceMatrixResponse = any;
    export type DirectionsStatus = any;
    export type DirectionsResult = any;
    export type LatLngBounds = any;
    export type LatLngLiteral = { lat: number; lng: number };
    export type Size = any;
    export type Point = any;
    export type InfoWindow = any;
    export enum TravelMode {
      DRIVING,
    }
  }
}

export {};
