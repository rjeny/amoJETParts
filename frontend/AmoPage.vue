<template>
    <main class="amo-page">
        <h2 class="title amo-page__title">
            {{ this.amoAdmin.alias }}
            <a
                v-if="$store.getters.hasAccess('amo.enter')"
                class="amo-page__amo_link button button_type_is-amoIn is-small"
                :href="this.link"
                target="_blank"
            >
                Войти в amoCRM
            </a>
        </h2>
        <b-message
            class="amo-page__free-install-message"
            v-if="isDefault"
            type="is-success"
        >
            Установка виджетов в этот аккаунт бесплатна
        </b-message>
        <span
            v-if="!amoAdmin.valid_auth"
            class="amo-page__auth-error-message has-text-danger"
        >
            <b-icon icon="times" />
            <span>Авторизационные данные неверны</span>
        </span>
        <b-tabs class="amo-page__nav-tabs" v-model="tabIndex">
            <b-tab-item
                class="amo-page__tab amo-installations"
                label="Виджеты"
                icon="box-open"
            >
                <template v-if="tabIndex === 0">
                    <button
                        class="button amo-installations__button-install"
                        @click="openInstallModal"
                        v-if="amoAdmin.valid_auth"
                    >
                        <span>Установить виджет</span>
                    </button>
                    <h3 class="amo-installations__subtitle subtitle">
                        Установленные виджеты
                    </h3>
                    <div
                        class="amo-installations__widget-list widgets-wrap cards"
                    >
                        <widget-card
                            v-for="installation in ownInstallations"
                            :key="installation.id"
                            :widget-id="installation.widget_id"
                            :installation="installation"
                        />
                    </div>
                    <h3 class="amo-installations__subtitle subtitle">
                        Установлены партнерами
                    </h3>
                    <div
                        class="amo-installations__widget-list widgets-wrap cards"
                    >
                        <widget-card
                            v-for="installation in partnerInstallations"
                            :key="installation.id"
                            :widget-id="installation.widget_id"
                            :installation="installation"
                        />
                    </div>
                </template>
            </b-tab-item>
            <b-tab-item
                label="Настройки"
                icon="cogs"
                :disabled="!$store.getters.hasAccess('amo.enter')"
                class="amo-page__tab amo-settings"
            >
                <div class="amo-settings__list">
                    <div class="amo-settings__row settings-row columns">
                        <div class="column is-2">
                            <div>
                                <span class="settings-row__name"
                                    >ID аккаунта</span
                                >
                                <div class="settings-row__content">
                                    {{ amoData.account_id }}
                                </div>
                            </div>
                        </div>
                        <div class="column is-2">
                            <div>
                                <span class="settings-row__name"
                                    >ID пользователя</span
                                >
                                <div class="settings-row__content">
                                    {{ amoAdmin.amo_user_id }}
                                </div>
                            </div>
                        </div>
                        <div class="column is-4">
                            <div>
                                <span class="settings-row__name"
                                    >Название аккаунта</span
                                >
                                <div class="settings-row__content">
                                    <b-input
                                        v-model="amoAdmin.alias"
                                        maxlength="255"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="amo-settings__row settings-row columns">
                        <div class="column is-5">
                            <div>
                                <span class="settings-row__name">Домен</span>
                                <div class="settings-row__content">
                                    <b-field>
                                        <b-input
                                            v-model="amoData.subdomain"
                                            placeholder="поддомен"
                                            expanded
                                            custom-class="has-text-right"
                                            @blur="
                                                amoData.subdomain = amoData.subdomain
                                                    .toLowerCase()
                                                    .replace(/[\s\.]+/g, '')
                                            "
                                        />
                                        <b-select
                                            placeholder="Доменное имя"
                                            v-model="amoData.main_domain"
                                        >
                                            <option
                                                v-for="option in [
                                                    'amocrm.ru',
                                                    'amocrm.com',
                                                ]"
                                                :value="option"
                                                :key="option"
                                                >{{ option }}</option
                                            >
                                        </b-select>
                                    </b-field>
                                </div>
                            </div>
                        </div>
                        <div class="column">
                            <div>
                                <span class="settings-row__name"
                                    >Авторизационные данные</span
                                >
                                <div class="settings-row__content">
                                    <b-field horizontal label="Логин">
                                        <b-input v-model="amoAdmin.email" />
                                    </b-field>
                                    <b-field horizontal label="API ключ">
                                        <b-input
                                            v-model="amoAdmin.api_key"
                                            @blur="
                                                amoAdmin.api_key = amoAdmin.api_key
                                                    .toLowerCase()
                                                    .replace(/[\s\.]+/g, '')
                                            "
                                        />
                                    </b-field>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <button
                    class="amo-settings__save-button button is-success"
                    @click="saveData"
                >
                    Сохранить
                </button>
            </b-tab-item>
        </b-tabs>
    </main>
</template>

<script>
import WidgetCard from 'widgets/Card.vue';
import http from 'common/http.js';
import io from 'common/socket.js';

export default {
    components: { WidgetCard },
    data() {
        return {
            amoData: {},
            amoAdmin: {},
            isDefault: false,
            installations: [],
            installWidgetModal: false,
            tabIndex: 0,
        };
    },
    methods: {
        openInstallModal() {
            this.$router.push({
                path: '/install/' + this.amoAdmin.id,
                query: {
                    installed: this.installations.reduce(
                        (arr, installation) => (
                            arr.push(installation.widget_id), arr
                        ),
                        []
                    ),
                    isDefault: this.isDefault,
                },
            });
        },
        saveData() {
            this.$http
                .post('amo/update', this.amoAdmin)
                .then(() => {
                    this.amoAdmin.valid_auth = true;
                })
                .catch(error => {
                    this.$snackbar.open({
                        message: error,
                        type: 'is-warning',
                        position: 'is-top',
                        indefinite: false,
                    });
                });
        },
        setData(data) {
            this.amoData = data.amo;
            this.amoAdmin = data.admin;
            this.installations = data.installations;
            this.isDefault = data.is_default;
        },
    },
    computed: {
        link() {
            return `https://${this.amoData.subdomain}.${
                this.amoData.main_domain
            }
                    /?USER_LOGIN=${this.amoAdmin.email}
                    &USER_HASH=${this.amoAdmin.api_key}`;
        },
        ownInstallations() {
            return this.installations.filter(
                installation => installation.amo_id == this.amoAdmin.id
            );
        },
        partnerInstallations() {
            return this.installations.filter(
                installation => installation.amo_id != this.amoAdmin.id
            );
        },
    },
    beforeRouteEnter(to, from, next) {
        http.get('amo/get/' + to.params.amo)
            .then(({ data }) => {
                next(vm => {
                    // Вешаем слушателя вебсокета для этой страницы, чтобы оперативно обновлять информацию
                    io.on('installation', data => {
                        let installationTo = vm.installations.find(row => {
                            return row.id === data.installation_id;
                        });
                        if (installationTo) {
                            installationTo.status = data.status;
                            installationTo.status_message = data.msg;
                            installationTo.version = data.version;
                        }
                    });
                    vm.setData(data);
                });
            })
            .catch(() => {
                next('/404');
            });
    },
    // если путь изменяется, а компонент уже отображён,
    // то логика будет немного иной
    beforeRouteUpdate(to, from, next) {
        this.post = null;
        http.get('amo/get/' + to.params.amo)
            .then(({ data }) => {
                this.setData(data);
                next();
            })
            .catch(() => {
                next('/404');
            });
    },
    beforeRouteLeave(to, from, next) {
        io.off('installation');
        next();
    },
};
</script>

<style lang="scss">
.amo-installations__widget-list {
    display: flex;
    height: min-content;
    flex-wrap: wrap;
    align-items: baseline;
    justify-content: flex-start;
}

.settings-row {
    &__name {
        font-weight: 600;
        font-size: 1.1rem;
        display: block;
        border-bottom: 1px solid #eee;
    }

    &__content {
        padding: 5px 0;
    }

    & > div > div {
        background: #fff;
        padding: 10px;

        &.has-background-success,
        &.has-background-danger {
            color: #fff;
        }
    }
}
</style>
