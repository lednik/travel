// src/stores/map.ts
import { defineStore } from 'pinia';
import { shallowRef, ref } from 'vue';
import type { Map, FeatureGroup, Control } from 'leaflet';

export const useMapStore = defineStore('map', () => {
  // Состояние карты
  const map = shallowRef<Map>();
  const drawLayer = shallowRef<FeatureGroup>();
  const drawControl = shallowRef<Control.Draw>();

  // Данные маркеров и маршрутов
  const markers = ref<Array<{ id: number; lat: number; lng: number; name: string }>>([]);
  const routes = shallowRef<Routing.Control[]>([]);

  // Состояние поиска
  const searchQuery = ref('');
  const searchResults = ref<Array<{ name: string; lat: number; lng: number }>>([]);
  const selectedArea = ref<{ name: string; lat: number; lng: number } | null>(null);

  // Действия
  const setMap = (newMap: Map) => map.value = newMap;
  const setDrawLayer = (layer: FeatureGroup) => drawLayer.value = layer;
  const setDrawControl = (control: Control.Draw) => drawControl.value = control;

  return {
    map,
    drawLayer,
    drawControl,
    markers,
    routes,
    searchQuery,
    searchResults,
    selectedArea,
    setMap,
    setDrawLayer,
    setDrawControl
  };
});