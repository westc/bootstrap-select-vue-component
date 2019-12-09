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
  ].concat(propMapping.map(function(a){return a.camelName}))
    .reduce(function(props, name) {
      var prop = props[name] = {};
      if (name === 'value') {
        prop.validator = function(value) {
          return value == undefined
            ? []
            : Array.isArray(value)
              ? value.slice()
              : [value];
        };
      }
      return props;
    }, {});

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
    '  @change="changeSelect"',
    '  :id="id"',
    '  :name="name"',
    '  class="form-control bsv-select"',
    '  data-style=""',
    '  data-is-unrendered="true"'
  ].concat(templateArray).concat([
    '  ref="select"',
    '>',
    '  <option v-for="option in realOptions" is-real="1" :value="option.value" :data-subtext="option.subtext" :selected="option.selected">{{ option.text }}</option>',
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
        values = values == undefined ? [] : Array.isArray(values) ? values.slice() : [values];
        
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
        if (jElem.data('is-unrendered')) {
          jElem.data('is-unrendered', false);
        }
        else {
          jElem.selectpicker('destroy');
        }
        jElem.selectpicker();
      },
      refresh: function () {
        jQuery(this.$refs.select).selectpicker('refresh');
      },
      getSelectedIndices: function (values) {
        if (arguments.length === 0) {
          values = this.value;
          values = values == undefined ? [] : Array.isArray(values) ? values.slice() : [values];
        }
        else {
          values = values === undefined
            ? []
            : Array.isArray(values)
              ? values.slice()
              : [values];
        }
        var indices = [];
        var options = this.realOptions.slice();
        for (var vi = 0, vc = values.length; vi < vc; vi++) {
          var value = values[vi];
          for (var oi = 0, oc = options.length; oi < oc; oi++) {
            var option = options[oi];
            var ov = option.value;
            if (value !== value ? ov !== ov : value === ov) {
              indices.push(oi + indices.length);
              options.splice(oi, 1);
              break;
            }
          }
        }
        return indices;
      },
      getSelectedValues: function (values) {
        var options = this.realOptions;
        return this.getSelectedIndices.apply(0, arguments).map(function(index) {
          return options[index].value;
        });
      },
      getOptionElements: function() {
        // Get an array of the current OPTION elements in SELECT excluding any
        // not made with the Vue template.
        var options = this.$refs.select.options;
        for (var arrOptions = [], i = options.length; i--; ) {
          var option = options[i];
          if (option.hasAttribute('is-real')) {
            arrOptions.unshift(option);
          }
        }
        return arrOptions;
      },
      getSelectedOptionElements: function() {
        return this.getOptionElements().filter(function(option) {
          return option.selected;
        });
      },
      getSelectedOptionElementIndices: function() {
        return this.getOptionElements().reduce(function(indices, option, index) {
          if (option.selected) {
            indices.push(index);
          }
          return indices;
        }, []);
      },
      validate: function () {
        this.$emit('input', this.getSelectedValues());
      },
      changeSelect: function () {
        var arrOptions = this.getOptionElements();

        // Real options computed by taking the values stored in `this.options`.
        var realOptions = this.realOptions;

        // Get the selected values
        var values = [];
        for (var i = 0, l = arrOptions.length; i < l; i++) {
          if (arrOptions[i].selected) {
            values.push(realOptions[i].value);
          }
        }

        // Emit an input event with the newly selected values.
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
