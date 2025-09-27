import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import pinia from './store';

import './assets/styles/_main.scss';
import NotificationPlugin from './plugins/notifications';

const app = createApp(App);

app.use(router);
app.use(pinia);
app.use(NotificationPlugin);

app.mount('#app');
