<template>
  <div class="fixed top-5 right-5 z-[9999] max-w-sm w-full pointer-events-none space-y-3">
    <transition-group name="toast" tag="div">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        @click="removeToast(toast.id)"
        class="relative group flex items-start gap-3 rounded-xl bg-white shadow-xl border-l-4 p-4 pr-3 cursor-pointer pointer-events-auto overflow-hidden min-h-[70px] transition-all duration-300 hover:-translate-x-1 hover:shadow-2xl"
        :class="toastTypeClasses(toast.type)"
      >
        <div class="text-xl mt-0.5 shrink-0" :class="toastIconColor(toast.type)">
          <i :class="getToastIcon(toast.type)"></i>
        </div>
        <div class="flex-1 min-w-0">
          <h4
            v-if="toast.title"
            class="text-sm font-semibold text-slate-800 leading-snug mb-1 break-words"
          >
            {{ toast.title }}
          </h4>
          <p class="text-xs text-slate-500 leading-snug break-words">{{ toast.message }}</p>
        </div>
        <button
          class="absolute top-2 right-2 text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-100 transition"
          @click.stop="removeToast(toast.id)"
        >
          <i class="fas fa-times text-sm"></i>
        </button>
        <div
          class="absolute bottom-0 left-0 h-0.5 w-full opacity-40 origin-left animate-toast-progress"
          :style="{ animationDuration: `${toast.duration}ms` }"
          :class="toastBarColor(toast.type)"
        ></div>
      </div>
    </transition-group>
  </div>
</template>

<script>
export default {
  name: 'ToastNotification',

  data() {
    return {
      toasts: [],
      nextId: 1,
    };
  },

  methods: {
    toastTypeClasses(type) {
      const base = '';
      const map = {
        success: 'border-green-500',
        error: 'border-red-500',
        warning: 'border-yellow-500',
        info: 'border-blue-500',
        loading: 'border-indigo-500',
      };
      return [base, map[type] || map.info];
    },
    toastIconColor(type) {
      const map = {
        success: 'text-green-500',
        error: 'text-red-500',
        warning: 'text-yellow-500',
        info: 'text-blue-500',
        loading: 'text-indigo-500',
      };
      return map[type] || map.info;
    },
    toastBarColor(type) {
      const map = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-yellow-500',
        info: 'bg-blue-500',
        loading: 'bg-indigo-500',
      };
      return map[type] || map.info;
    },
    show({ type = 'info', title = null, message, duration = 5000 }) {
      const toast = {
        id: this.nextId++,
        type,
        title,
        message,
        duration,
      };

      this.toasts.push(toast);

      // Auto-remove after duration
      setTimeout(() => {
        this.removeToast(toast.id);
      }, duration);

      return toast.id;
    },

    removeToast(id) {
      const index = this.toasts.findIndex(t => t.id === id);
      if (index > -1) {
        this.toasts.splice(index, 1);
      }
    },

    getToastIcon(type) {
      const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-triangle',
        warning: 'fas fa-exclamation-circle',
        info: 'fas fa-info-circle',
        loading: 'fas fa-spinner fa-spin',
      };
      return icons[type] || icons.info;
    },

    // API methods for easy usage
    success(message, title = null, duration = 4000) {
      return this.show({ type: 'success', title, message, duration });
    },

    error(message, title = 'Erreur', duration = 6000) {
      return this.show({ type: 'error', title, message, duration });
    },

    warning(message, title = 'Attention', duration = 5000) {
      return this.show({ type: 'warning', title, message, duration });
    },

    info(message, title = null, duration = 4000) {
      return this.show({ type: 'info', title, message, duration });
    },

    loading(message, title = 'Chargement...', duration = 10000) {
      return this.show({ type: 'loading', title, message, duration });
    },
  },
};
</script>
<style scoped>
@keyframes toast-progress {
  from {
    transform: scaleX(1);
  }
  to {
    transform: scaleX(0);
  }
}
.animate-toast-progress {
  animation: toast-progress linear forwards;
}
/* Transition group classes (Vue) */
.toast-enter-active {
  transition: all 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.toast-leave-active {
  transition: all 0.3s ease-in;
}
.toast-enter-from,
.toast-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
.toast-move {
  transition: transform 0.3s ease;
}
@media (max-width: 768px) {
  .fixed.top-5.right-5 {
    left: 0;
    right: 0;
  }
}
</style>
