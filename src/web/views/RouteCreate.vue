<template>
    <div class="route-create">
      <div class="map-wrapper">
        <div class="map-container" ref="mapContainer"></div>
      </div>
        <div class="controls">
          <div class="search-area">
              <input
                class="input"
                v-model="searchQuery"
                @input="debouncedSearchLocation"
                placeholder="Введите область (город, улица, парк...)"
              />
              <ul v-if="searchResults.length" class="search-results">
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
          <ul v-if="markers.length" class="search-results">
                <li
                    v-for="(item, index) in markers"
                    :key="'marker' + index"
                >
                  Маркер {{ index + 1 }}: {{ item.lat.toFixed(4) }}, {{ item.lng.toFixed(4) }}
                </li>
              </ul>
        </div>
    </div>
</template>
  
<script setup lang="ts">
    import {ref} from 'vue'
    import {useMap} from '@/common/components/map'
    const mapContainer = ref<HTMLElement | null>(null)


    const {
        searchQuery,
        searchResults,
        debouncedSearchLocation,
        selectArea,
        addMarker,
        saveRoute,
        markers
    } = useMap(mapContainer);
</script>
  
  <style scoped lang="scss">
  .leaflet-marker-icon {
    position: absolute;
  }
  .route-create {
    display: flex;
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

  .input {
    width: 500px;
  }
  
  .controls {
    padding: use-variable("spacing", "md");
    background: use-variable("bg", "secondary");
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: use-variable("spacing", "md");
    box-shadow: use-variable("shadow", "sm");
  
    button {
      display: flex;
      padding: use-variable("spacing", "sm") use-variable("spacing", "md");
      background: use-variable("bg", "inverse");
      color: use-variable("text", "inverse");
      border: none;
      border-radius: use-variable("radius", "sm");
      cursor: pointer;
      transition: background use-variable("transition", "normal");
    }
  }
  </style>