<template>
  <div v-if="show" class="flex items-center justify-center" :class="fullscreen ? 'fixed inset-0 z-[1400]' : ''">
    <!-- Backdrop -->
    <div v-if="fullscreen" class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="$emit('cancel')"></div>

    <div class="relative w-full max-w-sm mx-4 rounded-2xl bg-white shadow-2xl border border-slate-200 p-8 flex flex-col items-center gap-6 text-center z-10">
      <!-- Spinner -->
      <div :class="spinnerWrapperClasses">
        <!-- Dots -->
        <div v-if="type==='dots'" class="flex gap-2">
          <span v-for="n in 3" :key="n" :class="['w-3 h-3 rounded-full', colorClass, 'animate-bounce']" :style="{ animationDelay: (n-1)*0.15 + 's' }"></span>
        </div>
        <!-- Pulse -->
        <div v-else-if="type==='pulse'" :class="['rounded-full', colorBgClass, 'animate-pulse']" :style="pulseStyle"></div>
        <!-- Ring -->
        <div v-else-if="type==='ring'" class="relative" :style="ringSizeStyle">
          <span :class="['absolute inset-0 rounded-full border-4 border-transparent', ringColorClass, 'animate-spin']" style="border-top-color:currentColor"></span>
        </div>
        <!-- Circle (font awesome) -->
        <i v-else class="fas fa-spinner fa-spin" :class="iconSizeClass"></i>
      </div>

      <!-- Text / Progress -->
      <div v-if="message" class="space-y-3 w-full">
        <h4 v-if="title" class="text-lg font-semibold text-slate-800 m-0">{{ title }}</h4>
        <p class="text-sm text-slate-500 leading-relaxed m-0">{{ message }}</p>
        <div v-if="progress !== null" class="flex items-center gap-3 w-full">
          <div class="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden">
            <div class="h-full rounded-full transition-all duration-300" :class="colorBgClass" :style="{ width: progress + '%' }"></div>
          </div>
          <span class="text-xs font-medium text-slate-500 w-10 text-right">{{ progress }}%</span>
        </div>
      </div>

      <button v-if="cancellable" @click="$emit('cancel')" class="inline-flex items-center gap-2 rounded-lg border border-slate-300 hover:border-slate-400 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-50 transition">
        <i class="fas fa-times"></i>Annuler
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoadingSpinner',

  props: {
    show: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      default: 'circle', // circle, dots, pulse, ring
      validator: value => ['circle', 'dots', 'pulse', 'ring'].includes(value),
    },
    variant: {
      type: String,
      default: 'primary', // primary, secondary, success, warning, danger
      validator: value => ['primary', 'secondary', 'success', 'warning', 'danger'].includes(value),
    },
    size: {
      type: String,
      default: 'medium', // small, medium, large
      validator: value => ['small', 'medium', 'large'].includes(value),
    },
    fullscreen: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: null,
    },
    message: {
      type: String,
      default: null,
    },
    progress: {
      type: Number,
      default: null,
      validator: value => value === null || (value >= 0 && value <= 100),
    },
    cancellable: {
      type: Boolean,
      default: false,
    },
  },

  emits: ['cancel'],
};
 </script>

 <style scoped>
 /* Minimal placeholder (all animations via Tailwind utilities) */
 </style>
  justify-content: center;

  &.spinner-type-circle {
    font-size: 40px;
    color: currentColor;
  }

  &.spinner-type-dots {
    .spinner-dots {
      display: flex;
      gap: 8px;

      .dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: currentColor;
        animation: dotPulse 1.4s ease-in-out infinite both;

        &:nth-child(1) {
          animation-delay: -0.32s;
        }
        &:nth-child(2) {
          animation-delay: -0.16s;
        }
        &:nth-child(3) {
          animation-delay: 0s;
        }
      }
    }
  }

  &.spinner-type-pulse {
    .spinner-pulse {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: currentColor;
      animation: pulse 2s ease-in-out infinite;
    }
  }

  &.spinner-type-ring {
    .spinner-ring {
      display: inline-block;
      position: relative;
      width: 60px;
      height: 60px;

      div {
        box-sizing: border-box;
        display: block;
        position: absolute;
        width: 48px;
        height: 48px;
        margin: 6px;
        border: 6px solid currentColor;
        border-radius: 50%;
        animation: ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
        border-color: currentColor transparent transparent transparent;

        &:nth-child(1) {
          animation-delay: -0.45s;
        }
        &:nth-child(2) {
          animation-delay: -0.3s;
        }
        &:nth-child(3) {
          animation-delay: -0.15s;
        }
      }
    }
  }
}
<!-- legacy styles fully removed -->
