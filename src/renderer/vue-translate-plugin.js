function getValueByDsvKey (obj, key, dsv) {
        key = key || '';
        obj = obj || {};
        dsv = dsv || '.';
 
        var keys = key.split('.');
        var value = obj;
 
        for (var layer = 0, recursive = keys.length; layer <= recursive - 1; layer++) {
            if(!value[keys[layer]]){
                // console.log( key)
                return false
            }
                value = value[keys[layer]]
            }   
        return value;
}

/**
 * VueTranslate plugin v1.2.0
 *
 * Handle basic translations in VueJS
 *
 * This is a plugin to handle basic translations for a component in VueJS. * @author Javis Perez <javisperez@gmail.com>
 * https://github.com/javisperez/vuetranslate
 * Released under the MIT License.
 */

// We need a vue instance to handle reactivity
var vm = null;

// The plugin
var VueTranslate = {

    // Install the method
    install: function (Vue) {
        var _Vue$mixin;

        var version = Vue.version[0];

        if (!vm) {
            vm = new Vue({
                data: function () {
                    return {
                        current: '',
                        locales: {}
                    };
                },


                computed: {
                    // Current selected language
                    lang: function () {
                        return this.current;
                    },


                    // Current locale values
                    locale: function () {
                        if (!this.locales[this.current]) return null;

                        return this.locales[this.current];
                    }
                },

                methods: {
                    // Set a language as current
                    setLang: function (val) {
                        if (this.current !== val) {
                            if (this.current === '') {
                                this.$emit('language:init', val);
                            } else {
                                this.$emit('language:changed', val);
                            }
                        }

                        this.current = val;

                        this.$emit('language:modified', val);
                    },


                    // Set a locale tu use
                    setLocales: function (locales) {
                        if (!locales){
                            return;
                        } 

                        var newLocale = Object.create(this.locales);

                        for (var key in locales) {
                            if (!newLocale[key]) newLocale[key] = {};

                            Vue.util.extend(newLocale[key], locales[key]);
                        }

                        this.locales = Object.create(newLocale);

                        this.$emit('locales:loaded', locales);
                    },
                    text: function (t) {
                        return getValueByDsvKey(this.locale,t);
                    }
                }
            });

            Vue.prototype.$translate = vm;
        }

        // Mixin to read locales and add the translation method and directive
        Vue.mixin((_Vue$mixin = {}, _Vue$mixin[version === '1' ? 'init' : 'beforeCreate'] = function () {
            this.$translate.setLocales(this.$options.locales);
        }, _Vue$mixin.methods = {
            // An alias for the .$translate.text method
            t: function (t) {
                return this.$translate.text(t);
            }
        }, _Vue$mixin.directives = {
            translate: function (el) {
                if (!el.$translateKey) el.$translateKey = el.innerText;

                var text = this.$translate.text(el.$translateKey);

                el.innerText = text;
            }.bind(vm)
        }, _Vue$mixin));

        // Global method for loading locales
        Vue.locales = function (locales) {
            vm.$translate.setLocales(locales);
        };
    }
}
export default VueTranslate; // CommonJS
