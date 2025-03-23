// src/stores/map.ts
import { defineStore } from 'pinia';
import { shallowRef, ref } from 'vue';
import type { Map, FeatureGroup, Control } from 'leaflet';
import type { Coords } from '@/common/composables/useMap';


interface Marker {
  id: number
  lat: number
  lng: number
  name: string 
}

export const useMapStore = defineStore('map', () => {
  // Состояние карты
  const map = shallowRef<Map>();
  const drawLayer = shallowRef<FeatureGroup>();
  const drawControl = shallowRef<Control.Draw>();
  const routes = shallowRef<Routing.Control[]>([]);

  // Данные маркеров и маршрутов
  const markers = ref<Marker[]>([]);

  // Состояние поиска
  const searchQuery = ref('');
  const searchResults = ref<Array<{ name: string; lat: number; lng: number }>>([]);
  const selectedArea = ref<{ name: string; lat: number; lng: number } | null>(null);

  // Действия
  const setMap = (newMap: Map) => map.value = newMap;
  const setDrawLayer = (layer: FeatureGroup) => drawLayer.value = layer;
  const clearRoutes = () => routes.value = []
  const setDrawControl = (control: Control.Draw) => drawControl.value = control;
  const addMarker = (markerData: Marker) => {
    if (markers.value.findIndex(m => m.id === markerData.id) === -1) {
      markers.value.push(markerData)
    }
  }
  const changeMarker = (markerData: Marker, {lat, lng} : Coords) => {
    const index = markers.value.findIndex(m => m.id === markerData.id);
    if (index !== -1) {
      markers.value[index] = {
        ...markers.value[index],
        lat,
        lng,
      }
    }
  }

  return {
    map,
    drawLayer,
    drawControl,
    markers,
    searchQuery,
    searchResults,
    selectedArea,
    routes,
    addMarker,
    clearRoutes,
    changeMarker,
    setMap,
    setDrawLayer,
    setDrawControl
  };
});