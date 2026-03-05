<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "../i18n";

const props = defineProps<{ currentRoot?: string }>();
const emit = defineEmits<{ submit: [path: string] }>();
const pathInput = ref("");
const { t, locale } = useI18n();

const placeholder = computed(() => {
  if (props.currentRoot) return props.currentRoot;
  if (locale.value === "zh") {
    return "例如：C:\\Users\\xxx\\.codex\\skills 或 ~/.codex/skills";
  }
  return "e.g. C:\\Users\\you\\.codex\\skills or ~/.codex/skills";
});

function onSubmit() {
  const p = pathInput.value.trim();
  if (p) emit("submit", p);
}
</script>

<template>
  <div class="flex max-w-md flex-col gap-3 sm:flex-row">
    <input
      v-model="pathInput"
      type="text"
      class="min-w-0 flex-1 rounded-full border border-[var(--border-light)] bg-white px-4 py-2.5 text-[0.9rem] outline-none placeholder:text-[var(--ink-muted)] focus:border-[#c0c0c0]"
      :placeholder="placeholder"
      @keydown.enter="onSubmit"
    />
    <button
      type="button"
      class="shrink-0 rounded-full bg-[var(--accent)] px-5 py-2.5 text-[0.9rem] font-medium text-white transition-colors hover:opacity-90"
      @click="onSubmit"
    >
      {{ t("common.usePath") }}
    </button>
  </div>
</template>
