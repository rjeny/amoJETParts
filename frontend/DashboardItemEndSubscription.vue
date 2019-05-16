<template>
    <dashboard-item v-bind="$attrs" title="Скоро заканчивается подписка">
        <template v-slot="props">
            <v-server-table
                url="installation/fireinstallation"
                :columns="installationTableColumns"
                :options="tableOptions"
                name="widgetpage"
                ref="table"
                @loaded="props.resize"
            >
                <div slot="alias" slot-scope="props">
                    <strong>
                        <router-link
                            class="toAmo"
                            :to="{
                                name: 'amoPage',
                                params: { amo: props.row.subdomain },
                            }"
                            >{{ props.row.alias }}</router-link
                        >
                    </strong>
                </div>
                <div slot="name" slot-scope="props">
                    <strong>
                        <router-link
                            class="toAmo"
                            :to="{
                                name: 'widgetPage',
                                params: { id: props.row.widget_id },
                            }"
                            >{{ props.row.name }}</router-link
                        >
                    </strong>
                </div>
                <div slot="install_for" slot-scope="props">
                    {{ toLocaleTime(props.row.install_for) }}
                </div>
            </v-server-table>
        </template>
    </dashboard-item>
</template>

<script>
import dayjs from 'dayjs';
import DashboardItem from 'components/DashboardItem.vue';

export default {
    components: {
        DashboardItem,
    },
    inheritAttrs: false,
    data() {
        return {
            installationTableColumns: ['name', 'alias', 'install_for'],
            tableOptions: {
                uniqueKey: 'id',
                sortable: [],
                filterByColumn: false,
                filterable: false,
                headings: {
                    name: 'Виджет',
                    alias: 'Аккаунт amoCRM',
                    install_for: 'Дата окончания работы',
                },
            },
        };
    },
    methods: {
        toLocaleTime(date) {
            dayjs.locale('ru');
            return dayjs(date).format('DD.MM.YYYY');
        },
        loaded() {
            this.$parent.$emit('resize');
        },
    },
};
</script>

<style scoped></style>
