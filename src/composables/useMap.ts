// src/composables/useOpenStreetMap.ts
import { ref, onMounted, Ref } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw'; // Импортируем leaflet-draw

export function useMap(container: Ref<HTMLElement | null>) {
  const map: Ref<L.Map | null> = ref(null);
  const drawLayer: Ref<L.FeatureGroup | null> = ref(null);
  const drawControl: Ref<L.Control.Draw | null> = ref(null);
  const selectedArea = ref<{ name: string; lat: number; lng: number } | null>(null);

  // Состояние для поиска
  const searchQuery = ref('');
  const searchResults = ref<{ name: string; lat: number; lng: number }[]>([]);

  onMounted(() => {
    if (container.value) {
      map.value = L.map(container.value).setView([55.7558, 37.6176], 10);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map.value);

      drawLayer.value = L.featureGroup().addTo(map.value);

      drawControl.value = new L.Control.Draw({
        edit: {
          featureGroup: drawLayer.value
        },
        draw: {
          polygon: true,
          polyline: true,
          rectangle: true,
          circle: true,
          marker: true
        }
      }).addTo(map.value);

      map.value.on(L.Draw.Event.CREATED, (event: L.DrawEvents.Created) => {
        const layer = event.layer;
        drawLayer.value?.addLayer(layer);
      });

      map.value.invalidateSize();
    }
  });

  const searchLocationByValue = async (query: string) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      return data.map((result: any) => ({
        name: result.display_name,
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon)
      }));
    } catch (error) {
      console.error('Ошибка при поиске местоположения:', error);
      return [];
    }
  };

  const searchLocation = async () => {
    if (searchQuery.value.length > 2) {
      searchResults.value = await searchLocationByValue(searchQuery.value);
    } else {
      searchResults.value = [];
    }
  };

  const selectArea = (area: { name: string; lat: number; lng: number }) => {
    selectedArea.value = area;
    if (map.value) {
      map.value.setView([area.lat, area.lng], 13);
    }
    searchResults.value = [];
  };

  const addMarker = () => {
    if (map.value) {
      const center = map.value.getCenter();
      const marker = L.marker([center.lat, center.lng], {
        draggable: true
      }).addTo(map.value);

      marker.bindPopup('Новый маркер').openPopup();

      marker.on('dragend', (event: L.LeafletEvent) => {
        const marker = event.target as L.Marker;
        const position = marker.getLatLng();
        console.log('Маркер перемещён на:', position);
      });
    }
  };

  const saveRoute = () => {
    if (drawLayer.value && map.value) {
      const data = drawLayer.value.toGeoJSON();
      console.log('Сохранённый маршрут или фигура:', data);
      return data;
    }
    return null;
  };

  return {
    map,
    drawLayer,
    drawControl,
    selectedArea,
    searchQuery,
    searchResults,
    searchLocation,
    selectArea,
    addMarker,
    saveRoute
  };
}