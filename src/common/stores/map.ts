// src/stores/map.ts
import { defineStore } from 'pinia';
import { shallowRef, ref } from 'vue';
import L from 'leaflet';
import type { Map, FeatureGroup, Control } from 'leaflet';
import type { Coords } from '@/common/components/map';


interface Marker {
  id: number
  lat: number
  lng: number
}

export const useMapStore = defineStore('map', () => {
  // Состояние карты
  const map = shallowRef<Map>();
  const drawLayer = shallowRef<FeatureGroup>();
  const drawControl = shallowRef<Control.Draw>();
  const route = shallowRef<L.Routing.Control | null>(null);

  // Данные маркеров и маршрутов
  const markers = ref<Marker[]>([]);

  // Состояние поиска
  const searchQuery = ref('');
  const searchResults = ref<Array<{ name: string; lat: number; lng: number }>>([]);
  const selectedArea = ref<{ name: string; lat: number; lng: number } | null>(null);

  // Действия
  const setMap = (newMap: Map) => map.value = newMap;
  const setDrawLayer = (layer: FeatureGroup) => drawLayer.value = layer;
  const setRoute = (value:  L.Routing.Control) => route.value = value
  const clearRoute = () => {
    route.value?.remove()
    route.value = null
  }
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
    route,
    addMarker,
    setRoute,
    clearRoute,
    changeMarker,
    setMap,
    setDrawLayer,
    setDrawControl
  };
});