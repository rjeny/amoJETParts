/**
 * Модуль Vuex, в котором отражено наибольшее кол-во возможностей Vuex
 */
import http from 'common/http.js';
import io from 'common/socket.js';
import router from 'router';

export default {
    state: {
        user: localStorage.getItem('user-id') || '',
        token: localStorage.getItem('user-token') || '',
        status: '',
        acl: [],
        userTransformData: null,
    },
    getters: {
        isLoggedIn: state => {
            return !!state.token;
        },
        hasAccess: state => rule => state.acl.includes(rule),
        isTransformed: state => !!state.userTransformData,
        transformData: state => state.userTransformData,
        userID: state => state.user,
    },
    mutations: {
        setUser(state, userId) {
            state.user = userId;
            if (userId) {
                localStorage.setItem('user-id', userId);
            } else {
                localStorage.removeItem('user-id');
            }
            http.defaults.auth.username = userId;
        },
        setToken(state, token) {
            state.token = token;
            if (token) {
                localStorage.setItem('user-token', token);
            } else {
                localStorage.removeItem('user-token');
            }

            http.defaults.auth.password = token;
        },
        setTransformData(state, data) {
            state.userTransformData = data || null;
        },
        setAcl(state, acl) {
            state.acl = Object.keys(acl).reduce(
                (res, resource) =>
                    Object.values(acl[resource].actions).reduce(
                        (actions, action) => (
                            actions.push(resource + '.' + action), actions
                        ),
                        res
                    ),
                []
            );
        },
    },
    actions: {
        login({ commit, dispatch }, [login, password]) {
            return http
                .post('user/auth', {
                    login,
                    password,
                })
                .then(({ data: response }) => {
                    io.emit('join', response.user);
                    commit('setUser', response.user);
                    commit('setToken', response.token);

                    return Promise.all([
                        dispatch('widgets/fetch'),
                        dispatch('fetchUserData'),
                    ]);
                })
                .catch(error => {
                    commit('setUser', null);
                    commit('setToken', null);
                    return Promise.reject(error);
                });
        },
        logout({ commit, state }) {
            io.emit('leave', state.user);
            commit('setUser', null);
            commit('setToken', null);
            commit('erasePersonalData');
            commit('setTransformData', null);
            router.push({
                name: 'login',
            });
            localStorage.clear();
        },
        loginAs({ commit, dispatch }, [userId]) {
            return http
                .post('user/loginas', {
                    user_id: userId,
                })
                .then(({ data: response }) => {
                    commit('setTransformData', {
                        user: http.defaults.auth.username,
                        pass: http.defaults.auth.password,
                    });
                    router.push({
                        name: 'index',
                    });

                    io.emit('join', response.user);
                    commit('setUser', response.user);
                    commit('setToken', response.token);
                    dispatch('widgets/fetch');
                    dispatch('fetchUserData');
                });
        },
        retransfor({ commit, dispatch, getters }) {
            let data = getters.transformData;
            commit('setTransformData', null);

            io.emit('join', data.user);
            commit('setUser', data.user);
            commit('setToken', data.pass);

            router.push({
                name: 'userList',
            });

            return Promise.all([
                dispatch('widgets/fetch'),
                dispatch('fetchUserData'),
            ]);
        },
    },
};
