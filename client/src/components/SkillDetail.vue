<script setup lang="ts">
import { computed } from "vue";
import type { SkillMeta } from "../App.vue";
import { renderMarkdown } from "../utils/markdown";

const props = defineProps<{ skill: SkillMeta }>();
const emit = defineEmits<{ close: [] }>();

const rawHtml = computed(() =>
  props.skill.raw ? renderMarkdown(props.skill.raw) : ""
);
</script>

<template>
  <div
    class="fixed inset-0 z-[100] flex items-center justify-center bg-overlay p-4"
    @click.self="emit('close')"
  >
    <div
      class="max-h-[85vh] w-full max-w-xl overflow-auto rounded-card border border-border bg-surface-elevated p-5 shadow-modal"
    >
      <div class="mb-4 flex items-start justify-between gap-4">
        <h2 class="text-lg font-semibold text-slate-900">
          {{ skill.name }}
        </h2>
        <button
          type="button"
          class="shrink-0 rounded p-1 text-2xl leading-none text-muted transition-colors hover:bg-surface-muted hover:text-slate-900"
          aria-label="关闭"
          @click="emit('close')"
        >
          ×
        </button>
      </div>

      <dl class="space-y-3 text-sm">
        <div>
          <dt class="font-medium text-muted-strong">来源</dt>
          <dd class="mt-0.5 text-slate-800">{{ skill.source }}</dd>
        </div>
        <div>
          <dt class="font-medium text-muted-strong">路径</dt>
          <dd class="mt-0.5 break-all font-mono text-xs text-muted">
            {{ skill.path }}
          </dd>
        </div>
        <template v-if="skill.description">
          <div>
            <dt class="font-medium text-muted-strong">描述</dt>
            <dd class="mt-0.5 text-slate-800">{{ skill.description }}</dd>
          </div>
        </template>
        <template v-if="skill.whenToUse">
          <div>
            <dt class="font-medium text-muted-strong">何时使用</dt>
            <dd class="mt-0.5 text-slate-800">{{ skill.whenToUse }}</dd>
          </div>
        </template>
      </dl>

      <div
        v-if="skill.raw"
        class="mt-5 border-t border-border pt-5"
      >
        <h3 class="mb-3 text-sm font-medium text-muted-strong">
          SKILL.md 内容
        </h3>
        <div
          class="prose prose-sm max-w-none prose-headings:text-slate-900 prose-p:text-slate-700 prose-code:rounded prose-code:bg-surface-muted prose-code:px-1 prose-code:before:content-none prose-code:after:content-none prose-pre:bg-surface-muted prose-pre:text-slate-800"
          v-html="rawHtml"
        />
      </div>
    </div>
  </div>
</template>
