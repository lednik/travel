// src/composables/useMap.ts
import { Ref, onMounted } from 'vue';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';
import { debounce } from '@/common/utils/functions';
import { useMapStore } from '@/common/stores/map';
import {updateRoute} from './routes'

// Константы
const NOMINATIM_SEARCH_URL = 'https://nominatim.openstreetmap.org/search?format=json&q=';

export interface Coords {
  lat: number
  lng: number
}

const MAP_CONFIG = {
  options: {
    zoomControl: false, // Отключаем стандартный контрол зума
    preferCanvas: true // Улучшаем производительность
  },
  initialView: [55.7558, 37.6176] as [number, number],
  initialZoom: 10,
  tileLayer: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap contributors'
  },
  routing: {
    serviceUrl: 'https://router.project-osrm.org/route/v1',
    routingOptions: {
      routeWhileDragging: true,
      show: false,
      fitSelectedRoutes: false,
      lineOptions: {
        addWaypoints: false,
        missingRouteTolerance: 0
      }
    }
  }
};

export function useMap(container: Ref<HTMLElement | null>) {
  const store = useMapStore();
  let markerId = 0;

  const createMap = () => {
    if (container.value) {
      const map = L.map(container.value, MAP_CONFIG.options)
        .setView(MAP_CONFIG.initialView, MAP_CONFIG.initialZoom);
      store.setMap(map);

      L.tileLayer(MAP_CONFIG.tileLayer.url, {attribution: MAP_CONFIG.tileLayer.attribution}).addTo(map);
      
      initializeDrawLayer();
      map.invalidateSize();

      // Обработчик изменения размера окна
      window.addEventListener('resize', () => {
        map.invalidateSize();
      });
    }
  }

  const restoreMap = () => {
    if (!container.value || !store.map) return
    createMap()

    store.markers.forEach(item => {
      createMarker({
        lat: item.lat,
        lng: item.lng
      })
    })
  }

  // Инициализация карты
  const initializeMap = () => {
    if (!store.map) {
      createMap()
      return
    }
    restoreMap()
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

  const searchLocation = async () => {
    if (store.searchQuery.length > 2) {
      store.searchResults = await searchLocationByValue(store.searchQuery)
    } else {
      store.searchResults = []
    }
  };

  const debouncedSearchLocation = debounce(searchLocation, 300)

  // Выбор области
  const selectArea = (area: { name: string; lat: number; lng: number }) => {
    store.selectedArea = area;
    if (store.map) {
      store.map.setView([area.lat, area.lng], MAP_CONFIG.initialZoom);
    }
    store.searchResults = [];
  };

  const createMarkerElement = ({lat, lng} : Coords) => {
    return L.marker([lat, lng], { 
      draggable: true,
      riseOnHover: true 
    }).addTo(store.map!).openPopup();
  };

  const createMarker = ({lat, lng} : Coords) => {
    if (store.map) {
      const marker = createMarkerElement({lat, lng})
      const markerData = {id: markerId++, lat, lng, };
      store.addMarker(markerData)
  
      // Обработчик перемещения маркера
      marker.on('dragend', (event: L.LeafletEvent) => {
        const updatedMarker = event.target as L.Marker;
        const newPosition = updatedMarker.getLatLng();

        store.changeMarker(markerData, {lat: newPosition.lat, lng: newPosition.lng})

        updateRoute();

        store.map?.panTo(newPosition, { animate: true, duration: 0.5 });
      });

      updateRoute();
    }
  }

  // Добавление маркера
  const addMarker = () => {
    if (store.map) {
      const center = store.map.getCenter();
      createMarker({lat: center.lat, lng: center.lng})
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