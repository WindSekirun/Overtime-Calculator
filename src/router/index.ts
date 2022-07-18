import Vue from "vue";
import VueRouter, {
    NavigationGuardNext,
    RawLocation,
    Route,
    RouteConfig
} from "vue-router";
import Calculator from "../components/Calculator.vue";

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
    {
        path: "/:date?",
        name: "Calculator",
        component: Calculator
    }
]

const router = new VueRouter({
    routes
});

export default router;