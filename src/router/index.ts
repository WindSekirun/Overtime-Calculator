import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import Calculator from "../components/Calculator.vue";

const routes: Array<RouteRecordRaw> = [
    {
        path: "/:date?",
        name: "Calculator",
        component: Calculator
    }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
});

export default router;
