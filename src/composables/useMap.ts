import { ref, onMounted, Ref } from 'vue';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';
import { debounce } from '@/common/utils/functions';

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

// Константы
const INITIAL_VIEW = [55.7558, 37.6176] as [number, number];
const INITIAL_ZOOM = 10;
const TILE_LAYER_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const TILE_LAYER_ATTRIBUTION = '© OpenStreetMap contributors';
const NOMINATIM_SEARCH_URL = 'https://nominatim.openstreetmap.org/search?format=json&q=';

export function useMap(container: Ref<HTMLElement | null>) {
  // Реактивные переменные
  const map = ref<L.Map | null>(null);
  const drawLayer = ref<L.FeatureGroup | null>(null);
  const drawControl = ref<L.Control.Draw | null>(null);
  const selectedArea = ref<{ name: string; lat: number; lng: number } | null>(null);
  const markers = ref<{ id: number; lat: number; lng: number; name: string }[]>([]);
  const searchQuery = ref('');
  const searchResults = ref<{ name: string; lat: number; lng: number }[]>([]);
  const routes = ref<L.Routing.Control[]>([]);
  let markerId = 0;

  // Инициализация карты
  const initializeMap = () => {
    if (container.value) {
      map.value = L.map(container.value).setView(INITIAL_VIEW, INITIAL_ZOOM);
      L.tileLayer(TILE_LAYER_URL, { attribution: TILE_LAYER_ATTRIBUTION }).addTo(map.value);
      initializeDrawLayer();
      map.value.invalidateSize();
    }
  };

  // Инициализация слоя для рисования
  const initializeDrawLayer = () => {
    if (map.value) {
      drawLayer.value = L.featureGroup().addTo(map.value);
      drawControl.value = new L.Control.Draw({
        edit: { featureGroup: drawLayer.value },
        draw: { polygon: true, polyline: true, rectangle: true, circle: true, marker: true },
      }).addTo(map.value);

      map.value.on(L.Draw.Event.CREATED, (event: unknown) => {
        const createdEvent = event as L.Draw.Created; // Приведение типа
        const layer = createdEvent.layer;
        drawLayer.value?.addLayer(layer);
      });
    }
  };

  // Поиск местоположения
  const searchLocationByValue = async (query: string) => {
    try {
      const response = await fetch(`${NOMINATIM_SEARCH_URL}${encodeURIComponent(query)}`);
      const data = await response.json();
      return data.map((result: any) => ({
        name: result.display_name,
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
      }));
    } catch (error) {
      console.error('Ошибка при поиске местоположения:', error);
      return [];
    }
  };

  // Поиск с debounce
  const searchLocation = async () => {
    if (searchQuery.value.length > 2) {
      searchResults.value = await searchLocationByValue(searchQuery.value);
    } else {
      searchResults.value = [];
    }
  };

  const debouncedSearchLocation = debounce(searchLocation, 300);

  // Выбор области
  const selectArea = (area: { name: string; lat: number; lng: number }) => {
    selectedArea.value = area;
    if (map.value) {
      map.value.setView([area.lat, area.lng], INITIAL_ZOOM);
    }
    searchResults.value = [];
  };

  const updateRoutes = () => {
    routes.value.forEach((route: L.Routing.Control) => route.remove()); // Удаляем старые маршруты
    routes.value.forEach((route: L.Routing.Control) => {
      route.remove(); // Удаляем маршрут с карты
    });
    routes.value = []; // Очищаем массив маршрутов

    if (map.value) {
      for (let i = 1; i < markers.value.length; i++) {
        const previousMarker = markers.value[i - 1];
        const currentMarker = markers.value[i];

        const route = L.Routing.control({
          createMarker: () => null,
          waypoints: [
            L.latLng(previousMarker.lat, previousMarker.lng),
            L.latLng(currentMarker.lat, currentMarker.lng),
          ],
          router: L.Routing.osrmv1({
            serviceUrl: 'https://router.project-osrm.org/route/v1', // Публичный OSRM
          }),
          useZoomParameter: true,
          routeWhileDragging: true,
          show: false, // Скрыть панель маршрута
        }).addTo(map.value);

        const routeContainer = route.getContainer();
        if (routeContainer) {
          routeContainer.remove();
        }

        routes.value.push(route);
      }
    }
  };

  // Добавление маркера
  const addMarker = () => {
    if (map.value) {
      const center = map.value.getCenter();
      const marker = L.marker([center.lat, center.lng], { draggable: true }).addTo(map.value);
      const markerData = { id: markerId++, lat: center.lat, lng: center.lng, name: 'Новый маркер' };

      marker.bindPopup('Новый маркер').openPopup();
      markers.value.push(markerData);

      if (markers.value.length > 1) {
        updateRoutes();
      }

      marker.on('dragend', (event: L.LeafletEvent) => {
        const marker = event.target as L.Marker;
        const position = marker.getLatLng();
        const markerIndex = markers.value.findIndex((item) => item.id === markerData.id);
        if (markerIndex !== -1) {
          markers.value.splice(markerIndex, 1, { ...markerData, lat: position.lat, lng: position.lng });
        }

        if (markers.value.length > 1) {
          updateRoutes();
        }
      });
    }
  };

  // Сохранение маршрута
  const saveRoute = () => {
    if (drawLayer.value && map.value) {
      const data = drawLayer.value.toGeoJSON();
      console.log('Сохранённый маршрут или фигура:', data);
      return data;
    }
    return null;
  };

  // Инициализация при монтировании
  onMounted(initializeMap);

  return {
    map,
    drawLayer,
    drawControl,
    selectedArea,
    searchQuery,
    searchResults,
    debouncedSearchLocation,
    selectArea,
    addMarker,
    saveRoute,
    markers,
  };
}