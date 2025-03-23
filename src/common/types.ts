import L from 'leaflet';

declare module 'leaflet' {
  namespace Control {
    class Draw extends L.Control {
      constructor(options?: any);
    }
  }
  namespace Draw {
    interface DrawEvents {
      CREATED: string;
    }

    interface Created extends L.Events {
      layer: L.Layer;
    }

    const Event: DrawEvents;
  }

  namespace Routing {
    interface RoutingControlOptions {
      createMarker?: (waypointIndex: number, waypoint: Waypoint, numberOfWaypoints: number) => L.Marker | null;
    }
  }
}

export interface Route {
    id: number
    title: string
    points: Array<{
      lat: number
      lng: number
    }>
  }
  
  // Тип для состояния хранилища
  export interface RouteStoreState {
    currentRoute: Route | null
    savedRoutes: Route[]
  }