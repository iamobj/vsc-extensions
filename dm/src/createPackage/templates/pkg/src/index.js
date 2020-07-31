export default function(privilege) {
    return {
        name: `${privilege}`,
        path: '',
        component: () => import(/* webpackChunkName: "" */''),
    }
}