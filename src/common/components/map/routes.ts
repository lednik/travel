import L from 'leaflet';
import { useMapStore } from '@/common/stores/map';
const store = useMapStore();

const ROUTE_OPTIONS = {
    router: L.Routing.osrmv1({
      serviceUrl: 'https://router.project-osrm.org/route/v1'
    }),
    routeWhileDragging: true,
    show: false,
    createMarker: () => null,
    useZoomParameter: true,
    fitSelectedRoutes: false,
    // lineOptions: {
    //   addWaypoints: false,
    //   missingRouteTolerance: 0
    // }
}

export const updateRoute = () => {
    store.clearRoute()

    if (!store.map || store.markers.length < 2) return

    const waypoints = store.markers.map(m => L.latLng(m.lat, m.lng));

    const route = createRoute(waypoints)
    store.setRoute(route)
};

const createRoute = (waypoints: L.LatLng[]) => {
    const route =  L.Routing.control({
        ...ROUTE_OPTIONS,
        waypoints
    }).addTo(store.map!)
    route.getContainer()?.remove()
    return route
}
