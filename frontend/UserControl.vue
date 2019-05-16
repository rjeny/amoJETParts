<template>
    <div class="user-control">
        <b-dropdown class="is-right">
            <div slot="trigger" class="user-control__trigger">
                <!-- Разные иконки отображаются при воплощении в пользователя -->
                <b-icon
                    class="user-control__pre-icon"
                    :icon="
                        !$store.getters.isTransformed
                            ? 'account'
                            : 'user-secret'
                    "
                />
                <span class="user-control__name">{{ name }}</span>
                <b-icon
                    class="user-control__dropdown-icon"
                    icon="chevron-down"
                />
            </div>
            <b-dropdown-item class="user-control__dropdown-item" has-link>
                <router-link
                    class="is-dark vert-align"
                    :to="{ name: 'userSettings' }"
                >
                    <b-icon class="user-control__link-icon" icon="tune" />
                    <span class="user-control__link-text">Настройки</span>
                </router-link>
            </b-dropdown-item>

            <b-dropdown-item
                class="user-control__dropdown-item"
                v-if="!$store.getters.isTransformed"
                has-link
            >
                <a class="is-dark" @click="logout">
                    <b-icon
                        class="user-control__link-icon"
                        icon="sign-out-alt"
                        size="is-small"
                    />
                    <span class="user-control__link-text"> Выйти </span>
                </a>
            </b-dropdown-item>
            <b-dropdown-item class="user-control__dropdown-item" v-else>
                <a class="is-dark" @click="transformOut" has-link>
                    <b-icon
                        class="user-control__link-icon"
                        icon="sign-out-alt"
                        size="is-small"
                    />
                    <span class="user-control__link-text">Развоплатиться</span>
                </a>
            </b-dropdown-item>
        </b-dropdown>
    </div>
</template>

<script>
export default {
    computed: {
        name() {
            return this.$store.getters.getName;
        },
    },
    methods: {
        logout() {
            this.$store.dispatch('logout');
        },
        transformOut() {
            this.$store.dispatch('retransfor');
        },
    },
};
</script>

<style lang="scss">
.user-control {
    display: flex;
    cursor: pointer;

    &__dropdown-item {
        color: #333;
    }

    &__trigger {
        display: flex;
        align-items: center;
    }

    &__link-icon {
        margin-right: 5px;
    }
}
</style>
