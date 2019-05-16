<template>
    <div class="search-module">
        <b-autocomplete
            v-model="query"
            placeholder="Поиск"
            :expanded="true"
            :data="searchResult"
            @select="onSelect"
            :loading="isFetching"
            @keyup.native="onKeyUp"
            class="search-module__autocomplete"
            id="searchInput"
        >
            <small slot="header" class="is-small" v-if="accountsCount > 10">
                Не показано {{ accountsCount - 10 }} результатов.
                <span class="keyboard-key">⏎</span>
                или
                <router-link
                    :to="{
                        name: 'amoList',
                        query: { query: query },
                    }"
                >
                    ссылка
                </router-link>
                для получения всех результатов.
            </small>
            <!-- Необходимо чтобы при условных слотах хоть что-то было-->
            <template v-else slot="header"></template>
            <template slot-scope="props">
                <div class="search-module__result-item">
                    <icon-by-type :type="props.option.type" />
                    <div class="search-module__item-icon">
                        <span class="search-module__item-title">
                            {{ props.option.title }}
                        </span>
                        <small class="search-module__item-description">
                            {{ props.option.description }}
                        </small>
                    </div>
                </div>
            </template>
            <template slot="search-module__no-results">
                Ничего не найдено
            </template>
        </b-autocomplete>
    </div>
</template>

<script>
import { debounce } from 'lodash/function';
import * as GETTER from '../common/getters';
import Vue from 'vue';

const metaByType = {
    widget: {
        icon: 'widgets',
        alias: 'Виджет',
        urlPattern: '/widgets/:id:',
    },
    amo: {
        icon: 'account-multiple-outline',
        alias: 'amoCRM',
        urlPattern: '/:id:',
    },
};

const IconByType = Vue.component('icon-by-type', {
    template: `<div class="icon-wrapper-by-type">
                    <b-icon :icon="getIconByType(type)" />
                    <small>{{ getAliasByType(type) }}</small>
                </div>`,
    methods: {
        getIconByType(type) {
            return type ? metaByType[type].icon : '';
        },
        getAliasByType(type) {
            return type ? metaByType[type].alias : '';
        },
    },
    props: {
        type: String,
    },
});

const amoMapper = amo => ({
    type: 'amo',
    title: amo.alias,
    description: amo.subdomain + '.' + amo.main_domain,
    id: amo.subdomain,
});

const widgetsMapper = widget => ({
    type: 'widget',
    title: widget.name,
    description: widget.desc,
    id: widget.id,
});

const findAll = query =>
    Promise.all([GETTER.findAmo(query), GETTER.findWidgets(query)]).then(
        ([amo, widget]) => {
            return [...amo.map(amoMapper), ...widget.map(widgetsMapper)];
        }
    );

export default {
    components: { IconByType },
    data: function() {
        return {
            searchResult: [],
            query: '',
            isFetching: false,
            accountsCount: 0,
        };
    },
    methods: {
        onKeyUp(event) {
            // Обработка события нажатия кнопки 'Enter
            // Если результат один переходим в него, несколько редиректим на поиск по аккаунтам
            if (event.keyCode === 13) {
                if (this.searchResult.length === 1) {
                    this.onSelect(this.searchResult[0]);
                } else if (this.searchResult.length > 1) {
                    this.$router.push({
                        name: 'amoList',
                        query: { query: this.query },
                    });
                }
                return;
            }

            this.getAsyncData();
        },
        getAsyncData: debounce(function() {
            if (!this.query) {
                return;
            }

            this.isFetching = true;

            findAll(this.query)
                .then(result => {
                    this.searchResult = result;
                })
                .finally(() => {
                    this.isFetching = false;
                });
        }, 500),
        onSelect(option) {
            if (!option) {
                return;
            }
            this.query = '';
            this.$emit('finished');
            this.$router.push(this.getRouteByTypeAndId(option.type, option.id));
        },
        getRouteByTypeAndId(type, id) {
            return type ? metaByType[type].urlPattern.replace(':id:', id) : '';
        },
    },
};
</script>

<style lang="scss">
.search-module {
    &__autocomplete input {
        height: 60px;
        background: #fff;
        color: #333;
    }

    &__result {
        display: flex;
    }

    &__autocomplete .dropdown-content {
        background: none;
        min-height: 200px;
        max-height: 60vh;
    }

    &__autocomplete .dropdown-item {
        background: #fff;
        margin-bottom: 10px;
    }

    &__result-item {
        display: flex;
        align-items: center;
    }

    &__item-title {
        display: block;
        font-weight: 600;
    }
}

.icon-wrapper-by-type {
    width: 80px;
    display: flex;
    flex-direction: column;
    align-items: center;
}
</style>
