<template>
     <div class="card">
      <h2 class="title">Заголовок</h2>
      <p class="description">Описание</p>
    </div>
</template>

<style lang="scss">
.card {
  background: use-variable("bg", "base");
  border: 1px solid use-variable("border", "base");
  padding: use-variable("spacing", "md");
  border-radius: use-variable("radius", "md");
  box-shadow: use-variable("shadow", "sm");
  transition: 
    background use-variable("transition", "normal"),
    box-shadow use-variable("transition", "normal");

  &:hover {
    box-shadow: use-variable("shadow", "md");
  }
}

.title {
  color: use-variable("text", "primary");
  font-size: use-variable("font", "size-lg");
  font-weight: use-variable("font", "weight-bold");
  margin-bottom: use-variable("spacing", "sm");
}

.description {
  color: use-variable("text", "secondary");
  font-size: use-variable("font", "size-base");
  line-height: 1.5;
}
</style>