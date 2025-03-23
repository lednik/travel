<template>
    <div class="route-create">
    <div class="map-wrapper">
        <div class="map-container" ref="mapContainer"></div>
    </div>
      <div class="controls">
        <div class="search-area">
            <input
            v-model="searchQuery"
            @input="searchLocation"
            placeholder="Введите область (город, улица, парк...)"
            />
            <ul v-if="searchResults.length > 0" class="search-results">
            <li
                v-for="result in searchResults"
                :key="result.name"
                @click="selectArea(result)"
            >
                {{ result.name }}
            </li>
            </ul>
        </div>
        <button @click="addMarker">Добавить точку</button>
        <button @click="saveRoute">Сохранить маршрут</button>
      </div>
    </div>
</template>
  
<script setup lang="ts">
    import {ref} from 'vue'
    import {useMap} from '@/composables/useMap'

    const mapContainer = ref<HTMLElement | null>(null)

    const {
        map,
        searchQuery,
        searchResults,
        searchLocation,
        selectArea,
        addMarker,
        saveRoute
    } = useMap(mapContainer);
</script>
  
  <style scoped lang="scss">
  .route-create {
    display: flex;
    flex-direction: column;
    height: 100vh;
  }

  .map-wrapper {
    width: 600px;
    height: 600px;
  }
  
  .map-container {
    width: 100%;
    height: 100%;
  }
  
  .controls {
    padding: use-variable("spacing", "md");
    background: use-variable("bg", "secondary");
    display: flex;
    gap: use-variable("spacing", "md");
    box-shadow: use-variable("shadow", "sm");
  
    button {
      padding: use-variable("spacing", "sm") use-variable("spacing", "md");
      background: use-variable("primary", "base");
      color: use-variable("text", "inverse");
      border: none;
      border-radius: use-variable("radius", "sm");
      cursor: pointer;
      transition: background use-variable("transition", "normal");
  
      &:hover {
        background: use-variable("primary", "dark");
      }
    }
  }
  </style>