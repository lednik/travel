// src/composables/useMap.ts
import { Ref, onMounted } from 'vue';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';
import { debounce } from '@/common/utils/functions';
import { useMapStore } from '@/common/stores/map';

// Константы
const INITIAL_VIEW = [55.7558, 37.6176] as [number, number];
const INITIAL_ZOOM = 10;
const TILE_LAYER_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const TILE_LAYER_ATTRIBUTION = '© OpenStreetMap contributors';
const NOMINATIM_SEARCH_URL = 'https://nominatim.openstreetmap.org/search?format=json&q=';

export function useMap(container: Ref<HTMLElement | null>) {
  const store = useMapStore();
  let markerId = 0;

  // Инициализация карты
  const initializeMap = () => {
    if (container.value && !store.map) {
      const newMap = L.map(container.value, {
        zoomControl: false, // Отключаем стандартный контрол зума
        preferCanvas: true // Улучшаем производительность
      }).setView(INITIAL_VIEW, INITIAL_ZOOM);
      L.tileLayer(TILE_LAYER_URL, { attribution: TILE_LAYER_ATTRIBUTION }).addTo(newMap);
      
      store.setMap(newMap);
      initializeDrawLayer();
      newMap.invalidateSize();

      // Обработчик изменения размера окна
      window.addEventListener('resize', () => {
        newMap.invalidateSize();
      });
    }
  };

  // Инициализация слоя для рисования
  const initializeDrawLayer = () => {
    if (store.map) {
      const drawLayer = L.featureGroup().addTo(store.map);
      const drawControl = new L.Control.Draw({
        edit: { featureGroup: drawLayer },
        draw: { 
          polygon: true,
          polyline: true,
          rectangle: true,
          circle: true,
          marker: true 
        },
      }).addTo(store.map);

      store.setDrawLayer(drawLayer);
      store.setDrawControl(drawControl);

      store.map.on(L.Draw.Event.CREATED, (event: unknown) => {
        const createdEvent = event as L.Draw.Created;
        const layer = createdEvent.layer;
        drawLayer.addLayer(layer);
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
    if (store.searchQuery.length > 2) {
      store.searchResults = await searchLocationByValue(store.searchQuery);
    } else {
      store.searchResults = [];
    }
  };

  const debouncedSearchLocation = debounce(searchLocation, 300);

  // Выбор области
  const selectArea = (area: { name: string; lat: number; lng: number }) => {
    store.selectedArea = area;
    if (store.map) {
      store.map.setView([area.lat, area.lng], INITIAL_ZOOM);
    }
    store.searchResults = [];
  };

  // Обновление маршрутов
  const updateRoutes = () => {
    // Удаляем старые маршруты
    store.routes.forEach(route => route.remove());
    store.routes = [];

    if (store.map && store.markers.length > 1) {
      const waypoints = store.markers.map(m => L.latLng(m.lat, m.lng));
      
      const route = L.Routing.control({
        waypoints,
        router: L.Routing.osrmv1({
          serviceUrl: 'https://router.project-osrm.org/route/v1'
        }),
        routeWhileDragging: true,
        show: false,
        createMarker: () => null,
        useZoomParameter: true,
        fitSelectedRoutes: false,
        lineOptions: {
          addWaypoints: false,
          missingRouteTolerance: 0
        }
      }).addTo(store.map);

      const routeContainer = route.getContainer();
      if (routeContainer) {
        routeContainer.remove();
      }

      store.routes.push(route);
    }
  };

  // Добавление маркера
  const addMarker = () => {
    if (store.map) {
      const center = store.map.getCenter();
      const marker = L.marker([center.lat, center.lng], {
        draggable: true,
        riseOnHover: true
      }).addTo(store.map);

      const markerData = {
        id: markerId++,
        lat: center.lat,
        lng: center.lng,
        name: 'Новый маркер'
      };

      marker.bindPopup('Новый маркер').openPopup();
      store.markers.push(markerData);

      marker.on('dragend', (event: L.LeafletEvent) => {
        const marker = event.target as L.Marker;
        const position = marker.getLatLng();
        const index = store.markers.findIndex(m => m.id === markerData.id);
        
        if (index !== -1) {
          store.markers[index] = { 
            ...store.markers[index], 
            lat: position.lat, 
            lng: position.lng 
          };
        }

        if (store.map) {
          store.map.panTo(position);
          store.map.invalidateSize();
        }

        if (store.markers.length > 1) {
          updateRoutes();
        }
      });

      if (store.markers.length > 1) {
        updateRoutes();
      }
    }
  };

  // Сохранение маршрута
  const saveRoute = () => {
    if (store.drawLayer && store.map) {
      const data = store.drawLayer.toGeoJSON();
      console.log('Сохранённый маршрут или фигура:', data);
      return data;
    }
    return null;
  };

  // Инициализация при монтировании
  onMounted(() => {
    initializeMap();
  });

  return {
    addMarker,
    selectArea,
    saveRoute,
    debouncedSearchLocation,
    searchLocation,
    markers: store.markers,
    searchQuery: store.searchQuery,
    searchResults: store.searchResults,
    drawLayer: store.drawLayer,
    drawControl: store.drawControl,
    selectedArea: store.selectedArea
  };
}