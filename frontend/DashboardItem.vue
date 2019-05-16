<template>
    <div
        class="dashboard-item"
        :style="{
            'grid-row': rows,
            'grid-column': columns,
        }"
    >
        <div class="dashboard-item__category" v-if="category">
            {{ category }}
        </div>
        <div class="dashboard-item__title" v-if="title">{{ title }}</div>
        <slot :resize="resize"></slot>
    </div>
</template>

<script>
const ROW_SIZE = 60;
export default {
    props: {
        size: {
            type: Number,
            default: 1,
            validator(val) {
                return Number.isInteger(val) && val < 5 && val > 0;
            },
        },
        fetching: {
            type: Boolean,
            default: false,
        },
        title: {
            type: String,
            default: null,
        },
        category: {
            type: String,
            default: null,
        },
    },
    data() {
        return {
            rows: 'span 1',
        };
    },
    created() {
        this.$on('resize', this.resize);
    },
    mounted() {
        this.resize();
    },
    computed: {
        columns() {
            return 'span ' + this.size;
        },
    },
    methods: {
        resize() {
            this.rows = 'span ' + Math.ceil(this.$el.scrollHeight / ROW_SIZE);
        },
    },
};
</script>

<style lang="scss" scoped>
.dashboard-item {
    background: #27293d;
    padding: 10px;
    border-radius: 10px;

    &__title {
        font-size: 1.2rem;
        font-weight: 400;
        margin-bottom: 10px;
    }

    &__category {
        font-size: 0.8rem;
        color: #9a9a9a;
    }
}
</style>
