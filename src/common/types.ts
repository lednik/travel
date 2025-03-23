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