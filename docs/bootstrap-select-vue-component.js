(function () {
  var propMapping = [
    'actionsBox',
    'countSelectedText',
    'deselectAllText',
    'dropdownAlignRight',
    'dropupAuto',
    'header',
    'hideDisabled',
    'iconBase',
    'liveSearch',
    'liveSearchNormalize',
    'liveSearchPlaceholder',
    'liveSearchStyle',
    'maxOptions',
    'maxOptionsText',
    'mobile',
    'multipleSeparator',
    'noneResultsText',
    'noneSelectedText',
    { camel: 'nullText', dash: 'title' },
    'selectAllText',
    'selectedTextFormat',
    'selectOnTab',
    'showContent',
    'showIcon',
    'showSubtext',
    'showTick',
    'size',
    'tickIcon',
    'virtualScroll',
    'width',
    'windowPadding'
  ].map(function(a) {
    a = 'object' === typeof a ? a : { camel: a, dash: a };
    return {
      camelName: a.camel,
      dashName: a.dash.replace(/[A-Z]/g, '-$&').toLowerCase()
    }
  });

  var props = [
    'value',
    'options',
    'multiple',
    'valueKey',
    'textKey',
    'subtextKey',
    'id',
    'name'
  ].concat(propMapping.map(function(a){return a.camelName}));

  var watch = {
    // NOTE:  This will be called twice whenever the value is set as a non-array.
    value: function (newValue) {
      var values = Array.isArray(newValue) ? newValue.slice() : [newValue];
      var options = this.realOptions.slice();
      for (var value, valI = 0, valL = values.length; valI < valL; valI++) {
        var value = values[valI];
        for (var optI = 0, optL = options.length; optI < optL; optI++) {
          var opt = options[optI];
          if (value !== value ? opt.value !== opt.value : (value === opt.value)) {
            options.splice(optI, 1);
            break;
          }
        }
        if (optI === optL) {
          values.splice(valI, 1);
        }
      }

      // Make sure to refresh this.value if necessary.
      var propValue = this.value;
      if (Array.isArray(propValue) && propValue.length === values.length) {
        for (var i = propValue.length; i--;) {
          var v = propValue[i];
          if (propValue === propValue ? v !== values[i] : values[i] === values[i]) {
            this.$emit('input', values);
            break;
          }
        }
      }
      else if (this.value !== values) {
        this.$emit('input', values);
      }
    }
  };

  propMapping.forEach(function(a) {
    watch[a.camelName] = function (value) {
      jQuery(this.$refs.select).data(a.dashName, value);
      this.rerender();
    };
  });

  var templateArray = propMapping.map(function(a) {
    return '  :data-' + a.dashName + '="' + a.camelName + '"';
  });
  templateArray = [
    '<select',
    '  :multiple="multiple"',
    '  v-on:change="changeSelect"',
    '  :id="id"',
    '  :name="name"',
    '  class="form-control bsv-select"',
    '  data-style=""'
  ].concat(templateArray).concat([
    '  ref="select"',
    '>',
    '  <option v-for="option in realOptions" v-bind:value="option.value" :data-subtext="option.subtext" :selected="option.selected">{{ option.text }}</option>',
    '</select>'
  ]);
  var template = templateArray.join('\n');

  Vue.component('bootstrap-select', {
    props: props,
    mounted: function () {
      this.rerender();
      this.changeSelect();
    },
    updated: function () {
      this.refresh();
    },
    watch: watch,
    computed: {
      realOptions: function () {
        var valueKey = this.valueKey == undefined ? 'value' : this.valueKey;
        var textKey = this.textKey == undefined ? 'text' : this.textKey;
        var subtextKey = this.subtextKey == undefined ? 'subtext' : this.subtextKey;
        var showSubtext = this.showSubtext;
        
        var values = this.value;
        values = Array.isArray(values) ? values.slice() : [values];
        
        var options = this.options;
        options = Array.isArray(options) ? options.slice() : [options];
        
        return options.map(function (value, index) {
          var option;
          if ('object' === typeof value && value != undefined) {
            option = { value: value[valueKey], text: value[textKey], subtext: showSubtext ? value[subtextKey] : undefined };
          }
          else {
            option = { value: value, text: value };
          }

          // Determine if this option is selected.
          option.selected = false;
          for (var i = 0, l = values.length; i < l; i++) {
            value = values[i];
            if (option.selected = value !== value ? option.value !== option.value : (option.value === value)) {
              values.splice(i, 1);
              break;
            }
          }
          return option;
        });
      }
    },
    methods: {
      rerender: function () {
        var jElem = jQuery(this.$refs.select);
        jElem.selectpicker('destroy');
        jElem.selectpicker();
      },
      refresh: function () {
        jQuery(this.$refs.select).selectpicker('refresh');
      },
      changeSelect: function () {
        var options = this.$refs.select.options;
        var realOptions = this.realOptions;
        if (options.length != realOptions.length) {
          console.log({
            outerHTML: this.$refs.select.outerHTML,
            options: [].slice.call(options).map(o => ({ html: o.innerHTML, value: o.value })),
            realOptions: JSON.parse(JSON.stringify(realOptions))
          });
        }
        var values = [];
        for (var i = 0, l = Math.min(options.length, realOptions.length); i < l; i++) {
          if (options[i].selected) {
            values.push(realOptions[i].value);
          }
        }
        this.$emit('input', values);
      }
    },
    template: template
  });

  // Adds the .bsv-select style.
  var style = document.createElement('style');
  style.innerHTML = '.bsv-select { border: 1px solid #ced4da !important; }';
  document.head.appendChild(style);
})();
